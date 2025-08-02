# ✅ backend/routes/logs.py COMPLETO

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from typing import List
from backend.dependencies.auth import require_role, get_current_user
from backend.services.log_service import (
    listar_archivos_log,
    obtener_contenido_log,
    exportar_logs_csv_stream,
    contar_mensajes_no_leidos,
    marcar_mensajes_como_leidos,
    get_logs,
    log_access,
    get_export_logs,
    get_export_stats_by_day
)
from backend.models.log_model import LogModel
import re

router = APIRouter(prefix="/api", tags=["Logs"])

# 📄 1. Listar logs desde MongoDB con auditoría
@router.get("/admin/logs", response_model=List[LogModel], summary="📄 Listar logs desde MongoDB")
def listar_logs(request: Request, current_user=Depends(require_role(["admin", "soporte"]))):
    logs = get_logs()
    log_access(
        user_id=current_user["_id"],
        email=current_user["email"],
        rol=current_user["rol"],
        endpoint=str(request.url.path),
        method=request.method,
        status=200 if logs else 204,
        ip=request.state.ip,
        user_agent=request.state.user_agent
    )
    return logs

# ⬇️ 2. Descargar archivo de log local
@router.get("/admin/logs/{filename}", summary="⬇️ Descargar archivo de log local")
def descargar_log(filename: str, request: Request, current_user=Depends(require_role(["admin", "soporte"]))):
    if not re.match(r"^train_.*\.log$", filename):
        raise HTTPException(status_code=400, detail="Nombre de archivo inválido")

    file_path = obtener_contenido_log(filename)
    if not file_path:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    log_access(
        user_id=current_user["_id"],
        email=current_user["email"],
        rol=current_user["rol"],
        endpoint=str(request.url.path),
        method=request.method,
        status=200,
        ip=request.state.ip,
        user_agent=request.state.user_agent
    )

    return FileResponse(file_path, media_type="text/plain", filename=filename)

# 📤 3. Exportar logs a CSV
@router.get("/admin/logs/export", summary="📤 Exportar logs desde MongoDB a CSV", response_class=StreamingResponse)
def exportar_logs_csv(request: Request, current_user=Depends(require_role(["admin", "soporte"]))):
    output = exportar_logs_csv_stream()
    log_access(
        user_id=current_user["_id"],
        email=current_user["email"],
        rol=current_user["rol"],
        endpoint=str(request.url.path),
        method=request.method,
        status=200,
        ip=request.state.ip,
        user_agent=request.state.user_agent,
        tipo="exportacion_csv"
    )
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=logs_exportados.csv"}
    )

# 📊 4. Exportaciones por día (para gráfico)
@router.get("/admin/logs/exports", summary="📊 Estadísticas de exportaciones por día")
def estadisticas_exportaciones(request: Request, current_user=Depends(require_role(["admin", "soporte"]))):
    data = get_export_stats_by_day()
    return JSONResponse(content=data)

# 📄 5. Lista detallada de exportaciones
@router.get("/admin/logs/exports/list", summary="📄 Lista detallada de exportaciones CSV")
def listar_exportaciones(request: Request, current_user=Depends(require_role(["admin", "soporte"]))):
    data = get_export_logs()
    return JSONResponse(content=data)

# 🔴 6. Contar mensajes no leídos
@router.get("/logs/unread_count", summary="🔴 Consultar cantidad de mensajes no leídos")
def get_unread_count(user_id: str = Query(...), current_user=Depends(get_current_user)):
    return {"unread": contar_mensajes_no_leidos(user_id)}

# ✅ 7. Marcar mensajes como leídos
@router.post("/logs/mark_read", summary="✅ Marcar mensajes como leídos")
def marcar_mensajes_leidos(user_id: str = Query(...), current_user=Depends(get_current_user)):
    return {"updated_count": marcar_mensajes_como_leidos(user_id)}
