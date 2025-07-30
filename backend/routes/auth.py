from fastapi import APIRouter, Depends, HTTPException
from backend.dependencies.auth import get_current_user, create_access_token, create_refresh_token
from backend.services.user_service import authenticate_user
from models.auth_model import LoginRequest, TokenResponse
from fastapi.responses import JSONResponse

router = APIRouter()

# 🟢 Endpoint: Login
@router.post("/auth/login", response_model=TokenResponse)
def login(request: LoginRequest):
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)

    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False)
    return response


# 🟢 Endpoint: Perfil autenticado
@router.get("/auth/me")
def get_profile(current_user=Depends(get_current_user)):
    return {
        "email": current_user["email"],
        "nombre": current_user["nombre"],
        "rol": current_user.get("rol", "usuario")  # ← ✅ Protección por si no tiene rol
    }


# 🔴 Endpoint: Logout (borra la cookie del refresh token)
@router.post("/auth/logout")
def logout():
    response = JSONResponse(content={"message": "Sesión cerrada correctamente"})
    response.delete_cookie("refresh_token")
    return response