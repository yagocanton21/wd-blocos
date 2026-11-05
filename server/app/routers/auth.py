from fastapi import APIRouter, HTTPException, status, Response, Request, Depends
from datetime import datetime, timedelta, timezone
import time
import jwt
from collections import defaultdict
from ..config import ADMIN_USER, ADMIN_PASSWORD, SECURE_COOKIE
from ..schemas.auth import LoginRequest, LoginResponse, UserResponse
from ..dependencies import SECRET_KEY, ALGORITHM, get_current_admin

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])

# Rate limiting em memória contra ataques de força bruta no login
# Armazena os timestamps das tentativas com falha por IP
_FAILED_LOGINS = defaultdict(list)
_MAX_ATTEMPTS = 5
_LOCKOUT_SECONDS = 60

def check_login_rate_limit(client_ip: str):
    now = time.time()
    # Mantém apenas tentativas dentro da janela de 60s
    attempts = [t for t in _FAILED_LOGINS[client_ip] if now - t < _LOCKOUT_SECONDS]
    _FAILED_LOGINS[client_ip] = attempts
    if len(attempts) >= _MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitas tentativas consecutivas de login. Por segurança, aguarde 1 minuto."
        )

def record_failed_login(client_ip: str):
    _FAILED_LOGINS[client_ip].append(time.time())

def clear_failed_logins(client_ip: str):
    if client_ip in _FAILED_LOGINS:
        del _FAILED_LOGINS[client_ip]

@router.post("/login", response_model=LoginResponse)
def login(creds: LoginRequest, request: Request, response: Response):
    client_ip = request.client.host if request.client else "unknown"
    check_login_rate_limit(client_ip)

    if creds.username == ADMIN_USER and creds.password == ADMIN_PASSWORD:
        clear_failed_logins(client_ip)

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

        # Configura o cookie HttpOnly com a flag Secure dinâmica para produção
        response.set_cookie(
            key="wd_admin_token",
            value=encoded_jwt,
            httponly=True,
            secure=SECURE_COOKIE,
            samesite="lax",
            max_age=cookie_max_age
        )

        return LoginResponse(
            success=True,
            token=encoded_jwt,
            user=UserResponse(
                username=ADMIN_USER,
                nome="Administrador WD Blocos"
            )
        )

    record_failed_login(client_ip)
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Usuário ou senha incorretos"
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="wd_admin_token",
        httponly=True,
        secure=SECURE_COOKIE,
        samesite="lax"
    )
    return {"success": True, "message": "Logout realizado com sucesso"}

@router.get("/verify")
def verify(admin: str = Depends(get_current_admin)):
    return {"success": True, "username": admin}
