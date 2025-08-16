# backend/main.py
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from typing import Deque, DefaultDict
from time import time
from collections import defaultdict, deque
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, Response, RedirectResponse

# 🚀 Settings y logging unificado
from backend.config.settings import settings
from backend.utils.logging import setup_logging, get_logger
from backend.middleware.request_id import RequestIdMiddleware

# 🧩 Middlewares propios
from backend.middleware.auth_middleware import AuthMiddleware
from backend.middleware.logging_middleware import LoggingMiddleware
from backend.middleware.access_log_middleware import AccessLogMiddleware
from backend.middleware.request_meta import request_meta_middleware  # IP/UA

# 🧭 Routers
from backend.routes import router as api_router
from backend.routes import exportaciones
from app.routers import admin_failed
from backend.routes import helpdesk
from backend.routes.chat import chat_router  # expone /chat, /chat/health, /chat/debug
from backend.routes import api_chat

# ✅ [NEW] Stats router (/api/stats/*)
from backend.routes import stats  # <-- añade el archivo backend/routes/stats.py con el router que te compartí

# Redis opcional (rate limiting)
try:
    import redis.asyncio as aioredis  # pip install "redis>=5"
except Exception:
    aioredis = None

# === Paths útiles (solo por si aún usas estáticos del backend para descargas) ===
STATIC_DIR = Path(settings.static_dir).resolve()

# === Logger de módulo ===
setup_logging()
log = get_logger(__name__)


def _parse_csv_or_space(v: str):
    s = (v or "").strip()
    if not s:
        return []
    if "," in s:
        return [x.strip() for x in s.split(",") if x.strip()]
    return s.split()


