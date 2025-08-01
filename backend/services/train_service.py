# backend/services/train_service.py

import subprocess
from backend.settings import settings  # ✅ Configuración centralizada

def entrenar_chatbot():
    try:
        print("🚀 Entrenando chatbot con Rasa...")
        result = subprocess.run(settings.rasa_train_command.split(), capture_output=True, text=True)

        if result.returncode == 0:
            print("✅ Entrenamiento exitoso.")
            return {"status": "ok", "output": result.stdout}
        else:
            print("❌ Error durante entrenamiento.")
            return {"status": "error", "error": result.stderr}

    except Exception as e:
        print(f"❌ Excepción al entrenar: {e}")
        return {"status": "exception", "error": str(e)}