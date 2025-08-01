# backend/routes/stats.py

from fastapi import APIRouter, Depends
from backend.dependencies.auth import require_role
from backend.services.stats_service import (
    obtener_estadisticas_logs,
    obtener_estadisticas_usuarios
)

router = APIRouter(tags=["Estadísticas"])

@router.get("/admin/stats", summary="📊 Obtener estadísticas del chatbot")
def get_stats(user=Depends(require_role(["admin", "soporte"]))):
    stats_logs = obtener_estadisticas_logs()
    stats_usuarios = obtener_estadisticas_usuarios()

    return {
        **stats_logs,
        **stats_usuarios
    }
