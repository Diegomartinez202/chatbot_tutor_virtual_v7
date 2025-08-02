from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
import httpx
from backend.db.mongodb import get_logs_collection
from backend.settings import settings  # ✅ Usar settings centralizado
from backend.services.chat_service import process_user_message
router = APIRouter(prefix="/api", tags=["Chat"])

RASA_URL = settings.rasa_url  # 🌍 URL interna para Rasa

# 🧾 Modelo del mensaje entrante
class ChatRequest(BaseModel):
    sender_id: str = "anonimo"  # puede ser "anonimo" o ID real
    message: str

@router.post("/chat", summary="Enviar mensaje al chatbot y registrar en MongoDB")
async def send_message_to_bot(data: ChatRequest, request: Request):
    # ✅ Obtener IP y User-Agent desde el middleware
    ip = request.state.ip
    user_agent = request.state.user_agent

    # 1. Enviar mensaje al bot (Rasa)
    try:
        async with httpx.AsyncClient() as client:
            rasa_response = await client.post(RASA_URL, json={
                "sender": data.sender_id,
                "message": data.message
            })
            if rasa_response.status_code != 200:
                raise HTTPException(status_code=500, detail="Error al contactar a Rasa")
            bot_responses = rasa_response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo al comunicar con Rasa: {e}")

    # 2. Guardar en MongoDB
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

    logs_collection = get_logs_collection()
    logs_collection.insert_one(log)

    # 3. Responder al frontend
    return bot_responses