# backend/services/auth_service.py

from utils.logger import logger
from backend.services.log_service import log_access

def registrar_login_exitoso(request, user):
    ip = request.client.host
    user_agent = request.headers.get("user-agent")

    log_access(
        user_id=user["_id"],
        email=user["email"],
        rol=user.get("rol", "usuario"),
        endpoint="/auth/login",
        method="POST",
        status=200,
        extra={"ip": ip, "user_agent": user_agent}
    )
    logger.info(f"🔐 Login exitoso para {user['email']} desde IP {ip}")

def registrar_acceso_perfil(request, user):
    ip = request.client.host
    user_agent = request.headers.get("user-agent")

    log_access(
        user_id=user["_id"],
        email=user["email"],
        rol=user.get("rol", "usuario"),
        endpoint="/auth/me",
        method="GET",
        status=200,
        extra={"ip": ip, "user_agent": user_agent}
    )
    logger.info(f"👤 Perfil accedido por {user['email']} desde IP {ip}")

def registrar_logout(request, user):
    ip = request.client.host
    user_agent = request.headers.get("user-agent")

    log_access(
        user_id=user["_id"],
        email=user["email"],
        rol=user.get("rol", "usuario"),
        endpoint="/auth/logout",
        method="POST",
        status=200,
        extra={"ip": ip, "user_agent": user_agent}
    )
    logger.info(f"🚪 Logout de {user['email']} desde IP {ip}")
    def registrar_refresh_token(request, user):
    ip = request.client.host
    user_agent = request.headers.get("user-agent")

    log_access(
        user_id=user["_id"],
        email=user["email"],
        rol=user.get("rol", "usuario"),
        endpoint="/auth/refresh",
        method="POST",
        status=200,
        extra={"ip": ip, "user_agent": user_agent}
    )
    logger.info(f"🔄 Refresh token generado para {user['email']} desde IP {ip}")