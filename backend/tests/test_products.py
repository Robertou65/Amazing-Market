def test_get_sections(client):
    res = client.get("/api/sections")
    assert res.status_code == 200
    sections = res.json()
    assert isinstance(sections, list)
    assert sections[0]["id"] == 1


def test_get_categories_by_section_ok(client):
    res = client.get("/api/sections/1/categories")
    assert res.status_code == 200
    cats = res.json()
    assert len(cats) >= 1
    assert all(cat["section_id"] == 1 for cat in cats)


def test_get_categories_by_section_404(client):
    res = client.get("/api/sections/999/categories")
    assert res.status_code == 404


def test_get_all_categories(client):
    res = client.get("/api/categories")
    assert res.status_code == 200
    cats = res.json()
    assert any(c["name"] == "Wines" for c in cats)


def test_get_products_pagination_and_filters(client):
    res = client.get("/api/products")
    assert res.status_code == 200
    body = res.json()
    assert "products" in body and "total" in body
    assert body["page"] == 1

    res = client.get("/api/products", params={"section_id": 1})
    assert res.status_code == 200

    res = client.get("/api/products", params={"category_id": 1})
    assert res.status_code == 200
    body = res.json()
    assert all(p["category_id"] == 1 for p in body["products"])


def test_get_products_invalid_page_422(client):
    res = client.get("/api/products", params={"page": 0})
    assert res.status_code == 422


def test_get_product_by_id_ok_and_404(client):
    ok = client.get("/api/products/1")
    assert ok.status_code == 200
    assert ok.json()["id"] == 1

    missing = client.get("/api/products/999")
    assert missing.status_code == 404


def test_get_products_search_q_filters_by_name(client):
    res = client.get("/api/products", params={"q": "wine"})
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["total"] == 1
    assert all("wine" in p["name"].lower() for p in body["products"])


def test_get_products_search_q_filters_by_number(client):
    res = client.get("/api/products", params={"q": "1002"})
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["total"] == 1
    assert body["products"][0]["id"] == 2