def create_app() -> FastAPI:
    app = FastAPI(
        debug=settings.debug,
        title="Zajuna Chat Backend",
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

    # 🔎 Request-ID para trazabilidad
    app.add_middleware(RequestIdMiddleware, header_name="X-Request-ID")

    # ➕ Middleware IP/UA centralizado
    app.middleware("http")(request_meta_middleware)

    # 📁 Estáticos propios del backend (descargas/exportaciones, si las tienes)
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

    # 🔀 Rutas API agregadas
    app.include_router(api_router, prefix="/api")
    app.include_router(admin_failed.router)
    app.include_router(exportaciones.router)
    app.include_router(helpdesk.router)
    app.include_router(api_chat.router)

    # ✅ Chat router montado dos veces (compat): raíz y /api
    app.include_router(chat_router)                # /chat/*
    app.include_router(chat_router, prefix="/api") # /api/chat/*

    # ✅ [NEW] Exponer /api/stats (summary/series/confusion/latency)
    #     Requiere: backend/routes/stats.py con "router = APIRouter(prefix='/api/stats', ...)"
    app.include_router(stats.router)

    # ─────────────────────────────────────────
    # 🔒 CSP (embebidos) — override por EMBED_ALLOWED_ORIGINS, fallback a settings.frame_ancestors
    # ─────────────────────────────────────────
    @app.middleware("http")
    async def csp_headers(request: Request, call_next):
        resp: Response = await call_next(request)
        raw_env = os.getenv("EMBED_ALLOWED_ORIGINS", "")
        env_anc = _parse_csv_or_space(raw_env)
        ancestors = env_anc if env_anc else (settings.frame_ancestors or ["'self'"])
        resp.headers["Content-Security-Policy"] = f"frame-ancestors {' '.join(ancestors)};"
        resp.headers["X-Frame-Options"] = "SAMEORIGIN"  # compat
        return resp

    # 🧠 Middlewares personalizados (orden conservado)
    app.add_middleware(AccessLogMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(AuthMiddleware)

    # 🌐 Base pública del frontend (donde vive Vite/public)
    FRONT_BASE = (settings.frontend_site_url or "").rstrip("/")

    # 🖼️ Redirecciones de iconos/manifest → frontend (assets en public/)
    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/favicon.ico", status_code=302)
        return Response(status_code=404)

    @app.get("/apple-touch-icon.png", include_in_schema=False)
    async def apple_touch():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/apple-touch-icon.png", status_code=302)
        return Response(status_code=404)

    @app.get("/android-chrome-192x192.png", include_in_schema=False)
    async def android_192():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/android-chrome-192x192.png", status_code=302)
        return Response(status_code=404)

    @app.get("/android-chrome-512x512.png", include_in_schema=False)
    async def android_512():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/android-chrome-512x512.png", status_code=302)
        return Response(status_code=404)

    @app.get("/bot-avatar.png", include_in_schema=False)
    async def bot_avatar():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/bot-avatar.png", status_code=302)
        return Response(status_code=404)

    @app.get("/bot-loading.png", include_in_schema=False)
    async def bot_loading():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/bot-loading.png", status_code=302)
        return Response(status_code=404)

    # 📄 Manifest → frontend
    @app.get("/site.webmanifest", include_in_schema=False)
    async def manifest():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/site.webmanifest", status_code=302)
        # Fallback mínimo si no hay FRONT_BASE
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
                {"src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            ],
        }
        return JSONResponse(data, media_type="application/manifest+json")

    # ✅ /chat-embed.html ahora lo sirve el frontend → redirige acá
    @app.get("/chat-embed.html", include_in_schema=False)
    async def chat_embed_alias():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/chat-embed.html", status_code=302)
        return JSONResponse(
            {"detail": "chat-embed vive en el frontend (public/chat-embed.html). Configura FRONTEND_SITE_URL."},
            status_code=501,
        )

    # ✅ Redirects 301 legacy → launcher moderno del frontend
    @app.get("/widget.html", include_in_schema=False)
    async def legacy_widget_alias():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/chat-embed.html", status_code=301)
        return JSONResponse({"detail": "chat-embed vive en el frontend."}, status_code=501)

    @app.get("/static/widgets/widget.html", include_in_schema=False)
    async def legacy_static_widget_html():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/chat-embed.html", status_code=301)
        return JSONResponse({"detail": "chat-embed vive en el frontend."}, status_code=501)

    @app.get("/embedded.js", include_in_schema=False)
    async def legacy_embedded_js_alias():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/chat-widget.js", status_code=301)
        return JSONResponse({"detail": "chat-widget vive en el frontend."}, status_code=501)

    @app.get("/static/widgets/embed.js", include_in_schema=False)
    async def legacy_static_embed_js():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/chat-widget.js", status_code=301)
        return JSONResponse({"detail": "chat-widget vive en el frontend."}, status_code=501)

    @app.get("/static/widgets/embedded.js", include_in_schema=False)
    async def legacy_static_embedded_js():
        if FRONT_BASE:
            return RedirectResponse(url=f"{FRONT_BASE}/chat-widget.js", status_code=301)
        return JSONResponse({"detail": "chat-widget vive en el frontend."}, status_code=501)

    # 🌱 Root + Health
    @app.get("/")
    def root():
        return {"message": "✅ API del Chatbot Tutor Virtual en funcionamiento"}

    @app.get("/health")
    async def health():
        return {"ok": True}

    # 🚨 Logs de arranque
    if settings.debug:
        log.warning("🛠️ MODO DEBUG ACTIVADO. No recomendado para producción.")
    else:
        log.info("🛡️ Modo producción activado.")

    if not settings.secret_key or len(settings.secret_key) < 32:
        log.warning('⚠️ SECRET_KEY es débil o inexistente. Genera una con: python -c "import secrets; print(secrets.token_urlsafe(64))"')

    log.info("🚀 FastAPI montado correctamente. Rutas disponibles en /api y /chat")

    # ─────────────────────────────────────────
    # 🚦 Rate limiting: memory | redis (por ENV)
    # ─────────────────────────────────────────
    _RATE_BUCKETS: DefaultDict[str, Deque[float]] = defaultdict(deque)
    redis_client = None

    @app.on_event("startup")
    async def _init_rate_limiter():
        nonlocal redis_client
        if settings.app_env == "test":
            # Desactiva RL en tests
            object.__setattr__(settings, "rate_limit_enabled", False)
        if not settings.rate_limit_enabled:
            return
        if settings.rate_limit_backend == "redis":
            if aioredis is None:
                log.error("RateLimit: 'redis' seleccionado pero falta librería 'redis'. Usando 'memory'.")
                object.__setattr__(settings, "rate_limit_backend", "memory")
                return
            if not settings.redis_url:
                log.error("RateLimit: 'redis' seleccionado pero REDIS_URL no está configurada. Usando 'memory'.")
                object.__setattr__(settings, "rate_limit_backend", "memory")
                return
            try:
                redis_client = aioredis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
                await redis_client.ping()
                log.info("RateLimit: backend Redis inicializado correctamente.")
            except Exception as e:
                log.error(f"RateLimit: no se pudo conectar a Redis ({e}). Usando 'memory'.")
                object.__setattr__(settings, "rate_limit_backend", "memory")

    @app.on_event("shutdown")
    async def _close_rate_limiter():
        nonlocal redis_client
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
        is_chat_post = request.method == "POST" and (path == "/chat" or path == "/api/chat")
        if not is_chat_post:
            return await call_next(request)

        ip = getattr(request.state, "ip", None) or (request.client.host if request.client else "unknown")
        now = time()
        window = settings.rate_limit_window_sec
        max_req = settings.rate_limit_max_requests

        # Redis
        if settings.rate_limit_backend == "redis" and 'redis_client' in locals() and redis_client:
            key = f"rl:{ip}"
            try:
                async with redis_client.pipeline(transaction=True) as pipe:
                    pipe.incr(key)
                    pipe.expire(key, window)
                    count, _ = await pipe.execute()
                if int(count) > max_req:
                    return JSONResponse({"detail": "Rate limit exceeded. Intenta nuevamente en un momento."}, status_code=429)
            except Exception as e:
                log.error(f"RateLimit Redis error: {e}. Fallback a 'memory'.")
                object.__setattr__(settings, "rate_limit_backend", "memory")

        # Memory
        if settings.rate_limit_backend == "memory":
            dq = _RATE_BUCKETS[ip]
            while dq and (now - dq[0]) > window:
                dq.popleft()
            if len(dq) >= max_req:
                return JSONResponse({"detail": "Rate limit exceeded. Intenta nuevamente en un momento."}, status_code=429)
            dq.append(now)

        return await call_next(request)

    return app


app = create_app()

# 🔥 Standalone (dev)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=settings.debug)