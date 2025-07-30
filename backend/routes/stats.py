# from fastapi import APIRouter, Depends
# from backend.db.mongodb import db
# from backend.dependencies.auth import require_role

# router = APIRouter(tags=["Estadísticas"])

# @router.get("/admin/stats", summary="📊 Obtener estadísticas del chatbot")
# async def get_stats(user=Depends(require_role(["admin", "soporte"]))):
#     """
#     Devuelve estadísticas generales:
#     - total_logs: cantidad de mensajes almacenados
#     - intents_mas_usados: top 10 intents más invocados
#     - total_usuarios: cantidad de cuentas registradas
#     - ultimos_usuarios: últimos 5 usuarios creados
#     """
#     total_logs = await db.logs.count_documents({})
#     pipeline_intents = [
#         {"$match": {"intent": {"$exists": True}}},
#         {"$group": {"_id": "$intent", "total": {"$sum": 1}}},
#         {"$sort": {"total": -1}},
#         {"$limit": 10}
#     ]
#     intents_mas_usados = await db.logs.aggregate(pipeline_intents).to_list(length=10)
#     total_usuarios = await db.users.count_documents({})
#     ultimos_usuarios = await db.users.find(
#         {}, {"email": 1, "rol": 1}
#     ).sort("_id", -1).limit(5).to_list(length=5)
#     return {
#         "total_logs": total_logs,
#         "intents_mas_usados": intents_mas_usados,
#         "total_usuarios": total_usuarios,
#         "ultimos_usuarios": ultimos_usuarios
#     }