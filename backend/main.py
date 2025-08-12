# backend/main.py
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from typing import List, Deque, DefaultDict
from time import time
from collections import defaultdict, deque
from urllib.parse import urlencode, parse_qsl
import os

from fastapi import FastAPI, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import (
    FileResponse,
    HTMLResponse,
    JSONResponse,
    Response,
    RedirectResponse,
)
from fastapi.templating import Jinja2Templates

from backend.routes import router as api_router
from backend.utils.logger import logger
from backend.middleware.auth_middleware import AuthMiddleware
from backend.middleware.logging_middleware import LoggingMiddleware
from backend.middleware.access_log_middleware import AccessLogMiddleware
from backend.config.settings import settings
from backend.routes import exportaciones
from app.routers import admin_failed
from backend.routes import helpdesk  # <--- nuevo
from backend.routes.helpdesk import router as helpdesk_router

from backend.routes.chat import chat_router, send_message_to_bot, chat_health

# Redis opcional (rate limiting)
try:
    import redis.asyncio as aioredis  # pip install redis>=5
except Exception:
    aioredis = None

# === Paths útiles ===
STATIC_DIR = Path(settings.static_dir).resolve()
ICONS_DIR = STATIC_DIR / "icons"
WIDGETS_DIR = STATIC_DIR / "widgets"
TEMPLATES_DIR = Path(settings.template_dir).resolve()

