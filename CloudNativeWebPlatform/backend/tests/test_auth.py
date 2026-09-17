def test_register_and_login(client, unique_email):
    resp = client.post(
        "/api/auth/register",
        json={"username": "alice_" + unique_email[5:13], "email": unique_email, "password": "pw12345"},
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["user"]["email"] == unique_email
    assert body["access_token"]

    resp2 = client.post("/api/auth/login", json={"email": unique_email, "password": "pw12345"})
    assert resp2.status_code == 200
    assert resp2.json()["access_token"]


def test_login_wrong_password_rejected(client, unique_email):
    client.post(
        "/api/auth/register",
        json={"username": "bob_" + unique_email[5:13], "email": unique_email, "password": "correct-pw"},
    )
    resp = client.post("/api/auth/login", json={"email": unique_email, "password": "wrong-pw"})
    assert resp.status_code == 401


def test_duplicate_registration_rejected(client, unique_email):
    payload = {"username": "carl_" + unique_email[5:13], "email": unique_email, "password": "pw12345"}
    first = client.post("/api/auth/register", json=payload)
    assert first.status_code == 201
    second = client.post("/api/auth/register", json=payload)
    assert second.status_code == 409


def test_protected_route_requires_token(client):
    resp = client.get("/api/projects")
    assert resp.status_code == 401
