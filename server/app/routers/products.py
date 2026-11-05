from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..schemas.product import ProductResponse, ProductCreate, ProductUpdate
from ..dependencies import get_current_admin, get_optional_admin
from ..services.product_service import ProductService

router = APIRouter(prefix="/api/produtos", tags=["Produtos"])

@router.get("", response_model=List[ProductResponse])
def list_products(
    categoria: Optional[str] = Query(None, description="Filtrar por categoria"),
    busca: Optional[str] = Query(None, description="Termo de busca"),
    ordenacao: Optional[str] = Query("destaque", description="Critério de ordenação"),
    admin: Optional[bool] = Query(False, description="Se true, retorna também os inativos"),
    current_admin: Optional[str] = Depends(get_optional_admin),
    db: Session = Depends(get_db)
):
    # Segurança (SEC-03): Apenas admins autenticados podem ver produtos inativos/ocultos
    pode_ver_inativos = bool(admin and current_admin)
    return ProductService.list_products(
        db=db,
        categoria=categoria,
        busca=busca,
        ordenacao=ordenacao,
        pode_ver_inativos=pode_ver_inativos
    )

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: str, 
    current_admin: Optional[str] = Depends(get_optional_admin),
    db: Session = Depends(get_db)
):
    pode_ver_inativos = bool(current_admin)
    product = ProductService.get_product_by_id(db, product_id, pode_ver_inativos=pode_ver_inativos)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Produto não encontrado"
        )
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate, 
    db: Session = Depends(get_db), 
    admin_user: str = Depends(get_current_admin)
):
    product, error = ProductService.create_product(db, product_in)
    if error:
        if "não existe" in error:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=error)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str, 
    product_in: ProductUpdate, 
    db: Session = Depends(get_db),
    admin_user: str = Depends(get_current_admin)
):
    product, error = ProductService.update_product(db, product_id, product_in)
    if error == "not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Produto não encontrado"
        )
    if error == "conflict":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflito: o código ou categoria informado já está em uso ou é inválido."
        )
    return product

@router.patch("/{product_id}/toggle-pronta-entrega")
def toggle_availability(
    product_id: str, 
    valor: Optional[bool] = Query(None, description="Valor explícito desejado para garantia de idempotência"),
    db: Session = Depends(get_db), 
    admin_user: str = Depends(get_current_admin)
):
    result = ProductService.toggle_pronta_entrega(db, product_id, valor)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Produto não encontrado"
        )
    return result

@router.patch("/{product_id}/toggle-ativo")
def toggle_product_ativo(
    product_id: str, 
    valor: Optional[bool] = Query(None, description="Valor explícito desejado para garantia de idempotência"),
    db: Session = Depends(get_db), 
    admin_user: str = Depends(get_current_admin)
):
    result = ProductService.toggle_ativo(db, product_id, valor)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Produto não encontrado"
        )
    return result

@router.delete("/{product_id}")
def delete_product(
    product_id: str, 
    db: Session = Depends(get_db), 
    admin_user: str = Depends(get_current_admin)
):
    deleted = ProductService.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Produto não encontrado"
        )
    return {"message": "Produto removido com sucesso", "id": product_id}
