import io

from moto import mock_aws


def _register_and_auth_headers(client, unique_email):
    resp = client.post(
        "/api/auth/register",
        json={"username": "user_" + unique_email[5:13], "email": unique_email, "password": "pw12345"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@mock_aws
def test_upload_list_and_delete_attachment(client, unique_email):
    headers = _register_and_auth_headers(client, unique_email)
    project = client.post("/api/projects", json={"name": "Files Project"}, headers=headers).json()
    task = client.post(
        f"/api/projects/{project['id']}/tasks", json={"title": "Upload spec"}, headers=headers
    ).json()

    file_content = b"hello from a test file"
    resp = client.post(
        f"/api/projects/{project['id']}/tasks/{task['id']}/attachments",
        files={"file": ("spec.txt", io.BytesIO(file_content), "text/plain")},
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    attachment = resp.json()
    assert attachment["filename"] == "spec.txt"
    assert attachment["size_bytes"] == len(file_content)
    assert attachment["download_url"].startswith("http")

    listed = client.get(
        f"/api/projects/{project['id']}/tasks/{task['id']}/attachments", headers=headers
    )
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    deleted = client.delete(
        f"/api/projects/{project['id']}/tasks/{task['id']}/attachments/{attachment['id']}",
        headers=headers,
    )
    assert deleted.status_code == 204

    listed_after = client.get(
        f"/api/projects/{project['id']}/tasks/{task['id']}/attachments", headers=headers
    )
    assert len(listed_after.json()) == 0


@mock_aws
def test_attachment_requires_task_ownership(client, unique_email):
    headers_a = _register_and_auth_headers(client, unique_email)
    project = client.post("/api/projects", json={"name": "Owner Files"}, headers=headers_a).json()
    task = client.post(
        f"/api/projects/{project['id']}/tasks", json={"title": "Secret task"}, headers=headers_a
    ).json()

    other_email = "nosy-" + unique_email
    headers_b = _register_and_auth_headers(client, other_email)
    resp = client.post(
        f"/api/projects/{project['id']}/tasks/{task['id']}/attachments",
        files={"file": ("x.txt", io.BytesIO(b"data"), "text/plain")},
        headers=headers_b,
    )
    assert resp.status_code == 403
