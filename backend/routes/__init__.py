# backend/routes/__init__.py

from fastapi import APIRouter

# Importación de subrouters
from .auth import router as auth_router
from .chat import router as chat_router
from .logs import router as logs_router
from .stats import router as stats_router
from .train import router as train_router
from .users import router as users_router
from .intents import router as intents_router
from .test import router as test_router

# Enrutador principal
router = APIRouter()

# =============================
# 🔐 Autenticación y perfil
# =============================
router.include_router(auth_router, prefix="/auth", tags=["Auth"])

# =============================
# 💬 Chat (proxy a Rasa)
# =============================
router.include_router(chat_router, tags=["Chat"])

# =============================
# 📋 Logs de conversaciones
# =============================
router.include_router(logs_router, prefix="/logs", tags=["Logs"])

# =============================
# 📊 Estadísticas de uso
# =============================
router.include_router(stats_router, prefix="/admin", tags=["Estadísticas"])

# =============================
# 🧠 Entrenamiento y test del bot
# =============================
router.include_router(train_router, prefix="/admin", tags=["Entrenamiento"])
router.include_router(test_router, prefix="/admin", tags=["Test"])

# =============================
# 👥 Gestión de usuarios
# =============================
router.include_router(users_router, prefix="/admin", tags=["Usuarios"])

# =============================
# ➕ Intents y respuestas
# =============================
router.include_router(intents_router, prefix="/admin", tags=["Intents"])
