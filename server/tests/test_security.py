import pytest
from fastapi.testclient import TestClient
import jwt
from io import BytesIO

from app.main import app
from app.dependencies import SECRET_KEY, ALGORITHM
from app.routers.auth import _FAILED_LOGINS

client = TestClient(app)

def test_rotated_jwt_secret_rejects_compromised_key():
    """
    SEC-01: Prova que a antiga chave padrão vazada não é mais aceita.
    Qualquer token forjado com o segredo antigo deve receber 401.
    """
    old_compromised_key = "super-secret-wd-blocos-key-2026"
    forged_token = jwt.encode({"sub": "admin"}, old_compromised_key, algorithm="HS256")

    response = client.get("/api/auth/verify", headers={"Authorization": f"Bearer {forged_token}"})
    assert response.status_code == 401
    assert "inválid" in response.json()["detail"].lower()


def test_public_user_cannot_bypass_admin_flag():
    """
    SEC-03: Prova que um visitante público usando ?admin=true NÃO visualiza produtos inativos.
    Apenas um admin autenticado pode vê-los.
    """
    valid_token = jwt.encode({"sub": "admin"}, SECRET_KEY, algorithm=ALGORITHM)
    admin_headers = {"Authorization": f"Bearer {valid_token}"}

    # 1. Cria categoria e produto inativo como admin
    client.post("/api/categories/", json={"id": "cat-sec-test", "label": "Segurança"}, headers=admin_headers)
    client.post("/api/produtos", json={
        "id": "prod-inativo-secreto",
        "codigo": "WD-SEC-01",
        "nome": "Bloco Oculto da Diretoria",
        "categoria": "cat-sec-test",
        "categoriaLabel": "Segurança",
        "ativo": False
    }, headers=admin_headers)

    # 2. Visitante anônimo (cliente isolado sem cookies) tenta usar ?admin=true
    with TestClient(app) as anon_client:
        anon_res = anon_client.get("/api/produtos?admin=true")
        assert anon_res.status_code == 200
        ids_retornados = [p["id"] for p in anon_res.json()]
        assert "prod-inativo-secreto" not in ids_retornados, "Visitante anônimo NÃO pode ver produtos inativos!"

        # 3. Visitante anônimo tenta acessar direto por ID
        direct_res = anon_client.get("/api/produtos/prod-inativo-secreto")
        assert direct_res.status_code == 404, "Produto inativo deve retornar 404 para visitante comum."

    # 4. Admin autenticado acessa por ID
    admin_direct = client.get("/api/produtos/prod-inativo-secreto", headers=admin_headers)
    assert admin_direct.status_code == 200
    assert admin_direct.json()["id"] == "prod-inativo-secreto"


def test_upload_size_limit_rejection():
    """
    SEC-04: Prova que arquivos que excedem 5MB são barrados com HTTP 413 no backend.
    """
    valid_token = jwt.encode({"sub": "admin"}, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {valid_token}"}

    # Gera payload falso de 6MB
    large_payload = b"x" * (6 * 1024 * 1024)
    files = {"file": ("gigante.png", BytesIO(large_payload), "image/png")}

    res = client.post("/api/upload", files=files, headers=headers)
    assert res.status_code == 413
    assert "excede o limite" in res.json()["detail"].lower()


def test_login_rate_limiting_brute_force():
    """
    SEC-06: Prova que após 5 tentativas incorretas consecutivas, o endpoint
    bloqueia o atacante com HTTP 429 Too Many Requests.
    """
    _FAILED_LOGINS.clear()

    # 5 tentativas erradas
    for _ in range(5):
        res = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
        assert res.status_code == 401

    # 6ª tentativa deve ser bloqueada com 429
    blocked_res = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert blocked_res.status_code == 429
    assert "muitas tentativas" in blocked_res.json()["detail"].lower()

    _FAILED_LOGINS.clear()
