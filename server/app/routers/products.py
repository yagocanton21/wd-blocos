from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import List, Optional
import time
import random

from ..database import get_db
from ..models.product import Product
from ..schemas.product import ProductResponse, ProductCreate, ProductUpdate
from ..dependencies import get_current_admin

router = APIRouter(prefix="/api/produtos", tags=["Produtos"])

@router.get("", response_model=List[ProductResponse])
def list_products(
    categoria: Optional[str] = Query(None, description="Filtrar por categoria"),
    busca: Optional[str] = Query(None, description="Termo de busca"),
    ordenacao: Optional[str] = Query("destaque", description="Critério de ordenação"),
    admin: Optional[bool] = Query(False, description="Se true, retorna também os inativos"),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if not admin:
        query = query.filter(Product.ativo == True)

    if categoria and categoria != "todos":
        query = query.filter(Product.categoria == categoria)

    if busca and busca.strip():
        term = f"%{busca.strip().lower()}%"
        query = query.filter(
            or_(
                Product.nome.ilike(term),
                Product.codigo.ilike(term),
                Product.dimensoes.ilike(term),
                Product.descricao_curta.ilike(term)
            )
        )

    if ordenacao == "destaque":
        query = query.order_by(desc(Product.destaque), asc(Product.nome))
    elif ordenacao == "nome-desc":
        query = query.order_by(desc(Product.nome))
    else:
        query = query.order_by(asc(Product.nome))

    return query.all()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Produto não encontrado"
        )
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    prod_id = product_in.id or f"prod-{int(time.time() * 1000)}"
    codigo = product_in.codigo or f"WD-{random.randint(1000, 9999)}"

    # Converte os dados do schema Pydantic para os atributos do modelo SQLAlchemy
    product = Product(
        id=prod_id,
        codigo=codigo,
        nome=product_in.nome,
        categoria=product_in.categoria,
        categoria_label=product_in.categoriaLabel,
        destaque=product_in.destaque,
        dimensoes=product_in.dimensoes,
        resistencia=product_in.resistencia,
        peso=product_in.peso,
        rendimento=product_in.rendimento,
        paletizacao=product_in.paletizacao,
        norma=product_in.norma,
        unidade=product_in.unidade,
        qtd_minima=product_in.qtdMinima,
        incremento=product_in.incremento,
        pronta_entrega=product_in.prontaEntrega,
        descricao_curta=product_in.descricaoCurta,
        descricao_longa=product_in.descricaoLonga,
        aplicacoes=product_in.aplicacoes or [],
        tipo_icone=product_in.tipoIcone,
        imagem_url=product_in.imagemUrl
    )

    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str, 
    product_in: ProductUpdate, 
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Produto não encontrado"
        )

    update_data = product_in.model_dump(exclude_unset=True)

    # Mapeia campos do schema para colunas do banco
    mapping = {
        "categoriaLabel": "categoria_label",
        "qtdMinima": "qtd_minima",
        "prontaEntrega": "pronta_entrega",
        "descricaoCurta": "descricao_curta",
        "descricaoLonga": "descricao_longa",
        "tipoIcone": "tipo_icone",
        "imagemUrl": "imagem_url"
    }

    for key, value in update_data.items():
        col_name = mapping.get(key, key)
        if hasattr(product, col_name):
            setattr(product, col_name, value)

    db.commit()
    db.refresh(product)
    return product

@router.patch("/{product_id}/toggle-pronta-entrega")
def toggle_availability(product_id: str, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Produto não encontrado"
        )

    product.pronta_entrega = not product.pronta_entrega
    db.commit()
    db.refresh(product)
    return {"id": product.id, "prontaEntrega": product.pronta_entrega}

@router.patch("/{product_id}/toggle-ativo")
def toggle_product_ativo(product_id: str, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Produto não encontrado"
        )
    
    product.ativo = not product.ativo
    db.commit()
    db.refresh(product)
    return {"id": product.id, "ativo": product.ativo}

@router.delete("/{product_id}")
def delete_product(product_id: str, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Produto não encontrado"
        )

    db.delete(product)
    db.commit()
    return {"message": "Produto removido com sucesso", "id": product_id}
