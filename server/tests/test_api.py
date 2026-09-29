from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "status": "online",
        "service": "WD Blocos API (FastAPI + PostgreSQL)",
        "docs": "/docs"
    }

def test_get_config():
    response = client.get("/api/config")
    assert response.status_code == 200
    assert "telefone_whatsapp" in response.json()

def test_get_categories():
    response = client.get("/api/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
