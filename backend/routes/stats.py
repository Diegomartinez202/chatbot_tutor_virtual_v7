# backend/routes/stats.py

from fastapi import APIRouter, Depends
from backend.dependencies.auth import require_role
from backend.services import stats_service

router = APIRouter()

@router.get("/admin/stats", summary="📊 Obtener estadísticas del chatbot")
async def get_stats(user=Depends(require_role(["admin", "soporte"]))):
    total_logs = await stats_service.obtener_total_logs()
    intents = await stats_service.obtener_intents_mas_usados()
    total_users = await stats_service.obtener_total_usuarios()
    last_users = await stats_service.obtener_ultimos_usuarios()
    usuarios_por_rol = await stats_service.obtener_usuarios_por_rol()
    logs_por_dia = await stats_service.obtener_logs_por_dia()

    return {
        "total_logs": total_logs,
        "intents_mas_usados": intents,
        "total_usuarios": total_users,
        "ultimos_usuarios": last_users,
        "usuarios_por_rol": usuarios_por_rol,
        "logs_por_dia": logs_por_dia
    }