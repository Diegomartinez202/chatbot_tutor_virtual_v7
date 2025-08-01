# backend/services/log_service.py

import os
import re
import csv
from bson import ObjectId
from io import StringIO
from backend.db.mongodb import get_logs_collection
from backend.config.settings import LOG_DIR

def listar_archivos_log():
    try:
        archivos = [f for f in os.listdir(LOG_DIR) if f.endswith(".log")]
        return {"archivos": archivos}
    except Exception as e:
        return {"error": str(e)}

def obtener_contenido_log(filename: str):
    ruta = os.path.join(LOG_DIR, filename)
    return ruta if os.path.exists(ruta) else None

def exportar_logs_csv_stream():
    logs = get_logs_collection().find()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["user_id", "message", "timestamp", "sender", "intent"])
    for log in logs:
        writer.writerow([
            log.get("user_id", ""),
            log.get("message", ""),
            log.get("timestamp", ""),
            log.get("sender", ""),
            log.get("intent", ""),
        ])
    output.seek(0)
    return output

def contar_mensajes_no_leidos(user_id: str):
    return get_logs_collection().count_documents({"user_id": user_id, "leido": False})

def marcar_mensajes_como_leidos(user_id: str):
    result = get_logs_collection().update_many(
        {"user_id": user_id, "leido": False},
        {"$set": {"leido": True}}
    )
    return result.modified_count
def get_logs(limit: int = 100):
    collection = get_logs_collection()
    logs = list(collection.find({"tipo": "acceso"}).sort("timestamp", -1).limit(limit))
    for log in logs:
        log["_id"] = str(log["_id"])
    return logs
def log_access(user_id: str, email: str, rol: str, endpoint: str, method: str, status: int):
    collection = get_logs_collection()
    log_entry = {
        "user_id": user_id,
        "email": email,
        "rol": rol,
        "endpoint": endpoint,
        "method": method,
        "status": status,
        "timestamp": datetime.utcnow(),
        "tipo": "acceso"
    }
    collection.insert_one(log_entry)