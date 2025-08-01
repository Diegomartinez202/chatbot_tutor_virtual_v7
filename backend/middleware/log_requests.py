from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from backend.services.log_service import log_access_middleware  # 👈 lo defines tú

class AccessLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        user = request.scope.get("user_payload")  # 👈 opcional si usas context vars

        log_access_middleware(
            endpoint=str(request.url.path),
            method=request.method,
            status=response.status_code,
            ip=request.client.host,
            user_agent=request.headers.get("user-agent"),
            user=user  # si quieres incluir datos del usuario
        )
        return response