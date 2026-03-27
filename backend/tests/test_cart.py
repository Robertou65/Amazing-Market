def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _register_and_token(client) -> str:
    payload = {
        "username": "bob",
        "email": "bob@example.com",
        "phone": "3000000002",
        "password": "supersecret",
        "birthdate": "1992-02-02",
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201, res.text
    return res.json()["access_token"]


def test_cart_flow_endpoints(client):
    token = _register_and_token(client)
    headers = auth_headers(token)

    # GET cart (creates empty cart)
    cart = client.get("/api/cart", headers=headers)
    assert cart.status_code == 200
    cart_body = cart.json()
    assert cart_body["items"] == []
    assert cart_body["total"] == 0

    # Add product
    add = client.post("/api/cart/items", headers=headers, json={"product_id": 1, "quantity": 2})
    assert add.status_code == 201, add.text

    # Update quantity
    upd = client.put("/api/cart/items/1", headers=headers, json={"quantity": 1})
    assert upd.status_code == 200

    # Remove
    rm = client.delete("/api/cart/items/1", headers=headers)
    assert rm.status_code == 204


def test_add_to_cart_stock_validation(client):
    token = _register_and_token(client)
    headers = auth_headers(token)

    # product 2 stock=5
    res = client.post("/api/cart/items", headers=headers, json={"product_id": 2, "quantity": 999})
    assert res.status_code == 400


def test_checkout_and_orders(client):
    token = _register_and_token(client)
    headers = auth_headers(token)

    # Empty checkout
    empty = client.post("/api/cart/checkout", headers=headers)
    assert empty.status_code == 400

    # Add then checkout
    add = client.post("/api/cart/items", headers=headers, json={"product_id": 2, "quantity": 2})
    assert add.status_code == 201

    checkout = client.post("/api/cart/checkout", headers=headers)
    assert checkout.status_code == 200, checkout.text
    data = checkout.json()
    assert "order_id" in data
    assert data["total"] > 0

    # Orders endpoint
    orders = client.get("/api/cart/orders", headers=headers)
    assert orders.status_code == 200
    body = orders.json()
    assert "orders" in body
    assert len(body["orders"]) >= 1
    assert len(body["orders"][0]["items"]) >= 1


def test_update_cart_quantity_zero_removes_item(client):
    token = _register_and_token(client)
    headers = auth_headers(token)

    add = client.post("/api/cart/items", headers=headers, json={"product_id": 1, "quantity": 1})
    assert add.status_code == 201

    upd = client.put("/api/cart/items/1", headers=headers, json={"quantity": 0})
    assert upd.status_code == 200, upd.text

    cart = client.get("/api/cart", headers=headers)
    assert cart.status_code == 200
    assert cart.json()["items"] == []
