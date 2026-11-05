import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "wd_blocos")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "wd_blocos_secret")

encoded_password = urllib.parse.quote_plus(DB_PASSWORD)

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    f"postgresql+psycopg://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "wdblocos2026")
PORT = int(os.getenv("PORT", 8000))

# Configurações de Segurança e Ambiente
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET and ENVIRONMENT == "production":
    raise RuntimeError("CRÍTICO: A variável de ambiente JWT_SECRET é obrigatória em ambiente de produção!")
elif not JWT_SECRET:
    JWT_SECRET = "dev-fallback-key-change-in-production"

ALLOWED_ORIGINS = [
    orig.strip() 
    for orig in os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:8001"
    ).split(",") 
    if orig.strip()
]

SECURE_COOKIE = os.getenv("SECURE_COOKIE", "false").lower() == "true" or ENVIRONMENT == "production"
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 5 * 1024 * 1024)) # 5MB padrão
