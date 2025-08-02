# backend/services/user_service.py
from backend.db.mongodb import get_users_collection
from bson import ObjectId
from bson.errors import InvalidId
from backend.schemas.user_schema import UserOut
from typing import List
from fastapi.responses import StreamingResponse
from io import StringIO
from utils.logger import logger
from datetime import datetime
import csv


def is_valid_object_id(oid: str) -> bool:
    """Valida si un string puede convertirse en ObjectId"""
    return ObjectId.is_valid(oid)


def list_users() -> List[UserOut]:
    col = get_users_collection()
    users = col.find({}, {"password": 0})  # Excluir contraseñas por seguridad
    return [UserOut(**{**user, "id": str(user["_id"])}) for user in users]


def delete_user_by_id(user_id: str) -> bool:
    """Elimina un usuario por ID con validación previa"""
    if not is_valid_object_id(user_id):
        logger.warning(f"⚠️ ID inválido recibido al intentar eliminar usuario: {user_id}")
        return False
    try:
        col = get_users_collection()
        result = col.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    except Exception as e:
        logger.error(f"❌ Error al eliminar usuario {user_id}: {str(e)}")
        return False


def export_users_csv() -> StreamingResponse:
    """Exporta los usuarios a un archivo CSV descargable"""
    try:
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
        output.write('\ufeff')  # BOM para compatibilidad con Excel (UTF-8)
        writer = csv.writer(output)
        writer.writerow(["id", "nombre", "email", "rol"])

        for user in usuarios_out:
            writer.writerow([user["id"], user["nombre"], user["email"], user["rol"]])

        output.seek(0)

        filename = f"usuarios_exportados_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
        logger.info(f"🧾 Exportación de usuarios realizada exitosamente como {filename}")

        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        logger.error(f"❌ Error al exportar usuarios: {str(e)}")
        raise
