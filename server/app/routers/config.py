from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..database import get_db
from ..models.config import StoreConfig
from ..schemas.config import StoreConfigResponse, StoreConfigUpdate
from ..dependencies import get_current_admin

router = APIRouter(prefix="/api/config", tags=["Config"])

@router.get("", response_model=StoreConfigResponse)
def get_config(db: Session = Depends(get_db)):
    config = db.query(StoreConfig).filter_by(id="default").first()
    if not config:
        config = StoreConfig(id="default", telefone_whatsapp="5511942440440", telefone_exibicao="(11) 94244-0440")
        try:
            db.add(config)
            db.commit()
            db.refresh(config)
        except IntegrityError:
            db.rollback()
            config = db.query(StoreConfig).filter_by(id="default").first()
    return config

@router.put("", response_model=StoreConfigResponse)
def update_config(config_in: StoreConfigUpdate, db: Session = Depends(get_db), admin_user: str = Depends(get_current_admin)):
    config = db.query(StoreConfig).filter_by(id="default").first()
    if not config:
        config = StoreConfig(id="default")
        try:
            db.add(config)
            db.commit()
        except IntegrityError:
            db.rollback()
            config = db.query(StoreConfig).filter_by(id="default").first()
    
    config.telefone_whatsapp = config_in.telefone_whatsapp
    config.telefone_exibicao = config_in.telefone_exibicao
    
    db.commit()
    db.refresh(config)
    return config
