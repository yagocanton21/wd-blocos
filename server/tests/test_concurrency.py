import pytest
from concurrent.futures import ThreadPoolExecutor
from fastapi.testclient import TestClient
import jwt

from app.main import app
from app.dependencies import SECRET_KEY, ALGORITHM
from app.models.category import Category
from app.models.product import Product
from app.models.config import StoreConfig

client = TestClient(app)

def get_admin_headers():
    token = jwt.encode({"sub": "admin"}, SECRET_KEY, algorithm=ALGORITHM)
    return {"Authorization": f"Bearer {token}"}

def test_concurrent_category_creation(db_session_factory):
    """
    Dispara duas requisições simultâneas de criação de categoria com mesmo ID.
    Prova que apenas uma tem sucesso (201) e a outra recebe 409 Conflict,
    sem exceção 500 no servidor.
    """
    headers = get_admin_headers()
    cat_payload = {"id": "cat-concorrente-1", "label": "Categoria Concorrente"}

    def create_cat():
        # Usa um client por chamada/thread
        with TestClient(app) as c:
            return c.post("/api/categories/", json=cat_payload, headers=headers)

    with ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(create_cat)
        f2 = executor.submit(create_cat)
        res1 = f1.result()
        res2 = f2.result()

    status_codes = sorted([res1.status_code, res2.status_code])
    assert status_codes == [201, 409], f"Esperado [201, 409], obtido {status_codes}"

    db = db_session_factory()
    try:
        count = db.query(Category).filter(Category.id == "cat-concorrente-1").count()
        assert count == 1, "Deve existir exatamente uma categoria registrada no banco."
    finally:
        db.close()


def test_concurrent_product_creation_same_code(db_session_factory):
    """
    Dispara duas requisições simultâneas para criar produto com o mesmo código.
    Prova que apenas uma é gravada e a outra recebe 409 Conflict via UNIQUE constraint.
    """
    headers = get_admin_headers()

    # Cria categoria prévia para o produto
    with TestClient(app) as c:
        c.post("/api/categories/", json={"id": "cat-prod-teste", "label": "Cat Prod"}, headers=headers)

    prod_payload = {
        "id": "prod-conc-01",
        "codigo": "WD-DUPLICADO",
        "nome": "Bloco de Teste Concorrente",
        "categoria": "cat-prod-teste",
        "categoriaLabel": "Cat Prod"
    }

    prod_payload_2 = {
        "id": "prod-conc-02",
        "codigo": "WD-DUPLICADO", # Mesmo código
        "nome": "Outro Bloco com Mesmo Código",
        "categoria": "cat-prod-teste",
        "categoriaLabel": "Cat Prod"
    }

    def post_prod(payload):
        with TestClient(app) as c:
            return c.post("/api/produtos", json=payload, headers=headers)

    with ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(post_prod, prod_payload)
        f2 = executor.submit(post_prod, prod_payload_2)
        res1 = f1.result()
        res2 = f2.result()

    status_codes = sorted([res1.status_code, res2.status_code])
    assert status_codes == [201, 409], f"Esperado [201, 409], obtido {status_codes}"

    db = db_session_factory()
    try:
        count = db.query(Product).filter(Product.codigo == "WD-DUPLICADO").count()
        assert count == 1, "O banco de dados deve conter exatamente 1 produto com este código."
    finally:
        db.close()


def test_concurrent_get_config(db_session_factory):
    """
    Dispara 5 requisições paralelas de get_config simulando múltiplos clientes
    carregando a loja simultaneamente pela primeira vez.
    Garante que todas recebam 200 OK e exatamente 1 registro de StoreConfig seja criado.
    """
    db = db_session_factory()
    try:
        # Garante tabela vazia antes do teste
        db.query(StoreConfig).delete()
        db.commit()
    finally:
        db.close()

    def fetch_config():
        with TestClient(app) as c:
            return c.get("/api/config")

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(fetch_config) for _ in range(5)]
        results = [f.result() for f in futures]

    for res in results:
        assert res.status_code == 200
        assert res.json()["id"] == "default"

    db = db_session_factory()
    try:
        count = db.query(StoreConfig).filter(StoreConfig.id == "default").count()
        assert count == 1, "Deve existir exatamente 1 registro 'default' em store_config."
    finally:
        db.close()


