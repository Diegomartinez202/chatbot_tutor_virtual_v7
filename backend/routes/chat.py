# backend/routes/chat.py
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Any, Dict, List

import os
import jwt  # PyJWT

from backend.config.settings import settings
from backend.db.mongodb import get_logs_collection
from backend.services.chat_service import process_user_message

chat_router = APIRouter(tags=["Chat"])

# ======== JWT config (HS256 o RS256) ========
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256").strip()
JWT_PUBLIC_KEY = (os.getenv("JWT_PUBLIC_KEY") or "").strip()  # para RS256
SECRET_KEY = (os.getenv("SECRET_KEY") or "CHANGE_ME").strip()  # para HS256


def _decode_authorization(auth_header: Optional[str]) -> Dict[str, Any]:
    """
    Devuelve claims si el JWT es válido; {} si no hay/vale token.
    - RS256: usa JWT_PUBLIC_KEY
    - HS256: usa SECRET_KEY
    """
    if not auth_header or not auth_header.lower().startswith("bearer "):
        return {}
    token = auth_header.split(" ", 1)[1].strip()
    try:
        if JWT_ALGORITHM.upper().startswith("RS"):
            if not JWT_PUBLIC_KEY:
                return {}
            return jwt.decode(
                token,
                JWT_PUBLIC_KEY,
                algorithms=[JWT_ALGORITHM],
                options={"verify_aud": False},
            )
        # HS por defecto
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            options={"verify_aud": False},
        )
    except Exception:
        return {}


class ChatRequest(BaseModel):
    # Compatibilidad: el frontend suele enviar "sender"; mantenemos "sender_id" interno
    sender_id: str = Field(default="anonimo", description="ID de sesión o usuario", alias="sender")
    message: str
    metadata: Optional[Dict[str, Any]] = None
    mode: Optional[str] = "anonymous"

    class Config:
        allow_population_by_field_name = True
        allow_mutation = True
        extra = "allow"


@chat_router.post("/chat", summary="Enviar mensaje al chatbot y registrar en MongoDB")
async def send_message_to_bot(data: ChatRequest, request: Request):
    # Tomar IP/UA del middleware; fallback a headers si no existe
    ip = getattr(request.state, "ip", None) or request.headers.get("x-forwarded-for") or getattr(request.client, "host", None)
    user_agent = getattr(request.state, "user_agent", None) or request.headers.get("user-agent", "")

    # Enriquecer metadata con auth (hasToken/claims) a partir del Authorization: Bearer
    auth_header = request.headers.get("authorization")
    claims = _decode_authorization(auth_header)

    enriched_meta: Dict[str, Any] = dict(data.metadata or {})
    auth_meta = dict(enriched_meta.get("auth") or {})
    if claims:
        auth_meta.update({"hasToken": True, "claims": claims})
    else:
        auth_meta.update({"hasToken": False})
    enriched_meta["auth"] = auth_meta

    # Añadir referer si no viene, útil para auditoría
    if "url" not in enriched_meta and "referer" in request.headers:
        enriched_meta["url"] = request.headers.get("referer")

    # 🔁 Procesar mensaje con Rasa
    try:
        try:
            bot_responses: List[Dict[str, Any]] = await process_user_message(
                data.message, data.sender_id, metadata=enriched_meta  # type: ignore
            )
        except TypeError:
            bot_responses = await process_user_message(data.message, data.sender_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error al comunicar con Rasa: {str(e)}")

    # Intent defensivo
    intent = None
    try:
        if bot_responses and isinstance(bot_responses[0], dict):
            intent = (
                bot_responses[0].get("intent", {}).get("name")
                or bot_responses[0].get("metadata", {}).get("intent")
            )
    except Exception:
        intent = None

    # 📝 Log en Mongo
    log = {
        "sender_id": data.sender_id,
        "user_message": data.message,
        "bot_response": [
            r.get("text") if isinstance(r, dict) else str(r)
            for r in (bot_responses or [])
        ],
        "intent": intent,
        "timestamp": datetime.utcnow(),
        "ip": ip,
        "user_agent": user_agent,
        "origen": "widget" if data.sender_id == "anonimo" else "autenticado",
        "metadata": enriched_meta,
    }

    try:
        get_logs_collection().insert_one(log)
    except Exception:
        pass

    # Respuesta directa estilo Rasa (array)
    return bot_responses


@chat_router.get("/chat/health", summary="Healthcheck de chat")
async def chat_health():
    return {"ok": True}


@chat_router.post("/chat/debug", summary="Inspección rápida de payload (solo DEBUG)")
async def chat_debug(data: ChatRequest, request: Request):
    if not bool(getattr(settings, "DEBUG", False)):
        # Oculto en producción
        raise HTTPException(status_code=404, detail="Not found")

    auth_header = request.headers.get("authorization", "")
    claims = _decode_authorization(auth_header)

    return {
        "debug": True,
        "sender_id": data.sender_id,
        "message": data.message,
        "metadata_in": data.metadata,
        "derived": {
            "hasToken": bool(claims),
            "claims_keys": list(claims.keys()) if claims else [],
        },
        "request_meta": {
            "ip": getattr(request.state, "ip", None),
            "user_agent": getattr(request.state, "user_agent", None),
            "authorization_present": bool(auth_header),
            "referer": request.headers.get("referer"),
        },
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }