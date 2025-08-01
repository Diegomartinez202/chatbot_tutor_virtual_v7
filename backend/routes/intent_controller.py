# backend/routes/intent_controller.py

from fastapi import APIRouter, Depends, HTTPException, Body, Query
from backend.dependencies.auth import require_role
from backend.services import intent_manager
from backend.services.log_service import log_access

router = APIRouter()

# ============================
# 🔍 Buscar intents con filtros
# ============================
@router.get("/admin/intents/buscar", summary="Buscar intents por nombre o ejemplo")
def buscar_intents(
    intent: str = Query(None),
    example: str = Query(None),
    payload=Depends(require_role(["admin", "soporte"]))
):
    filters = {
        "intent": intent or "",
        "example": example or ""
    }

    result = intent_manager.get_intents_by_filters(filters)

    # 📋 Trazabilidad
    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint="/admin/intents/buscar",
        method="GET",
        status=200 if result else 204
    )

    return result


# ============================
# 📄 Obtener todos los intents
# ============================
@router.get("/admin/intents", summary="Listar todos los intents")
def listar_intents(payload=Depends(require_role(["admin", "soporte"]))):
    data = intent_manager.obtener_intents()

    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint="/admin/intents",
        method="GET",
        status=200 if data else 204
    )

    return data


# ============================
# ➕ Agregar un intent manualmente
# ============================
@router.post("/admin/add-intent", summary="Crear nuevo intent")
def agregar_intent(
    data: dict = Body(...),
    payload=Depends(require_role(["admin"]))
):
    if intent_manager.intent_ya_existe(data["intent"]):
        raise HTTPException(status_code=409, detail="❗ Ya existe un intent con ese nombre")

    result = intent_manager.guardar_intent(data)
    intent_manager.entrenar_rasa()

    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint="/admin/add-intent",
        method="POST",
        status=200
    )

    return result


# ============================
# 🗑️ Eliminar un intent
# ============================
@router.delete("/admin/delete-intent/{intent_name}", summary="Eliminar intent por nombre")
def eliminar_intent(
    intent_name: str,
    payload=Depends(require_role(["admin"]))
):
    result = intent_manager.eliminar_intent(intent_name)
    intent_manager.entrenar_rasa()

    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint=f"/admin/delete-intent/{intent_name}",
        method="DELETE",
        status=200
    )

    return result


# ============================
# 🔁 Cargar intents automáticamente
# ============================
@router.post("/admin/cargar_intent", summary="Recargar intents desde disco")
def cargar_intents(payload=Depends(require_role(["admin"]))):
    result = intent_manager.cargar_intents_automaticamente()

    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint="/admin/cargar_intent",
        method="POST",
        status=200
    )

    return result
# ============================
# ✏️ Actualizar un intent existente
# ============================
@router.put("/admin/update-intent", summary="Actualizar intent existente")
def actualizar_intent(
    data: dict = Body(...),
    payload=Depends(require_role(["admin"]))
):
    intent_name = data.get("intent")
    if not intent_name:
        raise HTTPException(status_code=400, detail="El campo 'intent' es obligatorio")

    if not intent_manager.intent_ya_existe(intent_name):
        raise HTTPException(status_code=404, detail="El intent no existe")

    # Primero eliminamos el viejo y luego lo reescribimos actualizado
    intent_manager.eliminar_intent(intent_name)
    result = intent_manager.guardar_intent(data)
    intent_manager.entrenar_rasa()

    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint="/admin/update-intent",
        method="PUT",
        status=200
    )

    return {"message": f"✏️ Intent '{intent_name}' actualizado correctamente"}
    @router.put("/admin/update-intent/{intent_name}", summary="Actualizar intent existente")
def actualizar_intent(
    intent_name: str,
    data: dict = Body(...),
    payload=Depends(require_role(["admin"]))
):
    # ✅ Validar estructura mínima
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="El cuerpo debe ser un diccionario JSON")

    if "examples" not in data or not isinstance(data["examples"], list) or not data["examples"]:
        raise HTTPException(status_code=422, detail="Debe incluir una lista no vacía de 'examples'")

    if "responses" not in data or not isinstance(data["responses"], list) or not data["responses"]:
        raise HTTPException(status_code=422, detail="Debe incluir una lista no vacía de 'responses'")

    if any(not e.strip() for e in data["examples"]):
        raise HTTPException(status_code=422, detail="Los 'examples' no pueden estar vacíos")

    if any(not r.strip() for r in data["responses"]):
        raise HTTPException(status_code=422, detail="Las 'responses' no pueden estar vacías")

    # ⚙️ Ejecutar actualización
    try:
        result = intent_manager.actualizar_intent(intent_name, data)
        intent_manager.entrenar_rasa()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # 🧾 Registrar acceso
    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint=f"/admin/update-intent/{intent_name}",
        method="PUT",
        status=200
    )

    return {"message": "✅ Intent actualizado correctamente", "data": result}