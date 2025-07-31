# backend/main.py

from dotenv import load_dotenv
load_dotenv()
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates
from backend.routes import router as api_router  
from backend.utils.logger import logger         

# ===============================
# 🚀 Inicializar FastAPI
# ===============================
app = FastAPI(
    title="Chatbot Tutor Virtual API",
    description="Backend para gestión de intents, autenticación, logs y estadísticas del Chatbot Tutor Virtual",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ===============================
# 🔐 Middleware CORS
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ En producción, restringe esto a dominios seguros
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# 📁 Archivos estáticos
# ===============================
app.mount("/static", StaticFiles(directory="backend/static"), name="static")
templates = Jinja2Templates(directory="backend/templates")

# ===============================
# 🔀 Rutas API
# ===============================
app.include_router(api_router, prefix="/api")

# ===============================
# 📎 Ruta favicon
# ===============================
@app.get("/favicon.ico")
async def favicon():
    return FileResponse("backend/static/widget/favicon.ico")

# ===============================
# 🌐 Ruta raíz
# ===============================
@app.get("/")
def root():
    return {"message": "✅ API del Chatbot Tutor Virtual en funcionamiento"}

# ✅ Mensaje de log al arrancar
logger.info("🚀 FastAPI montado correctamente. Rutas disponibles en /api")