def test_concurrent_toggle_availability(db_session_factory):
    """
    Garante que chamadas concorrentes ao endpoint de toggle utilizam operações atômicas no SQL
    e retornam sem erros de concorrência ou crashes de transação.
    """
    headers = get_admin_headers()
    # Cria produto inicial
    with TestClient(app) as c:
        c.post("/api/produtos", json={
            "id": "prod-toggle-atomic",
            "codigo": "WD-TOGGLE",
            "nome": "Bloco Toggle Atômico",
            "categoria": "cat-prod-teste",
            "categoriaLabel": "Cat Prod",
            "prontaEntrega": True
        }, headers=headers)

    def do_toggle():
        with TestClient(app) as c:
            return c.patch("/api/produtos/prod-toggle-atomic/toggle-pronta-entrega", headers=headers)

    with ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(do_toggle)
        f2 = executor.submit(do_toggle)
        r1 = f1.result()
        r2 = f2.result()

    assert r1.status_code == 200
    assert r2.status_code == 200

    db = db_session_factory()
    try:
        prod = db.query(Product).filter(Product.id == "prod-toggle-atomic").first()
        # Após 2 inversões atômicas (True -> False -> True), o valor retorna a True
        assert prod.pronta_entrega == True
    finally:
        db.close()


def test_foreign_key_protection_orphan_products(db_session_factory):
    """
    Testa a restrição de Foreign Key: se houver produto vinculado a uma categoria,
    a categoria não pode ser excluída, impedindo órfãos.
    """
    headers = get_admin_headers()

    with TestClient(app) as c:
        # Tenta excluir categoria vinculada a produtos
        del_res = c.delete("/api/categories/cat-prod-teste", headers=headers)
        assert del_res.status_code == 400
        detail = del_res.json()["detail"].lower()
        assert "existem" in detail and "produtos" in detail


def test_idempotent_toggle_with_explicit_value(db_session_factory):
    """
    Testa idempotência: enviar repetidas vezes o mesmo valor explícito
    deve manter o estado final idêntico sem inverter de volta.
    """
    headers = get_admin_headers()
    prod_id = "prod-idemp-toggle"

    with TestClient(app) as c:
        # Cria produto base
        c.post("/api/produtos", json={
            "id": prod_id,
            "codigo": "WD-IDEMP-TOGGLE",
            "nome": "Bloco Teste Idempotência Toggle",
            "categoria": "cat-prod-teste",
            "categoriaLabel": "Cat Prod",
            "ativo": True
        }, headers=headers)

        # Envia 3 vezes valor=false
        res1 = c.patch(f"/api/produtos/{prod_id}/toggle-ativo?valor=false", headers=headers)
        res2 = c.patch(f"/api/produtos/{prod_id}/toggle-ativo?valor=false", headers=headers)
        res3 = c.patch(f"/api/produtos/{prod_id}/toggle-ativo?valor=false", headers=headers)

        assert res1.status_code == 200 and res1.json()["ativo"] is False
        assert res2.status_code == 200 and res2.json()["ativo"] is False
        assert res3.status_code == 200 and res3.json()["ativo"] is False

    db = db_session_factory()
    try:
        prod = db.query(Product).filter(Product.id == prod_id).first()
        assert prod.ativo is False, "O estado final deve ser estritamente False após repetições."
    finally:
        db.close()


def test_idempotent_product_creation_retry(db_session_factory):
    """
    Testa idempotência no cadastro: reenviar o mesmo payload exato
    (mesmo ID, código, nome e categoria) deve retornar o recurso já existente
    sem disparar erro 409 nem duplicar o registro no banco.
    """
    headers = get_admin_headers()
    payload = {
        "id": "prod-retry-01",
        "codigo": "WD-RETRY-01",
        "nome": "Bloco de Repetição Idempotente",
        "categoria": "cat-prod-teste",
        "categoriaLabel": "Cat Prod"
    }

    with TestClient(app) as c:
        res1 = c.post("/api/produtos", json=payload, headers=headers)
        assert res1.status_code == 201

        # Reenvio idêntico (retry de rede)
        res2 = c.post("/api/produtos", json=payload, headers=headers)
        assert res2.status_code in [200, 201]
        assert res2.json()["id"] == "prod-retry-01"

    db = db_session_factory()
    try:
        count = db.query(Product).filter(Product.codigo == "WD-RETRY-01").count()
        assert count == 1, "Deve existir exatamente 1 produto registrado no banco após retry."
    finally:
        db.close()


def test_idempotent_upload_image():
    """
    Testa upload idempotente: enviar a mesma imagem duas vezes deve retornar
    a mesma URL relativa calculada pelo hash SHA-256 do conteúdo.
    """
    from io import BytesIO
    from PIL import Image

    # Gera imagem mínima em memória
    img_byte_arr = BytesIO()
    img = Image.new('RGB', (10, 10), color='blue')
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()

    headers = get_admin_headers()

    with TestClient(app) as c:
        files1 = {"file": ("teste1.png", BytesIO(img_bytes), "image/png")}
        r1 = c.post("/api/upload", files=files1, headers=headers)
        assert r1.status_code == 200
        url1 = r1.json()["url"]

        files2 = {"file": ("teste2.png", BytesIO(img_bytes), "image/png")}
        r2 = c.post("/api/upload", files=files2, headers=headers)
        assert r2.status_code == 200
        url2 = r2.json()["url"]

        assert url1 == url2, "Uploads idênticos devem retornar a mesma URL baseada no hash do conteúdo."

