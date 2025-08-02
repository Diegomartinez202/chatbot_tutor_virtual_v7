# backend/services/chat_service.py

import httpx
from backend.config.settings import settings  # ✅ Uso correcto del settings global

async def process_user_message(message: str, sender_id: str):
    payload = {
        "sender": sender_id,
        "message": message
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(settings.rasa_url, json=payload)  # 🔁 Variable de entorno Pydantic
            response.raise_for_status()
            return response.json()
    except httpx.RequestError as e:
        raise Exception(f"❌ Error de conexión con Rasa: {e}")
    except httpx.HTTPStatusError as e:
        raise Exception(f"⚠️ Error HTTP: {e.response.status_code} - {e.response.text}")