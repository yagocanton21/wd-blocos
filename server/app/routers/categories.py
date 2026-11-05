from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from ..database import get_db
from ..models.category import Category
from ..schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from ..dependencies import get_current_admin

router = APIRouter(
    prefix="/api/categories",
    tags=["categories"]
)

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.label).all()

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    new_category = Category(id=category.id, label=category.label)
    try:
        db.add(new_category)
        db.commit()
        db.refresh(new_category)
        return new_category
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail=f"Categoria com o ID '{category.id}' já existe."
        )

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: str, category: CategoryUpdate, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    db_cat = db.query(Category).filter(Category.id == category_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    
    db_cat.label = category.label
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: str, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    db_cat = db.query(Category).filter(Category.id == category_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    
    # Validação rápida de aplicação para mensagens amigáveis
    from ..models.product import Product
    produtos_vinculados = db.query(Product).filter(Product.categoria == category_id).count()
    if produtos_vinculados > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Não é possível excluir: existem {produtos_vinculados} produtos nesta categoria."
        )
    
    try:
        db.delete(db_cat)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Não é possível excluir: existem produtos vinculados a esta categoria no banco de dados."
        )
    return None
