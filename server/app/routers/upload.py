import os
from io import BytesIO
from uuid import uuid4
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from ..dependencies import get_current_admin
from PIL import Image

router = APIRouter(prefix="/api/upload", tags=["Upload"])

UPLOAD_DIR = "/app/uploads"
# Em dev local, garante que a pasta exista
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("")
async def upload_image(file: UploadFile = File(...), admin_user: str = Depends(get_current_admin)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="O arquivo não é uma imagem válida")
    
    try:
        # Lê a imagem em memória
        image_data = await file.read()
        image = Image.open(BytesIO(image_data))
        
        # Trata o modo de cor: WebP suporta RGB e RGBA.
        # Se for paleta (P) ou CMYK, converte para algo suportado.
        if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
            image = image.convert("RGBA")
        else:
            image = image.convert("RGB")

        # Define nome único com extensão webp
        filename = f"{uuid4().hex}.webp"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Salva convertendo para WebP com compressão otimizada
        # method=6 garante compressão máxima de espaço (um pouco mais lento no upload, mas super leve no carregamento)
        image.save(file_path, format="WEBP", quality=80, method=6)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar imagem: {str(e)}")

    # Retorna a URL relativa da imagem
    return {"url": f"/uploads/{filename}"}
