import jwt
from fastapi import Depends, HTTPException, status, Request
import os
from datetime import datetime, timezone

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-wd-blocos-key-2026")
ALGORITHM = "HS256"

def get_current_admin(request: Request):
    token = request.cookies.get("wd_admin_token")
    if not token:
        # Tenta fallback para Header por compatibilidade enquanto o frontend não está 100% migrado, ou para testar no Swagger
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token ausente")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
