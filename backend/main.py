# backend/main.py

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates

from backend.routes import router as api_router
from backend.utils.logger import logger
from backend.middleware.auth_middleware import AuthMiddleware
from backend.middleware.logging_middleware import LoggingMiddleware
from backend.middleware.access_log_middleware import AccessLogMiddleware
from backend.config.settings import settings
from backend.routes import exportaciones  # nuevo
# ⚙️ Inicialización de la aplicación FastAPI
app = FastAPI(
    title="Chatbot Tutor Virtual API",
    description="Backend para gestión de intents, autenticación, logs y estadísticas del Chatbot Tutor Virtual",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 🌐 Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📁 Recursos estáticos
app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")
templates = Jinja2Templates(directory=settings.template_dir)

# 🔀 Incluir rutas de API
app.include_router(api_router, prefix="/api")

# 🧠 Middleware personalizado
app.add_middleware(AccessLogMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(AuthMiddleware)

@app.middleware("http")
async def add_ip_and_user_agent(request: Request, call_next):
    request.state.ip = request.client.host
    request.state.user_agent = request.headers.get("user-agent")
    return await call_next(request)

@app.get("/favicon.ico")
async def favicon():
    return FileResponse(settings.favicon_path)

@app.get("/")
def root():
    return {"message": "✅ API del Chatbot Tutor Virtual en funcionamiento"}

# 🚨 Logs de arranque
if settings.debug:
    logger.warning("🛠️ MODO DEBUG ACTIVADO. No recomendado para producción.")
else:
    logger.info("🛡️ Modo producción activado.")

if settings.secret_key == "supersecretkey" or len(settings.secret_key) < 32:
    logger.warning("⚠️ SECRET_KEY es muy débil. Genera una con: python -c 'import secrets; print(secrets.token_urlsafe(64))'")

logger.info("🚀 FastAPI montado correctamente. Rutas disponibles en /api")
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=settings.debug)