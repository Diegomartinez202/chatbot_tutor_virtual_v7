# backend/services/user_service.py

from bson import ObjectId
from db.mongodb import get_users_collection
from models.user_model import UserUpdate, RolEnum
from typing import Optional

def get_users(search: Optional[str] = None, skip: int = 0, limit: int = 20):
    collection = get_users_collection()
    query = {}
    if search:
        query = {
            "$or": [
                {"nombre": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]
        }

    cursor = collection.find(query).skip(skip).limit(limit)
    users = []
    for user in cursor:
        users.append({
            "id": str(user["_id"]),
            "nombre": user.get("nombre", ""),
            "email": user.get("email", ""),
            "rol": RolEnum(user.get("rol", "usuario"))
        })
    return users

def update_user(user_id: str, user_data: UserUpdate):
    collection = get_users_collection()
    result = collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": user_data.dict(exclude_unset=True)}
    )
    if result.modified_count == 0:
        return None
    updated = collection.find_one({"_id": ObjectId(user_id)})
    return {
        "id": str(updated["_id"]),
        "nombre": updated.get("nombre", ""),
        "email": updated.get("email", ""),
        "rol": RolEnum(updated.get("rol", "usuario"))
    }