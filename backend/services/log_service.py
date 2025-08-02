import os
import csv
from bson import ObjectId
from io import StringIO
from datetime import datetime
from collections import defaultdict
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

def log_access(user_id: str, email: str, rol: str, endpoint: str, method: str, status: int, ip: str = None, user_agent: str = None, tipo: str = "acceso"):
    collection = get_logs_collection()
    collection.insert_one({
        "user_id": user_id,
        "email": email,
        "rol": rol,
        "endpoint": endpoint,
        "method": method,
        "status": status,
        "ip": ip,
        "user_agent": user_agent,
        "tipo": tipo,
        "timestamp": datetime.utcnow()
    })

# ✅ NUEVA FUNCIÓN: obtener estadísticas de exportaciones por día
def get_export_stats():
    collection = get_logs_collection()
    pipeline = [
        {"$match": {"tipo": "descarga"}},
        {"$group": {
            "_id": {
                "year": {"$year": "$timestamp"},
                "month": {"$month": "$timestamp"},
                "day": {"$dayOfMonth": "$timestamp"}
            },
            "total": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    result = list(collection.aggregate(pipeline))
    return [{
        "date": f"{r['_id']['year']}-{r['_id']['month']:02}-{r['_id']['day']:02}",
        "total": r["total"]
    } for r in result]

# ✅ NUEVA FUNCIÓN: obtener registros individuales de exportaciones
def get_export_logs(limit: int = 50):
    collection = get_logs_collection()
    logs = list(collection.find({"tipo": "descarga"}).sort("timestamp", -1).limit(limit))
    for log in logs:
        log["_id"] = str(log["_id"])
        log["timestamp"] = log.get("timestamp", datetime.utcnow()).isoformat()
    return logs
# ✅ NUEVA FUNCIÓN para middleware
def log_access_middleware(endpoint: str, method: str, status: int, ip: str, user_agent: str, user: dict = None):
    """📥 Registra accesos al sistema desde middleware."""
    doc = {
        "endpoint": endpoint,
        "method": method,
        "status": status,
        "ip": ip,
        "user_agent": user_agent,
        "tipo": "acceso",
        "timestamp": datetime.utcnow()
    }
    if user:
        doc.update({
            "user_id": user.get("id") or user.get("_id"),
            "email": user.get("email"),
            "rol": user.get("rol")
        })
    get_logs_collection().insert_one(doc)
    # ✅ Obtener lista de logs fallidos (ej. fallback)
def get_fallback_logs(limit: int = 100):
    collection = get_logs_collection()
    logs = list(collection.find({"intent": "nlu_fallback"}).sort("timestamp", -1).limit(limit))
    for log in logs:
        log["_id"] = str(log["_id"])
        log["timestamp"] = log.get("timestamp", datetime.utcnow()).isoformat()
    return logs

# ✅ Obtener los intents fallidos más comunes (top 5)
def get_top_failed_intents():
    collection = get_logs_collection()
    pipeline = [
        {"$match": {"intent": {"$ne": None}, "intent": {"$regex": ".*fallback.*", "$options": "i"}}},
        {"$group": {"_id": "$intent", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    result = list(collection.aggregate(pipeline))
    return [{"intent": r["_id"], "count": r["count"]} for r in result]