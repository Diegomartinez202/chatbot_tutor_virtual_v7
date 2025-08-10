# backend/main.py

from dotenv import load_dotenv
load_dotenv()
from pathlib import Path
from typing import List
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response
from fastapi.templating import Jinja2Templates
from backend.routes import router as api_router
from backend.utils.logger import logger
from backend.middleware.auth_middleware import AuthMiddleware
from backend.middleware.logging_middleware import LoggingMiddleware
from backend.middleware.access_log_middleware import AccessLogMiddleware
from backend.config.settings import settings
from backend.routes import exportaciones
from app.routers import admin_failed
from backend.routes.chat import router_public as chat_public_router
from fastapi.responses import RedirectResponse
# === Paths útiles ===
STATIC_DIR = Path(settings.static_dir).resolve()
ICONS_DIR = STATIC_DIR / "icons"
WIDGETS_DIR = STATIC_DIR / "widgets"
TEMPLATES_DIR = Path(settings.template_dir).resolve()

# ⚙️ Inicialización FastAPI
app = FastAPI(
    title="Chatbot Tutor Virtual API",
    description="Backend para gestión de intents, autenticación, logs y estadísticas del Chatbot Tutor Virtual",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 🌐 CORS (usa settings.allowed_origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📁 Estáticos y templates
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# 🔀 Rutas API
app.include_router(api_router, prefix="/api")
app.include_router(admin_failed.router)
app.include_router(exportaciones.router)
app.include_router(chat_public_router)
# 🧠 Middlewares personalizados
app.add_middleware(AccessLogMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(AuthMiddleware)

# 📝 Middleware: adjunta IP y User-Agent a la request
@app.middleware("http")
async def add_ip_and_user_agent(request: Request, call_next):
    request.state.ip = request.client.host
    request.state.user_agent = request.headers.get("user-agent")
    return await call_next(request)

# 🔒 CSP: permite embeber desde dominios autorizados (Zajuna, etc.)
@app.middleware("http")
async def csp_headers(request: Request, call_next):
    resp: Response = await call_next(request)

    # TODO: añade aquí tus dominios reales del frontend o sitios donde se incruste el widget
    default_ancestors = ["'self'", "https://zajuna.com", "https://www.zajuna.com"]
    try:
        # Si tienes settings.frame_ancestors puedes usarlo, si no, defaults:
        frame_ancestors: List[str] = getattr(settings, "frame_ancestors", []) or default_ancestors
    except Exception:
        frame_ancestors = default_ancestors

    resp.headers["Content-Security-Policy"] = f"frame-ancestors {' '.join(frame_ancestors)};"
    # X-Frame-Options está deprecado, pero lo dejamos para compat con navegadores viejos
    # (ten en cuenta que solo admite 'DENY', 'SAMEORIGIN' o 'ALLOW-FROM <url>' en algunos IE antiguos)
    resp.headers["X-Frame-Options"] = "SAMEORIGIN"
    return resp

# 🖼️ Favicon e iconos "amigables" en raíz
@app.get("/favicon.ico")
async def favicon():
    path = ICONS_DIR / "favicon.ico"
    if path.is_file():
        return FileResponse(path)
    # Fallback a settings si lo tienes configurado
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

# (Opcional) accesos directos para tu avatar/loader desde raíz:
@app.get("/bot-avatar.png")
async def bot_avatar():
    path = ICONS_DIR / "bot-avatar.png"
    return FileResponse(path) if path.is_file() else Response(status_code=404)

@app.get("/bot-loading.png")
async def bot_loading():
    path = ICONS_DIR / "bot-loading.png"
    return FileResponse(path) if path.is_file() else Response(status_code=404)

# 📄 Manifest (dinámico para backend)
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

# ✅ Alias "bonitos" para tus widgets estáticos
@app.get("/widget.html")
async def widget_alias():
    return FileResponse(WIDGETS_DIR / "widget.html")

@app.get("/embedded.js")
async def embedded_alias():
    return FileResponse(WIDGETS_DIR / "embedded.js")

# ✅ Página de embed (plantilla Jinja)
@app.get("/chat-embed.html", response_class=HTMLResponse)
async def chat_embed(request: Request):
    # Asegúrate de tener templates/chat-embed.html
    return templates.TemplateResponse("chat-embed.html", {"request": request})

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
    logger.warning("⚠️ SECRET_KEY es débil. Genera una con: python -c \"import secrets; print(secrets.token_urlsafe(64))\"")

logger.info("🚀 FastAPI montado correctamente. Rutas disponibles en /api")

# 🔥 Standalone (dev)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=settings.debug)
@app.api_route("/chat", methods=["POST", "OPTIONS"])
async def chat_alias(request: Request):
    # Preflight simple si algún cliente manda OPTIONS
    if request.method == "OPTIONS":
        return Response(status_code=200)
    # 307 mantiene método y body (POST) ➜ el navegador re-envía a /api/chat
    return RedirectResponse(url="/api/chat", status_code=307)