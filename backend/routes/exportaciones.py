# backend/routes/exportaciones.py
from fastapi import APIRouter, Depends, Request, Query
from fastapi.responses import StreamingResponse
from backend.dependencies.auth import require_role
from backend.services.log_service import exportar_logs_csv_filtrado
from backend.services.log_service import log_access
from datetime import datetime

router = APIRouter()

@router.get(
    "/admin/exportaciones",
    summary="📤 Exportar logs en formato CSV (tipo: descarga)",
    response_class=StreamingResponse
)
def exportar_logs_csv(
    request: Request,
    desde: str = Query(None, description="Fecha inicio YYYY-MM-DD"),
    hasta: str = Query(None, description="Fecha fin YYYY-MM-DD"),
    user=Depends(require_role(["admin", "soporte"]))
):
    try:
        desde_dt = datetime.strptime(desde, "%Y-%m-%d") if desde else None
        hasta_dt = datetime.strptime(hasta, "%Y-%m-%d") if hasta else None
    except ValueError:
        return {"error": "Formato de fecha inválido. Usa YYYY-MM-DD"}

    log_access(
        user_id=user["_id"],
        email=user["email"],
        rol=user["rol"],
        endpoint="/admin/exportaciones",
        method=request.method,
        status=200,
        ip=request.state.ip,
        user_agent=request.state.user_agent,
        tipo="descarga"
    )

    output = exportar_logs_csv_filtrado(desde_dt, hasta_dt)

    fecha_actual = datetime.now().strftime("%Y%m%d_%H%M")
    filename = f"exportacion_logs_{fecha_actual}.csv"
    headers = {"Content-Disposition": f"attachment; filename={filename}"}

    return StreamingResponse(output, media_type="text/csv", headers=headers)