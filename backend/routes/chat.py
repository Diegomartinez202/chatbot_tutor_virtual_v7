# backend/routes/chat.py
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Any, Dict, List

from backend.config.settings import settings  # Por si en el futuro usas flags/config aquí
from backend.db.mongodb import get_logs_collection
from backend.services.chat_service import process_user_message

# Un solo router; el alias se crea en main.py incluyéndolo con dos prefijos
chat_router = APIRouter(tags=["Chat"])

class ChatRequest(BaseModel):
    sender_id: str = Field(default="anonimo", description="ID de sesión o usuario")
    message: str
    metadata: Optional[Dict[str, Any]] = None
    mode: Optional[str] = "anonymous"

@chat_router.post("/chat", summary="Enviar mensaje al chatbot y registrar en MongoDB")
async def send_message_to_bot(data: ChatRequest, request: Request):
    # Preferimos lo que setee tu middleware; si no, usamos headers
    ip = getattr(request.state, "ip", None) or request.headers.get("x-forwarded-for") or getattr(request.client, "host", None)
    user_agent = getattr(request.state, "user_agent", None) or request.headers.get("user-agent", "")

    # 🔁 Procesar mensaje con Rasa (servicio propio)
    try:
        bot_responses: List[Dict[str, Any]] = await process_user_message(data.message, data.sender_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error al comunicar con Rasa: {str(e)}")

    # Intent (defensivo: depende de lo que retorne tu servicio)
    intent = None
    try:
        if bot_responses and isinstance(bot_responses[0], dict):
            intent = (
                bot_responses[0].get("intent", {}).get("name")
                or bot_responses[0].get("metadata", {}).get("intent")
            )
    except Exception:
        intent = None

    # 📝 Registro en logs de conversación
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
        "metadata": data.metadata or {},
    }

    try:
        get_logs_collection().insert_one(log)
    except Exception:
        # No rompemos la respuesta si falla el log
        pass

    # 🔁 Compatibilidad: regresamos la lista de respuestas de Rasa, no un wrapper {"ok": True, ...}
    return bot_responses

# Healthcheck útil para widget/panel
@chat_router.get("/chat/health", summary="Healthcheck de chat")
async def chat_health():
    return {"ok": True}