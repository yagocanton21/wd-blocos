from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models.product import Product
from ..schemas.auth import StatsResponse

router = APIRouter(prefix="/api/stats", tags=["Estatísticas"])

@router.get("", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Product).count()
    pronta_entrega = db.query(Product).filter(Product.pronta_entrega == True).count()
    sob_encomenda = db.query(Product).filter(Product.pronta_entrega == False).count()

    cat_counts = (
        db.query(Product.categoria, func.count(Product.id))
        .group_by(Product.categoria)
        .all()
    )

    por_categoria = {cat: count for cat, count in cat_counts}

    return StatsResponse(
        totalProdutos=total,
        prontaEntrega=pronta_entrega,
        sobEncomenda=sob_encomenda,
        porCategoria=por_categoria
    )
