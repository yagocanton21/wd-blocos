from fastapi import APIRouter, HTTPException, status
import time
from ..config import ADMIN_USER, ADMIN_PASSWORD
from ..schemas.auth import LoginRequest, LoginResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])

@router.post("/login", response_model=LoginResponse)
def login(creds: LoginRequest):
    if creds.username == ADMIN_USER and creds.password == ADMIN_PASSWORD:
        return LoginResponse(
            success=True,
            token=f"wd_auth_token_{int(time.time() * 1000)}",
            user=UserResponse(
                username=ADMIN_USER,
                nome="Administrador WD Blocos"
            )
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Usuário ou senha incorretos"
    )
