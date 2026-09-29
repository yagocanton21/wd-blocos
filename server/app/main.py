from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .database import engine, Base, SessionLocal
from .models.product import Product
from .models.category import Category
from .routers import products_router, stats_router, auth_router
from .routers.categories import router as categories_router
from .routers.upload import router as upload_router
from .routers.config import router as config_router
from .models.config import StoreConfig
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("wd-blocos-api")

def run_migrations():
    """Executa migrações do Alembic de forma resiliente."""
    from alembic.config import Config
    from alembic import command
    from sqlalchemy import inspect

    # Procura alembic.ini no diretório da aplicação ou raiz
    ini_path = "alembic.ini"
    if not os.path.exists(ini_path):
        ini_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "alembic.ini")

    alembic_cfg = Config(ini_path)
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    # Se já existirem tabelas mas não houver a tabela alembic_version, faz o stamp para head
    if "alembic_version" not in tables and "produtos" in tables:
        logger.info("📌 Banco existente detectado. Registrando versão inicial no Alembic (stamp head)...")
        command.stamp(alembic_cfg, "head")
    else:
        logger.info("📦 Executando migrações do Alembic (upgrade head)...")
        command.upgrade(alembic_cfg, "head")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialização: executa migrações do Alembic
    logger.info("📦 Inicializando banco de dados com Alembic...")
    try:
        run_migrations()
        logger.info("✅ Banco pronto e migrações do Alembic aplicadas.")
    except Exception as e:
        logger.error(f"⚠️ Erro ao executar Alembic: {e}. Executando fallback Base.metadata.create_all...")
        Base.metadata.create_all(bind=engine)

    yield
    logger.info("🛑 Encerrando aplicação FastAPI.")

app = FastAPI(
    title="WD Blocos — API Catálogo & Painel Admin",
    description="API REST corporativa desenvolvida em FastAPI e PostgreSQL com arquitetura limpa (Models, Routers, Schemas).",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS liberado para o frontend Vite React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos roteadores modulares
app.include_router(products_router)
app.include_router(stats_router)
app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(upload_router)
app.include_router(config_router)

# Servir arquivos de upload estaticamente
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": "WD Blocos API (FastAPI + PostgreSQL)",
        "docs": "/docs"
    }
