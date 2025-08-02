# backend/routes/intent_controller.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from typing import List
import io, json, csv

from backend.dependencies.auth import require_role
from backend.services.log_service import log_access
from backend.services.intent_manager import (
    obtener_intents,
    guardar_intent,
    eliminar_intent,
    intent_ya_existe,
    cargar_intents,
    guardar_intent_csv,
    cargar_intents_automaticamente
)
from backend.services.train_service import entrenar_chatbot as entrenar_rasa
from backend.services.user_service import export_users_csv


router = APIRouter()

# 🔹 1. Listar intents existentes
@router.get("/admin/intents", summary="🧠 Obtener lista de intents")
def listar_intents(request: Request, payload=Depends(require_role(["admin"]))):
    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint="/admin/intents",
        method="GET",
        status=200,
        extra={"ip": request.client.host, "user_agent": request.headers.get("user-agent")}
    )
    return obtener_intents()

# 🔹 2. Crear nuevo intent desde panel
@router.post("/admin/intents", summary="📥 Crear nuevo intent manualmente")
def crear_intent(request: Request, data: dict, payload=Depends(require_role(["admin"]))):
    if intent_ya_existe(data.get("intent")):
        log_access(
            user_id=payload["_id"],
            email=payload["email"],
            rol=payload["rol"],
            endpoint="/admin/intents",
            method="POST",
            status=400,
            extra={"ip": request.client.host, "user_agent": request.headers.get("user-agent")}
        )
        raise HTTPException(status_code=400, detail="⚠️ El intent ya existe")

    resultado = guardar_intent(data)
    entrenar_rasa()

    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint="/admin/intents",
        method="POST",
        status=201,
        extra={"ip": request.client.host, "user_agent": request.headers.get("user-agent")}
    )

    return resultado

# 🔹 3. Eliminar intent por nombre
@router.delete("/admin/intents/{intent_name}", summary="🗑️ Eliminar intent")
def eliminar_intent_por_nombre(intent_name: str, request: Request, payload=Depends(require_role(["admin"]))):
    resultado = eliminar_intent(intent_name)

    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint=f"/admin/intents/{intent_name}",
        method="DELETE",
        status=200,
        extra={"ip": request.client.host, "user_agent": request.headers.get("user-agent")}
    )

    return resultado

# 🔹 4. Recargar intents desde archivo local y reentrenar
@router.post("/admin/intents/recargar", summary="♻️ Recargar intents automáticamente desde archivo")
def recargar_intents(request: Request, payload=Depends(require_role(["admin"]))):
    resultado = cargar_intents_automaticamente()
    entrenar_rasa()

    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint="/admin/intents/recargar",
        method="POST",
        status=200,
        extra={"ip": request.client.host, "user_agent": request.headers.get("user-agent")}
    )

    return resultado

# 🔹 5. Subir archivo CSV/JSON para cargar intents
@router.post("/admin/intents/upload", summary="📂 Subir intents desde archivo CSV o JSON")
async def subir_archivo_intents(request: Request, file: UploadFile = File(...), payload=Depends(require_role(["admin"]))):
    content = await file.read()

    if file.filename.endswith(".json"):
        data = json.loads(content)
    elif file.filename.endswith(".csv"):
        decoded = content.decode("utf-8").splitlines()
        reader = csv.DictReader(decoded)
        data = list(reader)
    else:
        log_access(
            user_id=payload["_id"],
            email=payload["email"],
            rol=payload["rol"],
            endpoint="/admin/intents/upload",
            method="POST",
            status=400,
            extra={"ip": request.client.host, "user_agent": request.headers.get("user-agent")}
        )
        raise HTTPException(status_code=400, detail="Formato de archivo no soportado")

    resultado = cargar_intents(data)
    entrenar_rasa()

    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint="/admin/intents/upload",
        method="POST",
        status=201,
        extra={"ip": request.client.host, "user_agent": request.headers.get("user-agent")}
    )

    return resultado

# 🔹 6. Exportar intents existentes a CSV
@router.get("/admin/intents/export", summary="📤 Exportar intents a CSV", response_class=StreamingResponse)
def exportar_intents(request: Request, payload=Depends(require_role(["admin"]))):
    output = guardar_intent_csv()

    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint="/admin/intents/export",
        method="GET",
        status=200,
        extra={"ip": request.client.host, "user_agent": request.headers.get("user-agent")}
    )

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=intents_exportados.csv"}
    )
# 🔹 1. Exportar usuarios a CSV
@router.get("/admin/users/export", summary="📤 Exportar usuarios a CSV", response_class=StreamingResponse)
def exportar_usuarios(request: Request, payload=Depends(require_role(["admin"]))):
    """
    Permite a un administrador exportar todos los usuarios registrados (sin contraseñas) a un archivo CSV.
    El archivo se genera dinámicamente con nombre basado en la fecha actual.
    """

    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint="/admin/users/export",
        method="GET",
        status=200,
        extra={
            "ip": request.client.host,
            "user_agent": request.headers.get("user-agent")
        }
    )

    return export_users_csv()