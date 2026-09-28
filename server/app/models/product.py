from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, JSON
from datetime import datetime
from ..database import Base

class Product(Base):
    __tablename__ = "produtos"

    id = Column(String(100), primary_key=True, index=True)
    codigo = Column(String(50), nullable=False, index=True)
    nome = Column(String(255), nullable=False)
    categoria = Column(String(100), nullable=False, index=True)
    categoria_label = Column(String(100), nullable=False)
    destaque = Column(Boolean, default=False)
    dimensoes = Column(String(100), nullable=True)
    resistencia = Column(String(100), nullable=True)
    peso = Column(String(100), nullable=True)
    rendimento = Column(String(100), nullable=True)
    paletizacao = Column(String(100), nullable=True)
    norma = Column(String(150), nullable=True)
    unidade = Column(String(50), default="un")
    qtd_minima = Column(Integer, default=10)
    incremento = Column(Integer, default=10)
    pronta_entrega = Column(Boolean, default=True)
    descricao_curta = Column(Text, nullable=True)
    descricao_longa = Column(Text, nullable=True)
    aplicacoes = Column(JSON, default=list)
    tipo_icone = Column(String(50), default="bloco-padrao")
    imagem_url = Column(String(500), nullable=True)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
