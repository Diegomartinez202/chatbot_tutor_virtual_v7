# backend/routes/logs.py

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from backend.dependencies.auth import require_role, get_current_user
from backend.services.log_service import (
    listar_archivos_log,
    obtener_contenido_log,
    exportar_logs_csv_stream,
    contar_mensajes_no_leidos,
    marcar_mensajes_como_leidos
)
import re

router = APIRouter(prefix="/api", tags=["Logs"])

# 🔹 1. Listar archivos de log locales
@router.get("/admin/logs", summary="📄 Listar archivos de log disponibles")
def listar_logs(payload: dict = Depends(require_role(["admin", "soporte"]))):
    return listar_archivos_log()

# 🔹 2. Descargar archivo de log por nombre
@router.get("/admin/logs/{filename}", summary="⬇️ Descargar archivo de log")
def descargar_log(filename: str, payload: dict = Depends(require_role(["admin", "soporte"]))):
    if not re.match(r"^train_.*\.log$", filename):
        raise HTTPException(status_code=400, detail="Nombre de archivo inválido")

    file_path = obtener_contenido_log(filename)
    if not file_path:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    return FileResponse(file_path, media_type="text/plain", filename=filename)

# 🔹 3. Exportar logs de MongoDB a CSV
@router.get("/admin/logs/export", summary="📤 Exportar logs desde MongoDB a CSV", response_class=StreamingResponse)
def exportar_logs_csv(payload: dict = Depends(require_role(["admin", "soporte"]))):
    output = exportar_logs_csv_stream()
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=logs_exportados.csv"}
    )

# 🔹 4. Consultar cantidad de mensajes no leídos
@router.get("/logs/unread_count", summary="🔴 Consultar cantidad de mensajes no leídos")
def get_unread_count(user_id: str = Query(...), current_user=Depends(get_current_user)):
    count = contar_mensajes_no_leidos(user_id)
    return {"unread": count}

# 🔹 5. Marcar mensajes como leídos
@router.post("/logs/mark_read", summary="✅ Marcar mensajes como leídos")
def marcar_mensajes_leidos(user_id: str = Query(...), current_user=Depends(get_current_user)):
    updated_count = marcar_mensajes_como_leidos(user_id)
    return {"updated_count": updated_count}
