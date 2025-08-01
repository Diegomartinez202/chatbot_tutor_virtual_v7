# backend/services/stats_service.py

from backend.db.mongodb import db

# 📊 Total de logs
async def obtener_total_logs():
    return await db.logs.count_documents({})

# 🧠 Top 10 intents más usados
async def obtener_intents_mas_usados():
    pipeline = [
        {"$match": {"intent": {"$exists": True}}},
        {"$group": {"_id": "$intent", "total": {"$sum": 1}}},
        {"$sort": {"total": -1}},
        {"$limit": 10}
    ]
    return await db.logs.aggregate(pipeline).to_list(length=10)

# 👥 Total de usuarios registrados
async def obtener_total_usuarios():
    return await db.users.count_documents({})

# 👤 Últimos 5 usuarios registrados
async def obtener_ultimos_usuarios():
    return await db.users.find(
        {}, {"email": 1, "rol": 1}
    ).sort("_id", -1).limit(5).to_list(length=5)

# 🧩 Distribución de usuarios por rol
async def obtener_usuarios_por_rol():
    pipeline = [
        {"$group": {"_id": "$rol", "total": {"$sum": 1}}},
        {"$sort": {"total": -1}}
    ]
    return await db.users.aggregate(pipeline).to_list(length=10)

# 📈 Logs por día
async def obtener_logs_por_dia():
    pipeline = [
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
            "total": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    return await db.logs.aggregate(pipeline).to_list(length=30)