# backend/db/mongodb.py

from pymongo import MongoClient, errors
import os
from dotenv import load_dotenv

# 🌍 Cargar variables del .env
load_dotenv()

# === Configuración de conexión ===
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/?retryWrites=true&w=majority")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "chatbot_tutor_virtual_v2")

# 🌐 Inicializar cliente con reconexión automática
try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,   # ⏱️ Tiempo máx. para esperar conexión
        connectTimeoutMS=5000,           # ⏳ Tiempo máx. para conexión inicial
        socketTimeoutMS=5000,            # 🔁 Tiempo máx. para cada operación
        retryWrites=True,                # 🔁 Reintenta escrituras automáticamente
    )
    # Test de conexión
    client.admin.command("ping")
    print("✅ Conexión exitosa a MongoDB:", MONGO_URI)

    # Crear índice único en el campo email si no existe
    client[MONGO_DB_NAME]["users"].create_index("email", unique=True)
    print("✅ Índice único en 'email' creado/verificado")

except errors.ServerSelectionTimeoutError as e:
    print("❌ Error: No se pudo conectar a MongoDB (tiempo de espera).")
    print(e)
    client = None
except Exception as e:
    print("⚠️ Error general al inicializar MongoDB:", e)
    client = None

# 📦 Función para obtener la base de datos
def get_database():
    if client is None:
        raise RuntimeError("No se pudo conectar a la base de datos MongoDB")
    return client[MONGO_DB_NAME]

# 🔍 Accesos a colecciones
def get_users_collection():
    return get_database()["users"]

def get_logs_collection():
    return get_database()["logs"]

def get_stats_collection():
    return get_database()["statistics"]

def get_intents_collection():
    return get_database()["intents"]

def get_test_logs_collection():
    return get_database()["test_logs"]