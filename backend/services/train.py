import subprocess
from config import RASA_TRAIN_COMMAND

def entrenar_chatbot():
    try:
        print("🚀 Entrenando chatbot con Rasa...")
        result = subprocess.run(RASA_TRAIN_COMMAND.split(), capture_output=True, text=True)

        if result.returncode == 0:
            print("✅ Entrenamiento exitoso.")
            return {"status": "ok", "output": result.stdout}
        else:
            print("❌ Error durante entrenamiento.")
            return {"status": "error", "error": result.stderr}

    except Exception as e:
        print(f"❌ Excepción al entrenar: {e}")
        return {"status": "exception", "error": str(e)}