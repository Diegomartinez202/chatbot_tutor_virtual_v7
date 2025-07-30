# backend/main.py

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates
from backend.routes import admin  # ✅ Este sí tiene logs_por_dia
from backend.routes import router  # Agrupa todos los routers del sistema
from utils.logger import logger    # ✅ Importar logger
from routes import admin 
app = FastAPI(
    title="Chatbot Tutor Virtual API",
    description="Backend para gestión de intents, autenticación, logs y estadísticas del Chatbot Tutor Virtual",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ===============================
# 🔐 CORS
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ En producción cambiar por dominio específico
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# 📁 Archivos Estáticos y Plantillas
# ===============================
app.mount("/static", StaticFiles(directory="backend/static"), name="static")
templates = Jinja2Templates(directory="backend/templates")

# ===============================
# 🔀 Rutas principales del sistema
# ===============================
app.include_router(router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# ===============================
# 📎 Archivos estáticos directos
# ===============================
@app.get("/favicon.ico")
async def favicon():
    return FileResponse("backend/static/widget/favicon.ico")

# ===============================
# 🌐 Ruta de prueba inicial
# ===============================
@app.get("/")
def root():
    return {"message": "✅ API del Chatbot Tutor Virtual en funcionamiento"}

# ✅ Log de arranque
logger.info("🚀 FastAPI iniciado correctamente y montando rutas /api")