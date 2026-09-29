from fastapi import APIRouter, HTTPException, status, Response, Request, Depends
from datetime import datetime, timedelta, timezone
import jwt
from ..config import ADMIN_USER, ADMIN_PASSWORD
from ..schemas.auth import LoginRequest, LoginResponse, UserResponse
from ..dependencies import SECRET_KEY, ALGORITHM, get_current_admin

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])

@router.post("/login", response_model=LoginResponse)
def login(creds: LoginRequest, response: Response):
    if creds.username == ADMIN_USER and creds.password == ADMIN_PASSWORD:
        if creds.remember_me:
            # Sessão persistente por 30 dias
            expire = datetime.now(timezone.utc) + timedelta(days=30)
            cookie_max_age = 30 * 24 * 60 * 60
        else:
            # Sessão que expira ao fechar o navegador
            expire = datetime.now(timezone.utc) + timedelta(days=1)
            cookie_max_age = None

        to_encode = {"sub": ADMIN_USER, "exp": expire}
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

        # Configura o cookie HttpOnly
        response.set_cookie(
            key="wd_admin_token",
            value=encoded_jwt,
            httponly=True,
            secure=False, # Idealmente True em produção (HTTPS), False no dev
            samesite="lax",
            max_age=cookie_max_age
        )

        return LoginResponse(
            success=True,
            token=encoded_jwt, # O frontend pode ignorar esse token agora
            user=UserResponse(
                username=ADMIN_USER,
                nome="Administrador WD Blocos"
            )
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Usuário ou senha incorretos"
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="wd_admin_token",
        httponly=True,
        secure=False,
        samesite="lax"
    )
    return {"success": True, "message": "Logout realizado com sucesso"}

@router.get("/verify")
def verify(admin: str = Depends(get_current_admin)):
    return {"success": True, "username": admin}
