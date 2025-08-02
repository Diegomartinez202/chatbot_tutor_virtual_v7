from fastapi import APIRouter, Depends, Request
from backend.dependencies.auth import require_role
from backend.services import stats_service
from backend.services.log_service import log_access

router = APIRouter()

@router.get("/admin/stats", summary="📊 Obtener estadísticas del chatbot")
async def get_stats(request: Request, user=Depends(require_role(["admin", "soporte"]))):
    total_logs = await stats_service.obtener_total_logs()
    total_exportaciones_csv = await stats_service.obtener_total_exportaciones_csv()
    intents = await stats_service.obtener_intents_mas_usados()
    total_users = await stats_service.obtener_total_usuarios()
    last_users = await stats_service.obtener_ultimos_usuarios()
    usuarios_por_rol = await stats_service.obtener_usuarios_por_rol()
    logs_por_dia = await stats_service.obtener_logs_por_dia()

    log_access(
        user_id=user["_id"],
        email=user["email"],
        rol=user["rol"],
        endpoint=str(request.url.path),
        method=request.method,
        status=200,
        ip=request.state.ip,
        user_agent=request.state.user_agent
    )

    return {
        "total_logs": total_logs,
        "total_exportaciones_csv": total_exportaciones_csv,
        "intents_mas_usados": intents,
        "total_usuarios": total_users,
        "ultimos_usuarios": last_users,
        "usuarios_por_rol": usuarios_por_rol,
        "logs_por_dia": logs_por_dia
    }