from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .database import engine, Base, SessionLocal
from .models.product import Product
from .routers import products_router, stats_router, auth_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("wd-blocos-api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialização: cria tabelas se não existirem
    logger.info("📦 Inicializando banco de dados PostgreSQL...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        count = db.query(Product).count()
        logger.info(f"✅ Banco pronto. {count} produto(s) cadastrado(s).")
    except Exception as e:
        logger.error(f"❌ Erro ao verificar banco: {e}")
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

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": "WD Blocos API (FastAPI + PostgreSQL)",
        "docs": "/docs"
    }
