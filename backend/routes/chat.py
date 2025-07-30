from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
import httpx
import os
from backend.db.mongodb import get_logs_collection

router = APIRouter(prefix="/api", tags=["Chat"])

# 🌍 URL de Rasa (servicio interno en Docker o localhost)
RASA_URL = os.getenv("RASA_URL", "http://rasa:5005/webhooks/rest/webhook")

# 🧾 Modelo del mensaje que se recibe del frontend
class ChatRequest(BaseModel):
    sender_id: str  # puede ser el ID del usuario autenticado o "anonimo"
    message: str

# 📤 Enviar mensaje a Rasa y guardar en MongoDB
@router.post("/chat", summary="Enviar mensaje al chatbot y registrar en MongoDB")
async def send_message_to_bot(data: ChatRequest, request: Request):
    # 1. Enviar a Rasa
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
        "ip": request.client.host
    }
    logs_collection = get_logs_collection()
    logs_collection.insert_one(log)

    # 3. Devolver respuestas del bot
    return bot_responses