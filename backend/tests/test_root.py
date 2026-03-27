def test_root(client):
    res = client.get("/")
    assert res.status_code == 200
    body = res.json()
    assert body["message"] == "Amazing Market API"
    assert body["docs"] == "/docs"


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_assets_categories_image_served(client):
    res = client.get("/assets/categories/wines_category.webp")
    assert res.status_code == 200
    assert res.headers.get("content-type", "").startswith("image/")
