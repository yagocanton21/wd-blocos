import os
import hashlib
from io import BytesIO
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from ..dependencies import get_current_admin
from ..config import MAX_UPLOAD_SIZE
from PIL import Image

# Proteção contra Decompression Bomb (imagens com bilhões de pixels descompactados)
Image.MAX_IMAGE_PIXELS = 10_000_000

router = APIRouter(prefix="/api/upload", tags=["Upload"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
# Em dev local, garante que a pasta exista
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("")
async def upload_image(file: UploadFile = File(...), admin_user: str = Depends(get_current_admin)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="O arquivo enviado não possui formato de imagem válido."
        )
    
    # Lê a imagem em memória e valida o tamanho real no backend
    image_data = await file.read()
    if len(image_data) > MAX_UPLOAD_SIZE:
        max_mb = MAX_UPLOAD_SIZE // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE if hasattr(status, "HTTP_413_CONTENT_TOO_LARGE") else 413,
            detail=f"O arquivo excede o limite máximo permitido de {max_mb}MB."
        )

    try:
        # Idempotência: calcula hash SHA-256 do conteúdo da imagem.
        content_hash = hashlib.sha256(image_data).hexdigest()[:24]
        filename = f"{content_hash}.webp"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Se já existir em disco, não reprocessa nem recomprime
        if not os.path.exists(file_path):
            image = Image.open(BytesIO(image_data))
            
            # Trata o modo de cor: WebP suporta RGB e RGBA.
            if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
                image = image.convert("RGBA")
            else:
                image = image.convert("RGB")

            # Salva convertendo para WebP com compressão otimizada
            image.save(file_path, format="WEBP", quality=80, method=6)
        
    except Image.DecompressionBombError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Imagem rejeitada: dimensões excessivas (risco de Decompression Bomb)."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar imagem: {str(e)}")

    # Retorna a URL relativa da imagem de forma idempotente
    return {"url": f"/uploads/{filename}"}
