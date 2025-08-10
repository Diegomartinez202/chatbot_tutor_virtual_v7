from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from datetime import datetime
from backend.config.settings import settings  # ✅ Uso correcto del settings global
from backend.db.mongodb import get_logs_collection  # ✅ Asegúrate de que el archivo se llame mongodb.py
from backend.services.chat_service import process_user_message
from backend.schemas.chat import ChatRequest

router = APIRouter(prefix="/api", tags=["Chat"])

# 📥 Modelo del mensaje recibido desde frontend o widget
class ChatRequest(BaseModel):
    sender_id: str = "anonimo"
    message: str

@router.post("/chat", summary="Enviar mensaje al chatbot y registrar en MongoDB")
async def send_message_to_bot(data: ChatRequest, request: Request):
    ip = request.state.ip
    user_agent = request.state.user_agent

    try:
        # 🔁 Procesar mensaje con Rasa
        bot_responses = await process_user_message(data.message, data.sender_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al comunicar con Rasa: {str(e)}")

    # 📝 Registro en logs de conversación
    log = {
        "sender_id": data.sender_id,
        "user_message": data.message,
        "bot_response": [r.get("text", "") for r in bot_responses],
        "intent": bot_responses[0].get("intent", {}).get("name") if bot_responses else None,
        "timestamp": datetime.utcnow(),
        "ip": ip,
        "user_agent": user_agent,
        "origen": "widget" if data.sender_id == "anonimo" else "autenticado"
    }

    get_logs_collection().insert_one(log)
    return bot_responses
# Router principal (API)
router_api = APIRouter(prefix="/api", tags=["Chat"])

@router_api.post("/chat", summary="Enviar mensaje al chatbot y registrar en MongoDB")
async def send_message_to_bot(data: ChatRequest, request: Request):
    ip = getattr(request.state, "ip", None)
    user_agent = getattr(request.state, "user_agent", None)

    try:
        bot_responses = await process_user_message(data.message, data.sender_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al comunicar con Rasa: {str(e)}")

    log = {
        "sender_id": data.sender_id,
        "user_message": data.message,
        "bot_response": [r.get("text", "") for r in bot_responses],
        "intent": bot_responses[0].get("intent", {}).get("name") if bot_responses else None,
        "timestamp": datetime.utcnow(),
        "ip": ip,
        "user_agent": user_agent,
        "origen": "widget" if data.sender_id == "anonimo" else "autenticado",
    }
    get_logs_collection().insert_one(log)
    return bot_responses

# Router PÚBLICO sin prefijo: expone /chat como alias del mismo endpoint
router_public = APIRouter(tags=["Chat (alias)"])
router_public.add_api_route(
    path="/chat",
    endpoint=send_message_to_bot,   # misma función que /api/chat
    methods=["POST"],
    summary="Alias de /api/chat (retrocompatibilidad)",
)

# Mantener compat: tu __init__.py importa chat.router
router = router_api