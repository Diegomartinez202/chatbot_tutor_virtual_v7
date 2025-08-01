# backend/routes/test_controller.py

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
import subprocess
import requests

from backend.dependencies.auth import require_role
from backend.services.log_service import log_access

router = APIRouter()

# =====================================
# ✅ Test de conectividad general
# =====================================
@router.get("/admin/ping", summary="🔋 Test de conexión backend")
def ping_test(payload=Depends(require_role(["admin", "soporte"]))):
    log_access(
        user_id=payload["_id"],
        email=payload["email"],
        rol=payload["rol"],
        endpoint="/admin/ping",
        method="GET",
        status=200
    )
    return {"status": "✅ Backend activo", "code": 200}


# =====================================
# 🤖 Verificar conexión con Rasa
# =====================================
@router.get("/admin/rasa/status", summary="🤖 Estado del servidor Rasa")
def rasa_status(payload=Depends(require_role(["admin", "soporte"]))):
    try:
        response = requests.get("http://localhost:5005/status")
        response.raise_for_status()
        status = response.json()

        log_access(
            user_id=payload["_id"],
            email=payload["email"],
            rol=payload["rol"],
            endpoint="/admin/rasa/status",
            method="GET",
            status=200
        )

        return {"status": "🧠 Rasa conectado", "details": status}
    except Exception as e:
        log_access(
            user_id=payload["_id"],
            email=payload["email"],
            rol=payload["rol"],
            endpoint="/admin/rasa/status",
            method="GET",
            status=503
        )
        return JSONResponse(
            status_code=503,
            content={"error": "❌ No se pudo conectar a Rasa", "details": str(e)}
        )


# =====================================
# 🧪 Ejecutar test_all.sh (simulación o real)
# =====================================
@router.post("/admin/test-all", summary="🧪 Ejecutar pruebas del sistema")
def ejecutar_pruebas(payload=Depends(require_role(["admin"]))):
    try:
        result = subprocess.run(["bash", "scripts/test_all.sh"], capture_output=True, text=True, check=True)

        log_access(
            user_id=payload["_id"],
            email=payload["email"],
            rol=payload["rol"],
            endpoint="/admin/test-all",
            method="POST",
            status=200
        )

        return {
            "message": "✅ Pruebas ejecutadas correctamente",
            "output": result.stdout
        }

    except subprocess.CalledProcessError as e:
        log_access(
            user_id=payload["_id"],
            email=payload["email"],
            rol=payload["rol"],
            endpoint="/admin/test-all",
            method="POST",
            status=500
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": "❌ Error al ejecutar pruebas",
                "details": e.stderr or str(e)
            }
        )