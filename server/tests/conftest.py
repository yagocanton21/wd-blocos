import os
import tempfile
import pytest

# Garante flag de ambiente de testes antes de qualquer import do app
os.environ["TESTING"] = "1"

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.models.product import Product
from app.models.category import Category
from app.models.config import StoreConfig
from app.main import app

# Configura banco SQLite isolado para testes
TEST_DB_PATH = os.path.join(tempfile.gettempdir(), "test_wd_blocos_suite.db")
if os.path.exists(TEST_DB_PATH):
    try:
        os.remove(TEST_DB_PATH)
    except Exception:
        pass

test_engine = create_engine(
    f"sqlite:///{TEST_DB_PATH}",
    connect_args={"check_same_thread": False}
)

# Ativa integridade referencial de Foreign Keys no SQLite
@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Recria schema completo nos testes
Base.metadata.drop_all(bind=test_engine)
Base.metadata.create_all(bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Injeta override no FastAPI para todos os testes
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def db_session_factory():
    return TestingSessionLocal
