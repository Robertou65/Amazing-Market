def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_register_login_me_happy_path(client):
    payload = {
        "username": "alice",
        "email": "alice@example.com",
        "phone": "3000000001",
        "password": "supersecret",
        "birthdate": "1990-01-01",
    }

    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201, res.text
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == payload["email"]

    token = data["access_token"]

    me = client.get("/api/auth/me", headers=auth_headers(token))
    assert me.status_code == 200
    me_data = me.json()
    assert me_data["email"] == payload["email"]

    login = client.post("/api/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert login.status_code == 200
    assert "access_token" in login.json()


def test_login_invalid_credentials_401(client):
    res = client.post("/api/auth/login", json={"email": "missing@example.com", "password": "nope"})
    assert res.status_code == 401


def test_me_requires_auth_403_or_401(client):
    # HTTPBearer returns 403 when missing header in FastAPI/Starlette
    res = client.get("/api/auth/me")
    assert res.status_code in (401, 403)
