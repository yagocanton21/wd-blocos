from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.config import StoreConfig
from ..schemas.config import StoreConfigResponse, StoreConfigUpdate

router = APIRouter(prefix="/api/config", tags=["Config"])

@router.get("", response_model=StoreConfigResponse)
def get_config(db: Session = Depends(get_db)):
    config = db.query(StoreConfig).filter_by(id="default").first()
    if not config:
        config = StoreConfig(id="default", telefone_whatsapp="5511942440440", telefone_exibicao="(11) 94244-0440")
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("", response_model=StoreConfigResponse)
def update_config(config_in: StoreConfigUpdate, db: Session = Depends(get_db)):
    config = db.query(StoreConfig).filter_by(id="default").first()
    if not config:
        config = StoreConfig(id="default")
        db.add(config)
    
    config.telefone_whatsapp = config_in.telefone_whatsapp
    config.telefone_exibicao = config_in.telefone_exibicao
    
    db.commit()
    db.refresh(config)
    return config
