# backend/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from backend.dependencies.auth import get_current_user, create_access_token, create_refresh_token
from backend.services.user_service import authenticate_user
from models.auth_model import LoginRequest, TokenResponse

router = APIRouter()

# 🟢 Login con seguridad y refresh token
@router.post("/auth/login", response_model=TokenResponse)
def login(request: LoginRequest):
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)

    response = JSONResponse(content={
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    })
    
    # ✅ Seguridad en producción
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # 🔐 Poner en True para HTTPS en producción
        samesite="Lax"
    )
    return response

# 🧑‍💼 Perfil autenticado
@router.get("/auth/me")
def get_profile(current_user=Depends(get_current_user)):
    return {
        "email": current_user["email"],
        "nombre": current_user["nombre"],
        "rol": current_user.get("rol", "usuario")
    }

# 🔴 Cerrar sesión
@router.post("/auth/logout")
def logout():
    response = JSONResponse(content={"message": "Sesión cerrada correctamente"})
    response.delete_cookie("refresh_token")
    return response