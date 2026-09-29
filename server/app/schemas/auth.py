from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str
    remember_me: bool = False

class UserResponse(BaseModel):
    username: str
    nome: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: UserResponse

class StatsResponse(BaseModel):
    totalProdutos: int
    prontaEntrega: int
    sobEncomenda: int
    porCategoria: dict
