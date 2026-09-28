from pydantic import BaseModel

class StoreConfigBase(BaseModel):
    telefone_whatsapp: str
    telefone_exibicao: str

class StoreConfigUpdate(StoreConfigBase):
    pass

class StoreConfigResponse(StoreConfigBase):
    id: str

    class Config:
        from_attributes = True
