from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_products_list():
    response = client.get("/api/produtos/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_product_unauthorized():
    response = client.post("/api/produtos/", json={
        "id": "teste-01",
        "codigo": "TEST-01",
        "nome": "Produto de Teste",
        "categoria": "teste",
        "categoria_label": "Teste"
    })
    # Should be 401 Unauthorized since we didn't pass a token
    assert response.status_code == 401

def test_get_product_not_found():
    response = client.get("/api/produtos/produto-que-nao-existe-12345")
    assert response.status_code == 404
