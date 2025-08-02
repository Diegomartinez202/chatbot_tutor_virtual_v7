from fastapi import APIRouter, Depends, Request
from backend.dependencies.auth import require_role
from backend.services.log_service import log_access
import time
import subprocess
import requests

router = APIRouter()

# 🔹 1. Test general
@router.post("/admin/test-all", summary="🧪 Ejecutar pruebas del sistema")
def ejecutar_test_general(request: Request, payload=Depends(require_role(["admin"]))):
    start_time = time.time()

    try:
        resultado = subprocess.run(["bash", "scripts/test_all.sh"], capture_output=True, text=True)
        duracion = round(time.time() - start_time, 2)

        log_access(
            user_id=payload["_id"],
            email=payload["email"],
            rol=payload["rol"],
            endpoint=str(request.url.path),
            method=request.method,
            status=200 if resultado.returncode == 0 else 500,
            ip=request.state.ip,
            user_agent=request.state.user_agent
        )

        return {
            "success": resultado.returncode == 0,
            "message": resultado.stdout,
            "error": resultado.stderr if resultado.returncode != 0 else None,
            "duracion": f"{duracion}s"
        }

    except Exception as e:
        log_access(
            user_id=payload["_id"],
            email=payload["email"],
            rol=payload["rol"],
            endpoint=str(request.url.path),
            method=request.method,
            status=500,
            ip=request.state.ip,
            user_agent=request.state.user_agent
        )
        return {"success": False, "message": "Error ejecutando test", "error": str(e)}

# 🔹 2. Test de conexión al backend
@router.get("/admin/ping", summary="🟢 Test de conexión al backend")
def ping_backend(request: Request, payload=Depends(require_role(["admin"]))):
    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint=str(request.url.path),
        method=request.method,
        status=200,
        ip=request.state.ip,
        user_agent=request.state.user_agent
    )
    return {"message": "✅ Backend activo", "pong": True}

# 🔹 3. Verifica conexión con Rasa
@router.get("/admin/rasa/status", summary="🤖 Verificar conexión con Rasa")
def status_rasa(request: Request, payload=Depends(require_role(["admin"]))):
    try:
        response = requests.get("http://rasa:5005/status")
        log_access(
            user_id=payload["_id"],
            email=payload["email"],
            rol=payload["rol"],
            endpoint=str(request.url.path),
            method=request.method,
            status=response.status_code,
            ip=request.state.ip,
            user_agent=request.state.user_agent
        )
        return {
            "success": response.status_code == 200,
            "rasa_status": response.json()
        }

    except Exception as e:
        log_access(
            user_id=payload["_id"],
            email=payload["email"],
            rol=payload["rol"],
            endpoint=str(request.url.path),
            method=request.method,
            status=500,
            ip=request.state.ip,
            user_agent=request.state.user_agent
        )
        return {
            "success": False,
            "message": "❌ No se pudo conectar con Rasa",
            "error": str(e)
        }