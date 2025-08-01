import yaml
import subprocess
from pathlib import Path
from backend.settings import settings  # ✅ Config centralizada

# ============================
# 📁 Rutas de los archivos Rasa
# ============================
NLU_FILE = Path(settings.rasa_data_path)
DOMAIN_FILE = Path(settings.rasa_domain_path)

# ============================
# 🔍 Verificar si un intent ya existe
# ============================
def intent_ya_existe(intent_name: str) -> bool:
    if not NLU_FILE.exists():
        return False

    with open(NLU_FILE, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}

    examples = data.get("nlu", [])
    return any(entry.get("intent") == intent_name for entry in examples)

# ============================
# ➕ Guardar un nuevo intent (API/PANEL)
# ============================
def guardar_intent(data: dict):
    intent_name = data["intent"]
    examples = data.get("examples", [])
    responses = data.get("responses", [])

    if not NLU_FILE.exists():
        raise FileNotFoundError("El archivo nlu.yml no existe")

    # Leer nlu.yml
    with open(NLU_FILE, "r", encoding="utf-8") as f:
        nlu_data = yaml.safe_load(f) or {}

    nlu_list = nlu_data.get("nlu", [])
    nlu_list.append({
        "intent": intent_name,
        "examples": "\n".join(f"- {e.strip()}" for e in examples if e.strip())
    })

    with open(NLU_FILE, "w", encoding="utf-8") as f:
        yaml.dump({"nlu": nlu_list}, f, allow_unicode=True, sort_keys=False)

    # Actualizar domain.yml
    agregar_respuesta_en_domain(intent_name, responses)
    return {"message": f"✅ Intent '{intent_name}' guardado correctamente"}

# ============================
# 💬 Guardar respuestas en domain.yml
# ============================
def agregar_respuesta_en_domain(intent_name: str, responses: list):
    if not DOMAIN_FILE.exists():
        raise FileNotFoundError("El archivo domain.yml no existe")

    with open(DOMAIN_FILE, "r", encoding="utf-8") as f:
        domain_data = yaml.safe_load(f) or {}

    utter_key = f"utter_{intent_name}"

    domain_data.setdefault("responses", {})
    domain_data.setdefault("intents", [])

    domain_data["responses"][utter_key] = [{"text": r} for r in responses]
    if intent_name not in domain_data["intents"]:
        domain_data["intents"].append(intent_name)

    with open(DOMAIN_FILE, "w", encoding="utf-8") as f:
        yaml.dump(domain_data, f, allow_unicode=True, sort_keys=False)

# ============================
# 🧠 Entrenamiento automático de Rasa
# ============================
def entrenar_rasa():
    result = subprocess.run(settings.rasa_train_command.split(), capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"❌ Error al entrenar Rasa:\n{result.stderr}")
    print("✅ Rasa entrenado exitosamente")

# ============================
# 🗑️ Eliminar intent + respuesta
# ============================
def eliminar_intent(intent_name: str):
    if not NLU_FILE.exists() or not DOMAIN_FILE.exists():
        raise FileNotFoundError("Faltan archivos de configuración")

    # NLU
    with open(NLU_FILE, "r", encoding="utf-8") as f:
        nlu_data = yaml.safe_load(f) or {}
    nlu_data["nlu"] = [
        entry for entry in nlu_data.get("nlu", []) if entry.get("intent") != intent_name
    ]
    with open(NLU_FILE, "w", encoding="utf-8") as f:
        yaml.dump(nlu_data, f, allow_unicode=True, sort_keys=False)

    # Domain
    with open(DOMAIN_FILE, "r", encoding="utf-8") as f:
        domain_data = yaml.safe_load(f) or {}
    domain_data["intents"] = [
        i for i in domain_data.get("intents", []) if i != intent_name
    ]
    domain_data["responses"].pop(f"utter_{intent_name}", None)

    with open(DOMAIN_FILE, "w", encoding="utf-8") as f:
        yaml.dump(domain_data, f, allow_unicode=True, sort_keys=False)

    return {"message": f"🗑️ Intent '{intent_name}' eliminado correctamente"}

# ============================
# 📥 Cargar desde CSV o JSON externo
# ============================
def guardar_intent_csv(data: dict):
    if not data.get("intent") or not data.get("examples") or not data.get("responses"):
        raise ValueError("Faltan campos obligatorios: intent, examples o responses")

    if not intent_ya_existe(data["intent"]):
        guardar_intent(data)

# ============================
# 📄 Obtener lista de intents
# ============================
def obtener_intents():
    if not NLU_FILE.exists():
        return []

    with open(NLU_FILE, "r", encoding="utf-8") as f:
        nlu_data = yaml.safe_load(f) or {}
    return nlu_data.get("nlu", [])

# ============================
# 🔁 Cargar intents automáticamente desde archivo local
# ============================
def cargar_intents_automaticamente():
    if not NLU_FILE.exists() or not DOMAIN_FILE.exists():
        raise FileNotFoundError("Archivos de entrenamiento no encontrados")

    # Ya están en disco, simplemente los leemos para mostrar confirmación
    intents = obtener_intents()
    return {"message": f"♻️ {len(intents)} intents recargados correctamente"}