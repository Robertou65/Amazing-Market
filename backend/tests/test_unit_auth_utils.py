import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

import app.auth_utils as auth_utils


def test_hash_password_not_equal_plaintext():
    hashed = auth_utils.hash_password("secret")
    assert hashed != "secret"
    assert isinstance(hashed, str)


def test_hash_password_is_salted():
    h1 = auth_utils.hash_password("secret")
    h2 = auth_utils.hash_password("secret")
    assert h1 != h2


def test_verify_password_success():
    hashed = auth_utils.hash_password("secret")
    assert auth_utils.verify_password("secret", hashed) is True


def test_verify_password_failure():
    hashed = auth_utils.hash_password("secret")
    assert auth_utils.verify_password("wrong", hashed) is False


def test_create_and_decode_access_token_roundtrip_contains_sub(monkeypatch):
    token = auth_utils.create_access_token({"sub": "123"})
    payload = auth_utils.decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "123"
    assert "exp" in payload


def test_decode_access_token_invalid_returns_none():
    assert auth_utils.decode_access_token("not-a-jwt") is None


@pytest.mark.asyncio
async def test_get_current_user_invalid_token_raises_401():
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="not-a-jwt")
    with pytest.raises(HTTPException) as exc:
        await auth_utils.get_current_user(creds)
    assert exc.value.status_code == 401
