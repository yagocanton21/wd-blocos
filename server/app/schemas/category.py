from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    label: str

class CategoryCreate(CategoryBase):
    id: str  # id em formato slug, ex: "bloco-estrutural"

class CategoryUpdate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
