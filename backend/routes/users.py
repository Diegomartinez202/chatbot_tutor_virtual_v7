# backend/routes/users.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from io import StringIO
import csv
from bson import ObjectId
from typing import List
from backend.dependencies.auth import require_role
from backend.db.mongodb import get_users_collection
from backend.schemas.user_schema import UserOut
from fastapi import Body
from backend.schemas.user_schema import UserCreate, UserOut
from backend.services.user_manager import crear_usuario
router = APIRouter(tags=["Usuarios"])

# 🔹 1. Listar usuarios (solo admin y soporte)
@router.get("/admin/users", summary="Listar usuarios registrados", response_model=List[UserOut])
def list_users(payload=Depends(require_role(["admin", "soporte"]))):
    collection = get_users_collection()
    users = collection.find({}, {"password": 0})
    return [UserOut(**{**user, "id": str(user["_id"])}) for user in users]

# 🔹 2. Eliminar usuario por ID (solo admin)
@router.delete("/admin/users/{user_id}", summary="Eliminar usuario por ID")
def delete_user(user_id: str, payload=Depends(require_role(["admin"]))):
    collection = get_users_collection()
    result = collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": "🗑️ Usuario eliminado correctamente"}

# 🔹 3. Exportar usuarios a CSV (solo admin)
@router.get("/admin/users/export", summary="Exportar usuarios a CSV", response_class=StreamingResponse)
def exportar_usuarios_csv(payload=Depends(require_role(["admin"]))):
    collection = get_users_collection()
    usuarios = collection.find({}, {"password": 0})
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
# 🔐 Crear usuario desde el panel (solo admin)
@router.post("/admin/create-user", summary="Crear nuevo usuario", response_model=UserOut)
def create_user_admin(
    user: UserCreate = Body(...),
    payload=Depends(require_role(["admin"]))
):
    try:
        nuevo_usuario = crear_usuario(user.email, user.password, user.rol)
        return UserOut(
            id=nuevo_usuario["_id"],
            email=nuevo_usuario["email"],
            nombre=user.nombre,
            rol=nuevo_usuario["rol"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))