# ⚙️ FastAPI
app = FastAPI(
    title="Chatbot Tutor Virtual API",
    description="Backend para gestión de intents, autenticación, logs y estadísticas del Chatbot Tutor Virtual",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 🌐 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📁 Estáticos / templates
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# 🔀 Rutas API agregadas
app.include_router(api_router, prefix="/api")
app.include_router(admin_failed.router)
app.include_router(exportaciones.router)
app.include_router(helpdesk.router)
app.include_router(chat_router, prefix="")  # /chat, /chat/health visibles

# 🔁 Chat alias: oculto en docs pero activo en /api
api_alias_router = APIRouter()
api_alias_router.add_api_route("/chat", send_message_to_bot, methods=["POST"], include_in_schema=False)
api_alias_router.add_api_route("/chat/health", chat_health, methods=["GET"], include_in_schema=False)
app.include_router(api_alias_router, prefix="/api")

# 🧠 Middlewares personalizados
app.add_middleware(AccessLogMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(AuthMiddleware)

# 📝 Adjunta IP y UA
@app.middleware("http")
async def add_ip_and_user_agent(request: Request, call_next):
    request.state.ip = request.client.host
    request.state.user_agent = request.headers.get("user-agent")
    return await call_next(request)

# ─────────────────────────────────────────
# 🔒 CSP (embebidos) — override por EMBED_ALLOWED_ORIGINS, fallback a settings.frame_ancestors
# Acepta: espacio ("'self' https://a.com ...") o CSV ("https://a.com,https://b.com")
# ─────────────────────────────────────────
def _parse_csv_or_space(v: str):
    s = (v or "").strip()
    if not s:
        return []
    if "," in s:
        return [x.strip() for x in s.split(",") if x.strip()]
    return s.split()

@app.middleware("http")
async def csp_headers(request: Request, call_next):
    resp: Response = await call_next(request)

    raw_env = os.getenv("EMBED_ALLOWED_ORIGINS", "")
    env_anc = _parse_csv_or_space(raw_env)
    ancestors = env_anc if env_anc else (settings.frame_ancestors or ["'self'"])

    resp.headers["Content-Security-Policy"] = f"frame-ancestors {' '.join(ancestors)};"
    resp.headers["X-Frame-Options"] = "SAMEORIGIN"  # opcional con CSP
    return resp

# 🖼️ Iconos/fav
@app.get("/favicon.ico")
async def favicon():
    path = ICONS_DIR / "favicon.ico"
    if path.is_file():
        return FileResponse(path)
    try:
        return FileResponse(Path(settings.favicon_path))
    except Exception:
        return Response(status_code=404)

@app.get("/apple-touch-icon.png")
async def apple_touch():
    path = ICONS_DIR / "apple-touch-icon.png"
    return FileResponse(path) if path.is_file() else Response(status_code=404)

@app.get("/android-chrome-192x192.png")
async def android_192():
    path = ICONS_DIR / "android-chrome-192x192.png"
    return FileResponse(path) if path.is_file() else Response(status_code=404)

@app.get("/android-chrome-512x512.png")
async def android_512():
    path = ICONS_DIR / "android-chrome-512x512.png"
    return FileResponse(path) if path.is_file() else Response(status_code=404)

@app.get("/bot-avatar.png")
async def bot_avatar():
    path = ICONS_DIR / "bot-avatar.png"
    return FileResponse(path) if path.is_file() else Response(status_code=404)

@app.get("/bot-loading.png")
async def bot_loading():
    path = ICONS_DIR / "bot-loading.png"
    return FileResponse(path) if path.is_file() else Response(status_code=404)

# 📄 Manifest
@app.get("/site.webmanifest")
async def manifest(_: Request):
    data = {
        "name": "Chatbot Tutor Virtual",
        "short_name": "TutorBot",
        "description": "Asistente virtual para consultas y soporte.",
        "lang": "es",
        "start_url": "/",
        "scope": "/",
        "display": "standalone",
        "theme_color": "#0f172a",
        "background_color": "#ffffff",
        "icons": [
            {"src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
            {"src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    return JSONResponse(data, media_type="application/manifest+json")

# ✅ Página de embed (canónica, servida por FastAPI)
@app.get("/chat-embed.html", response_class=HTMLResponse)
async def chat_embed(request: Request):
    return templates.TemplateResponse("chat-embed.html", {"request": request})

# ✅ Redirects 301 de rutas legacy → **esta** canónica
@app.get("/widget.html", include_in_schema=False)
async def legacy_widget_alias():
    return RedirectResponse(url="/chat-embed.html", status_code=301)

@app.get("/static/widgets/widget.html", include_in_schema=False)
async def legacy_static_widget_html():
    return RedirectResponse(url="/chat-embed.html", status_code=301)

# Redirige JS legacy al launcher del frontend (URL absoluta)
@app.get("/embedded.js", include_in_schema=False)
async def legacy_embedded_js_alias():
    base = settings.frontend_site_url.rstrip("/")
    return RedirectResponse(url=f"{base}/chat-widget.js", status_code=301)

@app.get("/static/widgets/embed.js", include_in_schema=False)
async def legacy_static_embed_js():
    base = settings.frontend_site_url.rstrip("/")
    return RedirectResponse(url=f"{base}/chat-widget.js", status_code=301)

@app.get("/static/widgets/embedded.js", include_in_schema=False)
async def legacy_static_embedded_js():
    base = settings.frontend_site_url.rstrip("/")
    return RedirectResponse(url=f"{base}/chat-widget.js", status_code=301)

# 🌱 Root
@app.get("/")
def root():
    return {"message": "✅ API del Chatbot Tutor Virtual en funcionamiento"}

# 🚨 Logs de arranque
if settings.debug:
    logger.warning("🛠️ MODO DEBUG ACTIVADO. No recomendado para producción.")
else:
    logger.info("🛡️ Modo producción activado.")

if settings.secret_key == "supersecretkey" or len(settings.secret_key or "") < 32:
    logger.warning('⚠️ SECRET_KEY es débil. Genera una con: python -c "import secrets; print(secrets.token_urlsafe(64))"')

logger.info("🚀 FastAPI montado correctamente. Rutas disponibles en /api y /chat")

# ─────────────────────────────────────────
# 🚦 Rate limiting: memory | redis (por ENV)
# ─────────────────────────────────────────
_RATE_BUCKETS: DefaultDict[str, Deque[float]] = defaultdict(deque)
redis_client = None

@app.on_event("startup")
async def _init_rate_limiter():
    global redis_client
    if settings.app_env == "test":
        settings.rate_limit_enabled = False
    if not settings.rate_limit_enabled:
        return
    if settings.rate_limit_backend == "redis":
        if aioredis is None:
            logger.error("RateLimit: 'redis' seleccionado pero no está instalada la librería 'redis'. Usando 'memory'.")
            settings.rate_limit_backend = "memory"
            return
        if not settings.redis_url:
            logger.error("RateLimit: 'redis' seleccionado pero REDIS_URL no está configurada. Usando 'memory'.")
            settings.rate_limit_backend = "memory"
            return
        try:
            redis_client = aioredis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
            await redis_client.ping()
            logger.info("RateLimit: backend Redis inicializado correctamente.")
        except Exception as e:
            logger.error(f"RateLimit: no se pudo conectar a Redis ({e}). Usando 'memory'.")
            settings.rate_limit_backend = "memory"

@app.on_event("shutdown")
async def _close_rate_limiter():
    global redis_client
    if redis_client:
        try:
            await redis_client.aclose()
        except Exception:
            pass

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if not settings.rate_limit_enabled:
        return await call_next(request)

    path = request.url.path
    is_chat = path == "/chat" or path == "/api/chat"
    if request.method == "POST" and is_chat:
        ip = request.client.host
        now = time()
        window = settings.rate_limit_window_sec
        max_req = settings.rate_limit_max_requests

        if settings.rate_limit_backend == "redis" and redis_client:
            key = f"rl:{ip}"
            try:
                async with redis_client.pipeline(transaction=True) as pipe:
                    pipe.incr(key)
                    pipe.expire(key, window)
                    count, _ = await pipe.execute()
                if int(count) > max_req:
                    return JSONResponse({"detail": "Rate limit exceeded. Intenta nuevamente en un momento."}, status_code=429)
            except Exception as e:
                logger.error(f"RateLimit Redis error: {e}. Fallback a 'memory'.")
                settings.rate_limit_backend = "memory"

        if settings.rate_limit_backend == "memory":
            dq = _RATE_BUCKETS[ip]
            while dq and (now - dq[0]) > window:
                dq.popleft()
            if len(dq) >= max_req:
                return JSONResponse({"detail": "Rate limit exceeded. Intenta nuevamente en un momento."}, status_code=429)
            dq.append(now)

    return await call_next(request)

# 🔥 Standalone (dev)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=settings.debug)