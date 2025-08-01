# backend/routes/__init__.py

from fastapi import APIRouter

# Importación de subrouters con alias correctos
from backend.routes import (
    auth,
    chat,
    logs,
    stats,
    train,
    test,
    user_controller as users,
    intent_controller as intents
)
from backend.routes import test_controller as test
from backend.routes import intent_controller as intents
router = APIRouter()

# =============================
# 🔐 Autenticación y perfil
# =============================
router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# =============================
# 💬 Chat (proxy a Rasa)
# =============================
router.include_router(chat.router, tags=["Chat"])

# =============================
# 📋 Logs de conversaciones
# =============================
router.include_router(logs.router, prefix="/logs", tags=["Logs"])

# =============================
# 📊 Estadísticas de uso
# =============================
router.include_router(stats.router, prefix="/admin", tags=["Estadísticas"])

# =============================
# 🧠 Entrenamiento y test del bot
# =============================
router.include_router(train.router, prefix="/admin", tags=["Entrenamiento"])
router.include_router(test.router, prefix="/admin", tags=["Test"])

# =============================
# 👥 Gestión de usuarios
# =============================
router.include_router(users.router, prefix="/admin", tags=["Usuarios"])

# =============================
# ➕ Intents y respuestas
# =============================
router.include_router(intents.router, prefix="/admin", tags=["Intents"])
router.include_router(test.router, prefix="/admin", tags=["Test"])
