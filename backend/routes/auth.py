from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from backend.dependencies.auth import get_current_user, create_access_token, create_refresh_token
from backend.services.auth_service import registrar_login_exitoso, registrar_acceso_perfil, registrar_logout
from backend.services.user_service import authenticate_user
from models.auth_model import LoginRequest, TokenResponse

router = APIRouter()

# 🟢 Login con seguridad y refresh token
@router.post("/auth/login", response_model=TokenResponse)
def login(request_body: LoginRequest, request: Request):
    user = authenticate_user(request_body.email, request_body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)

    registrar_login_exitoso(request, user)  # ✅ Loguear login exitoso

    response = JSONResponse(content={
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    })
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="Lax"
    )
    return response

# 🧑‍💼 Perfil autenticado
@router.get("/auth/me")
def get_profile(request: Request, current_user=Depends(get_current_user)):
    registrar_acceso_perfil(request, current_user)  # ✅ Loguear acceso a perfil

    return {
        "email": current_user["email"],
        "nombre": current_user["nombre"],
        "rol": current_user.get("rol", "usuario")
    }

# 🔴 Cerrar sesión
@router.post("/auth/logout")
def logout(request: Request, current_user=Depends(get_current_user)):
    registrar_logout(request, current_user)  # ✅ Loguear logout

    response = JSONResponse(content={"message": "Sesión cerrada correctamente"})
    response.delete_cookie("refresh_token")
    return response
@router.post("/auth/refresh", response_model=TokenResponse)
def refresh_token(request: Request, current_user=Depends(get_current_user)):
    from backend.services.auth_service import registrar_refresh_token

    new_access_token = create_access_token(current_user)

    registrar_refresh_token(request, current_user)  # ✅ Loguear refresh token

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }
