# backend/services/stats_service.py

from backend.db.mongodb import get_db

def obtener_estadisticas_logs():
    db = get_db()
    logs = db["logs"]
    
    total_logs = logs.count_documents({})

    pipeline_top_intents = [
        {"$match": {"intent": {"$exists": True}}},
        {"$group": {"_id": "$intent", "total": {"$sum": 1}}},
        {"$sort": {"total": -1}},
        {"$limit": 10}
    ]
    intents_mas_usados = list(logs.aggregate(pipeline_top_intents))

    pipeline_logs_por_dia = [
        {"$group": {
            "_id": {"$substr": ["$timestamp", 0, 10]},  # Agrupar por fecha YYYY-MM-DD
            "total": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    logs_por_dia = list(logs.aggregate(pipeline_logs_por_dia))

    return {
        "total_logs": total_logs,
        "intents_mas_usados": intents_mas_usados,
        "logs_por_dia": logs_por_dia
    }

def obtener_estadisticas_usuarios():
    db = get_db()
    users = db["users"]

    total_usuarios = users.count_documents({})

    pipeline_por_rol = [
        {"$group": {"_id": "$rol", "total": {"$sum": 1}}},
        {"$project": {"rol": "$_id", "total": 1, "_id": 0}}
    ]
    usuarios_por_rol = list(users.aggregate(pipeline_por_rol))

    ultimos_usuarios = list(users.find({}, {"email": 1, "rol": 1})
                            .sort("_id", -1)
                            .limit(5))

    return {
        "total_usuarios": total_usuarios,
        "usuarios_por_rol": usuarios_por_rol,
        "ultimos_usuarios": ultimos_usuarios
    }