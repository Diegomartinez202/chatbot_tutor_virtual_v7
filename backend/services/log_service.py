# backend/services/log_service.py

from typing import List, Optional
from pathlib import Path
import csv
from io import StringIO
from backend.db.mongodb import get_logs_collection

LOGS_DIR = Path("logs")

# 🔹 1. Listar archivos de log locales
def listar_archivos_log() -> List[str]:
    if not LOGS_DIR.exists():
        return []
    return sorted([f.name for f in LOGS_DIR.glob("train_*.log")])

# 🔹 2. Obtener ruta de archivo de log específico
def obtener_contenido_log(filename: str) -> Optional[Path]:
    file_path = LOGS_DIR / filename
    if not file_path.exists():
        return None
    return file_path

# 🔹 3. Exportar logs de MongoDB como flujo CSV
def exportar_logs_csv_stream() -> StringIO:
    collection = get_logs_collection()
    logs = list(collection.find().limit(5000))  # Limitar para rendimiento si es necesario

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["sender", "message", "intent", "response", "confidence", "timestamp"])

    for log in logs:
        writer.writerow([
            log.get("sender", ""),
            log.get("message", ""),
            log.get("intent", ""),
            log.get("response", ""),
            log.get("confidence", ""),
            log.get("timestamp", "")
        ])

    output.seek(0)
    return output

# 🔹 4. Contar mensajes no leídos por user_id
def contar_mensajes_no_leidos(user_id: str) -> int:
    collection = get_logs_collection()
    return collection.count_documents({
        "sender_id": user_id,
        "read": False
    })

# 🔹 5. Marcar mensajes como leídos
def marcar_mensajes_como_leidos(user_id: str) -> int:
    collection = get_logs_collection()
    result = collection.update_many(
        {"sender_id": user_id, "read": False},
        {"$set": {"read": True}}
    )
    return result.modified_count