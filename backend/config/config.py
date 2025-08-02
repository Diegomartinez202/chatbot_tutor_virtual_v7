# backend/db/mongodb.py

from pymongo import MongoClient, errors
from backend.config.settings import settings  # ✅ Configuración centralizada

MONGO_URI = settings.mongo_uri
MONGO_DB_NAME = settings.mongo_db_name

try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=5000,
        retryWrites=True,
    )
    client.admin.command("ping")
    print(f"✅ Conexión exitosa a MongoDB: {MONGO_URI}")

    # 🟩 Crear índice único en email
    client[MONGO_DB_NAME]["users"].create_index("email", unique=True)
    print("✅ Índice único en 'email' creado/verificado")

except errors.ServerSelectionTimeoutError as e:
    print("❌ Error: No se pudo conectar a MongoDB (timeout)")
    print(e)
    client = None
except Exception as e:
    print("⚠️ Error general al conectar con MongoDB:")
    print(e)
    client = None

def get_database():
    if client is None:
        raise RuntimeError("❌ Conexión a la base de datos fallida.")
    return client[MONGO_DB_NAME]

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