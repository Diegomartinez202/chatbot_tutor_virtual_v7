# backend/routes/train.py

from fastapi import APIRouter, Depends, Request
from backend.services.train_service import entrenar_y_loggear
from backend.dependencies.auth import require_role
from backend.services.log_service import log_access

router = APIRouter()

@router.post("/admin/train", tags=["Entrenamiento"])
def entrenar_bot(request: Request, payload=Depends(require_role(["admin"]))):
    resultado = entrenar_y_loggear()

    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint=str(request.url.path),
        method=request.method,
        status=200 if resultado["success"] else 500,
        ip=request.state.ip,
        user_agent=request.state.user_agent
    )

    if resultado["success"]:
        return {
            "success": True,
            "message": "✅ Bot entrenado correctamente",
            "log_file": resultado["log_path"]
        }

    return {
        "success": False,
        "message": "❌ Error al entrenar el bot",
        "error": resultado.get("error", "Error desconocido"),
        "log_file": resultado["log_path"]
    }