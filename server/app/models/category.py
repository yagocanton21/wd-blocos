from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
from ..database import Base

class Category(Base):
    __tablename__ = "categorias"

    id = Column(String(100), primary_key=True, index=True)
    label = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
