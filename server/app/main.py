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
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("wd-blocos-api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialização: cria tabelas se não existirem
    logger.info("📦 Inicializando banco de dados PostgreSQL...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed inicial de categorias caso vazio
        cat_count = db.query(Category).count()
        if cat_count == 0:
            logger.info("🌱 Populando categorias iniciais...")
            categorias_iniciais = [
                Category(id="bloco-estrutural", label="Bloco Estrutural"),
                Category(id="bloco-vedacao", label="Bloco de Vedação"),
                Category(id="canaleta", label="Canaletas"),
                Category(id="piso-intertravado", label="Pisos Intertravados"),
                Category(id="piso-tatil", label="Piso Tátil")
            ]
            db.add_all(categorias_iniciais)
            db.commit()

        count = db.query(Product).count()
        logger.info(f"✅ Banco pronto. {count} produto(s) cadastrado(s).")
    except Exception as e:
        logger.error(f"❌ Erro ao verificar banco: {e}")
        db.rollback()
    finally:
        db.close()

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

# Servir arquivos de upload estaticamente
UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": "WD Blocos API (FastAPI + PostgreSQL)",
        "docs": "/docs"
    }
