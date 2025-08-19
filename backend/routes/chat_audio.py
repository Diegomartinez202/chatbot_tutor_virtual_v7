from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import tempfile, os, aiohttp, asyncio

router = APIRouter(prefix="/api/chat", tags=["chat"])

# ========= Config =========
RASA_REST_URL = os.getenv("RASA_REST_URL", "http://rasa:5005/webhooks/rest/webhook")
MONGODB_URL   = os.getenv("MONGODB_URL",  "mongodb://localhost:27017")
MONGODB_DB    = os.getenv("MONGODB_DB",   "chatbot_admin")

MAX_BYTES = 15 * 1024 * 1024
ALLOWED_TYPES = {"audio/webm", "audio/ogg", "audio/mpeg", "audio/wav"}

# TTL para refs de audio (si decides guardar URL del audio en storage externo)
AUDIO_TTL_DAYS = int(os.getenv("AUDIO_TTL_DAYS", "7"))

# ========= Mongo =========
_client = AsyncIOMotorClient(MONGODB_URL)
_db = _client[MONGODB_DB]
_voice_logs = _db["voice_logs"]                  # logs permanentes (no TTL)
_voice_audio_refs = _db["voice_audio_refs"]      # referencias a audio (TTL por expires_at)

_indexes_ready = False
_indexes_lock = asyncio.Lock()

async def ensure_indexes():
    """
    Crea índices (idempotente).
    - voice_logs: índice por created_at (desc)
    - voice_audio_refs: TTL por expires_at (borra doc cuando pasa la fecha)
    """
    global _indexes_ready
    if _indexes_ready:
        return
    async with _indexes_lock:
        if _indexes_ready:
            return
        # voice_logs
        await _voice_logs.create_index([("created_at", -1)], name="created_at_desc")
        # voice_audio_refs TTL
        await _voice_audio_refs.create_index(
            [("expires_at", 1)],
            expireAfterSeconds=0,
            name="ttl_expires_at"
        )
        _indexes_ready = True

# ========= Modelos de respuesta =========
class AudioResp(BaseModel):
    ok: bool
    transcript: str
    bot: dict

# ========= Utilidades =========
async def transcribe_stub(filepath: str, lang: str) -> str:
    """
    Placeholder de transcripción. Reemplaza por tu STT real (Whisper, GCP, Azure, etc.).
    """
    # Ejemplo con faster-whisper (si lo habilitas):
    # from faster_whisper import WhisperModel
    # model = WhisperModel("small", compute_type="auto")
    # segments, info = model.transcribe(filepath, language=(None if lang == "auto" else lang))
    # text = " ".join(seg.text for seg in segments).strip()
    # return text or ""
    return "(transcripción simulada) hola, necesito ayuda con fracciones"

# ========= Endpoint =========
@router.post("/audio", response_model=AudioResp)
async def chat_audio(
    file: UploadFile = File(...),
    user_id: str | None = Form(None),
    lang: str = Form("es"),                # "es" o "auto"
    persona: str | None = Form(None),
    session_id: str | None = Form(None),
):
    # Validación básica
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(415, "Unsupported media type")

    data = await file.read()
    size_bytes = len(data)
    if size_bytes > MAX_BYTES:
        raise HTTPException(413, "Audio too large")

    # Guarda temporal (si tu STT lo requiere)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(data)
        path = tmp.name

    try:
        # --- TRANSCRIPCIÓN ---
        text = await transcribe_stub(path, lang)
        if not text.strip():
            raise HTTPException(400, "Empty transcript")

        # --- ENVÍO A RASA REST ---
        sender = user_id or session_id or "anon"
        payload = {
            "sender": sender,
            "message": text,
            "metadata": {"via": "audio", "persona": persona, "lang": lang},
        }

        async with aiohttp.ClientSession() as s:
            async with s.post(RASA_REST_URL, json=payload, timeout=30) as r:
                # Rasa suele devolver lista de mensajes
                bot_msgs = await r.json()

        # --- LOGS en Mongo ---
        await ensure_indexes()
        now = datetime.now(timezone.utc)

        log_doc = {
            "user_id": user_id,
            "session_id": session_id,
            "transcript": text,
            "duration_ms": None,                      # Si luego calculas duración real, setéala
            "stt": {"engine": "stub", "lang": lang, "confidence": None},
            "mime": file.content_type,
            "size_bytes": size_bytes,
            "created_at": now,
            "error": None,
        }
        await _voice_logs.insert_one(log_doc)

        # (Opcional) Si subes el audio a S3/MinIO/Cloud y quieres TTL:
        # audio_url = "https://s3/tu-bucket/..."   # sube primero y obtén URL
        # await _voice_audio_refs.insert_one({
        #     "user_id": user_id,
        #     "session_id": session_id,
        #     "audio_url": audio_url,
        #     "created_at": now,
        #     "expires_at": now + timedelta(days=AUDIO_TTL_DAYS),
        # })

        return {"ok": True, "transcript": text, "bot": {"messages": bot_msgs}}

    finally:
        try:
            os.remove(path)
        except:
            pass