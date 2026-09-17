def _register_and_auth_headers(client, unique_email):
    resp = client.post(
        "/api/auth/register",
        json={"username": "user_" + unique_email[5:13], "email": unique_email, "password": "pw12345"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_and_list_projects(client, unique_email):
    headers = _register_and_auth_headers(client, unique_email)

    resp = client.post("/api/projects", json={"name": "Website Revamp", "description": "Q3 project"}, headers=headers)
    assert resp.status_code == 201, resp.text
    project = resp.json()
    assert project["name"] == "Website Revamp"

    resp2 = client.get("/api/projects", headers=headers)
    assert resp2.status_code == 200
    assert any(p["id"] == project["id"] for p in resp2.json())


def test_project_isolated_per_user(client, unique_email):
    headers_a = _register_and_auth_headers(client, unique_email)
    client.post("/api/projects", json={"name": "Alice's project"}, headers=headers_a)

    other_email = "other-" + unique_email
    headers_b = _register_and_auth_headers(client, other_email)
    resp = client.get("/api/projects", headers=headers_b)
    assert resp.status_code == 200
    assert all(p["name"] != "Alice's project" for p in resp.json())


def test_task_lifecycle(client, unique_email):
    headers = _register_and_auth_headers(client, unique_email)
    project = client.post("/api/projects", json={"name": "Task Test Project"}, headers=headers).json()
    project_id = project["id"]

    created = client.post(
        f"/api/projects/{project_id}/tasks", json={"title": "Write tests"}, headers=headers
    )
    assert created.status_code == 201
    task = created.json()
    assert task["status"] == "todo"

    updated = client.patch(
        f"/api/projects/{project_id}/tasks/{task['id']}",
        json={"status": "done"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "done"

    listed = client.get(f"/api/projects/{project_id}/tasks", headers=headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    deleted = client.delete(f"/api/projects/{project_id}/tasks/{task['id']}", headers=headers)
    assert deleted.status_code == 204

    listed_after = client.get(f"/api/projects/{project_id}/tasks", headers=headers)
    assert len(listed_after.json()) == 0


def test_cannot_access_another_users_project(client, unique_email):
    headers_a = _register_and_auth_headers(client, unique_email)
    project = client.post("/api/projects", json={"name": "Private"}, headers=headers_a).json()

    other_email = "intruder-" + unique_email
    headers_b = _register_and_auth_headers(client, other_email)
    resp = client.get(f"/api/projects/{project['id']}", headers=headers_b)
    assert resp.status_code == 403
