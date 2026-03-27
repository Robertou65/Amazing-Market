import pytest
from contextlib import contextmanager

from fastapi import HTTPException

import app.auth_utils as auth_utils
import app.routers.cart as cart_router
from app.models import AddToCartRequest, UpdateCartItemRequest, UserResponse


@pytest.fixture()
def patched_db(monkeypatch, sqlite_db):
    # Wrap the sqlite connection with the same adapter used in conftest's client fixture.
    from tests.conftest import SQLiteConnection

    wrapped = SQLiteConnection(sqlite_db)

    @contextmanager
    def _get_db_connection():
        yield wrapped

    monkeypatch.setattr(cart_router, "get_db_connection", _get_db_connection)
    monkeypatch.setattr(auth_utils, "get_db_connection", _get_db_connection)

    return wrapped


def _insert_user(conn, username="u", email="u@example.com", phone="3000000009") -> int:
    cur = conn.cursor(dictionary=True)
    hashed = auth_utils.hash_password("pw")
    cur.execute(
        "INSERT INTO users (username, email, phone, password, birthdate) VALUES (%s, %s, %s, %s, %s)",
        (username, email, phone, hashed, "1990-01-01"),
    )
    conn.commit()
    uid = cur.lastrowid
    cur.close()
    return int(uid)


def test_get_or_create_cart_creates_then_reuses(patched_db):
    user_id = _insert_user(patched_db, username="c1", email="c1@example.com", phone="3000000010")

    cart_id_1 = cart_router.get_or_create_cart(user_id, patched_db)
    cart_id_2 = cart_router.get_or_create_cart(user_id, patched_db)

    assert cart_id_1 == cart_id_2


@pytest.mark.asyncio
async def test_update_cart_item_quantity_negative_raises_400(patched_db):
    user_id = _insert_user(patched_db, username="c2", email="c2@example.com", phone="3000000011")
    user = UserResponse(id=user_id, username="c2", email="c2@example.com", phone="3000000011", birthdate="1990-01-01")

    with pytest.raises(HTTPException) as exc:
        await cart_router.update_cart_item(1, UpdateCartItemRequest(quantity=-1), current_user=user)

    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_add_to_cart_missing_product_404(patched_db):
    user_id = _insert_user(patched_db, username="c3", email="c3@example.com", phone="3000000012")
    user = UserResponse(id=user_id, username="c3", email="c3@example.com", phone="3000000012", birthdate="1990-01-01")

    with pytest.raises(HTTPException) as exc:
        await cart_router.add_to_cart(AddToCartRequest(product_id=999, quantity=1), current_user=user)

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_checkout_creates_order_and_clears_cart(patched_db):
    user_id = _insert_user(patched_db, username="c4", email="c4@example.com", phone="3000000013")
    user = UserResponse(id=user_id, username="c4", email="c4@example.com", phone="3000000013", birthdate="1990-01-01")

    # Add item directly into cart tables
    cart_id = cart_router.get_or_create_cart(user_id, patched_db)
    cur = patched_db.cursor(dictionary=True)
    cur.execute("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (%s, %s, %s)", (cart_id, 2, 2))
    patched_db.commit()
    cur.close()

    # Stock before
    cur = patched_db.cursor(dictionary=True)
    cur.execute("SELECT stock FROM products WHERE id = %s", (2,))
    before = cur.fetchone()["stock"]
    cur.close()

    res = await cart_router.checkout(current_user=user)
    assert res.order_id >= 1

    # Cart emptied
    cur = patched_db.cursor(dictionary=True)
    cur.execute("SELECT COUNT(*) as n FROM cart_items WHERE cart_id = %s", (cart_id,))
    assert cur.fetchone()["n"] == 0
    cur.close()

    # Stock reduced
    cur = patched_db.cursor(dictionary=True)
    cur.execute("SELECT stock FROM products WHERE id = %s", (2,))
    after = cur.fetchone()["stock"]
    cur.close()

    assert after == before - 2
