from fastapi import APIRouter, Depends
from backend.services.train_logger import entrenar_y_loggear
from backend.dependencies.auth import require_role

router = APIRouter()

@router.post("/admin/train", tags=["Admin"])
def entrenar_bot(payload=Depends(require_role(["admin"]))):
    resultado = entrenar_y_loggear()

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
