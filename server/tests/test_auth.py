from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_login_wrong_credentials():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Usuário ou senha incorretos"

def test_login_no_credentials():
    response = client.post("/api/auth/login", json={})
    assert response.status_code == 422 # Validation Error

def test_verify_invalid_token():
    response = client.get("/api/auth/verify", headers={"Authorization": "Bearer invalid_token_here"})
    assert response.status_code == 401
