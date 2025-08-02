# backend/services/chat_service.py

import httpx
from backend.settings import settings

async def process_user_message(message: str, sender_id: str):
    """Envía el mensaje del usuario al endpoint de Rasa y devuelve la respuesta."""
    payload = {
        "sender": sender_id,
        "message": message
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(settings.rasa_url, json=payload)
            response.raise_for_status()
            return response.json()
    except httpx.RequestError as e:
        raise Exception(f"Error de conexión con Rasa: {str(e)}")
    except httpx.HTTPStatusError as e:
        raise Exception(f"Error HTTP al comunicarse con Rasa: {str(e.response.status_code)} - {e.response.text}")