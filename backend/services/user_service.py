# backend/services/user_service.py

from backend.db.mongodb import get_users_collection
from bson import ObjectId
from backend.schemas.user_schema import UserOut
from typing import List
from fastapi.responses import StreamingResponse
from io import StringIO
import csv

def list_users() -> List[UserOut]:
    col = get_users_collection()
    users = col.find({}, {"password": 0})
    return [UserOut(**{**user, "id": str(user["_id"])}) for user in users]

def delete_user_by_id(user_id: str) -> bool:
    col = get_users_collection()
    result = col.delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0

def export_users_csv() -> StreamingResponse:
    col = get_users_collection()
    usuarios = col.find({}, {"password": 0})
    usuarios_out = []

    for user in usuarios:
        user_data = {
            "id": str(user["_id"]),
            "nombre": user.get("nombre", ""),
            "email": user.get("email", ""),
            "rol": user.get("rol", "")
        }
        usuarios_out.append(user_data)

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "nombre", "email", "rol"])

    for user in usuarios_out:
        writer.writerow([user["id"], user["nombre"], user["email"], user["rol"]])

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=usuarios_exportados.csv"}
    )