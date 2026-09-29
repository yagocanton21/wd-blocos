from app.database import Base, engine
from app.models.product import Product
from app.models.category import Category
from app.models.config import StoreConfig

# Cria as tabelas do banco de dados antes dos testes rodarem
Base.metadata.create_all(bind=engine)
