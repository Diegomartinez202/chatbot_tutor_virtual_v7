from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from typing import List
from backend.dependencies.auth import require_role, get_current_user
from backend.services.log_service import (
    listar_archivos_log,
    obtener_contenido_log,
    exportar_logs_csv_stream,
    contar_mensajes_no_leidos,
    marcar_mensajes_como_leidos,
    get_logs,
    log_access
)
from backend.models.log_model import LogModel
import re

router = APIRouter(prefix="/api", tags=["Logs"])

# 📄 1. Listar logs desde MongoDB con auditoría
@router.get("/admin/logs", response_model=List[LogModel], summary="📄 Listar logs desde MongoDB")
def listar_logs(current_user=Depends(require_role(["admin", "soporte"]))):
    logs = get_logs()
    log_access(
        user_id=current_user["_id"],
        email=current_user["email"],
        rol=current_user["rol"],
        endpoint="/admin/logs",
        method="GET",
        status=200 if logs else 204
    )
    return logs

# ⬇️ 2. Descargar archivo de log local
@router.get("/admin/logs/{filename}", summary="⬇️ Descargar archivo de log local")
def descargar_log(filename: str, current_user=Depends(require_role(["admin", "soporte"]))):
    if not re.match(r"^train_.*\.log$", filename):
        raise HTTPException(status_code=400, detail="Nombre de archivo inválido")

    file_path = obtener_contenido_log(filename)
    if not file_path:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    log_access(
        user_id=current_user["_id"],
        email=current_user["email"],
        rol=current_user["rol"],
        endpoint=f"/admin/logs/{filename}",
        method="GET",
        status=200
    )

    return FileResponse(file_path, media_type="text/plain", filename=filename)

# 📤 3. Exportar logs a CSV
@router.get("/admin/logs/export", summary="📤 Exportar logs desde MongoDB a CSV", response_class=StreamingResponse)
def exportar_logs_csv(current_user=Depends(require_role(["admin", "soporte"]))):
    output = exportar_logs_csv_stream()
    log_access(
        user_id=current_user["_id"],
        email=current_user["email"],
        rol=current_user["rol"],
        endpoint="/admin/logs/export",
        method="GET",
        status=200
    )
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=logs_exportados.csv"}
    )

# 🔴 4. Contar mensajes no leídos (restringido por autenticación)
@router.get("/logs/unread_count", summary="🔴 Consultar cantidad de mensajes no leídos")
def get_unread_count(user_id: str = Query(...), current_user=Depends(get_current_user)):
    return {"unread": contar_mensajes_no_leidos(user_id)}

# ✅ 5. Marcar mensajes como leídos (restringido por autenticación)
@router.post("/logs/mark_read", summary="✅ Marcar mensajes como leídos")
def marcar_mensajes_leidos(user_id: str = Query(...), current_user=Depends(get_current_user)):
    return {"updated_count": marcar_mensajes_como_leidos(user_id)}