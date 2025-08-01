from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.dependencies.auth import get_current_user
from backend.utils.jwt_manager import (
    create_access_token,
    create_refresh_token,
    decode_token
)
from backend.config.settings import settings
from backend.logger import logger

from backend.services.auth_service import (
    registrar_login_exitoso,
    registrar_acceso_perfil,
    registrar_logout,
    registrar_refresh_token
)
from backend.services.user_service import authenticate_user, find_user_by_email
from models.auth_model import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

# ========================
# 🔐 Autenticación
# ========================

@router.post("/login", response_model=TokenResponse)
def login(request_body: LoginRequest, request: Request):
    """🔐 Login de usuario. Retorna access y refresh token."""
    user = authenticate_user(request_body.email, request_body.password)
    if not user:
        logger.warning(f"❌ Login fallido: {request_body.email}")
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)

    registrar_login_exitoso(request, user)
    logger.info(f"✅ Login exitoso para: {user['email']}")

    response = JSONResponse(content={
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    })

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=not settings.debug,
        samesite="Lax"
    )

    return response


@router.get("/me")
def get_profile(request: Request, current_user=Depends(get_current_user)):
    """👤 Devuelve perfil del usuario autenticado."""
    registrar_acceso_perfil(request, current_user)
    logger.info(f"📥 Acceso a perfil: {current_user['email']}")
    return {
        "email": current_user["email"],
        "nombre": current_user["nombre"],
        "rol": current_user.get("rol", "usuario")
    }


@router.post("/logout")
def logout(request: Request, current_user=Depends(get_current_user)):
    """🔒 Logout y eliminación de cookie refresh_token."""
    registrar_logout(request, current_user)
    logger.info(f"🚪 Logout: {current_user['email']}")

    response = JSONResponse(content={"message": "Sesión cerrada correctamente"})
    response.delete_cookie("refresh_token")
    return response


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: Request, current_user=Depends(get_current_user)):
    """🔁 Genera un nuevo access token desde refresh token (si el actual no ha expirado)."""
    new_access_token = create_access_token(current_user)
    registrar_refresh_token(request, current_user)
    logger.info(f"🔁 Refresh token generado: {current_user['email']}")

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


# ✅ NUEVO ENDPOINT CON REFRESH TOKEN EN BODY
class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/refresh-token", response_model=TokenResponse)
def refresh_token_manual(data: RefreshTokenRequest, request: Request):
    """🔁 Genera un nuevo access_token usando un refresh_token manual."""
    try:
        payload = decode_token(data.refresh_token)
        email = payload.get("email")
        user_id = payload.get("id")
        rol = payload.get("rol")

        if not email or not user_id:
            raise HTTPException(status_code=400, detail="Token inválido")

        user = find_user_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        access_token = create_access_token(user)

        logger.info(f"🔁 Nuevo access_token generado vía refresh_token para: {email}")
        registrar_refresh_token(request, user)

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except Exception as e:
        logger.error(f"❌ Error al refrescar token: {str(e)}")
        raise HTTPException(status_code=401, detail="Refresh token inválido")