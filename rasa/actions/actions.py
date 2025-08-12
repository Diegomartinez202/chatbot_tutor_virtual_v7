# rasa/actions/ac# rasa/actions/actions.py
from typing import Any, Text, Dict, List, Optional
from email.mime.text import MIMEText
import re
import smtplib
from pymongo import MongoClient
import os
from rasa_sdk import Action, Tracker, FormValidationAction
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import os, json, time
import requests
from rasa_sdk import Action, Tracker, FormValidationAction
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.types import DomainDict
from rasa_sdk.events import SlotSet
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")
HELPDESK_WEBHOOK = os.getenv("HELPDESK_WEBHOOK", "http://localhost:8000/api/helpdesk/tickets")
HELPDESK_TOKEN = (os.getenv("HELPDESK_TOKEN") or "").strip()

# ---- ENV helpers ----
def _env(name: str, default: Optional[str] = None) -> Optional[str]:
    return os.getenv(name, default)

# ---- Config via ENV (usa los mismos del backend/.env) ----
MONGO_URI = _env("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB  = _env("MONGO_DB_NAME", "chatbot_tutor_virtual_v2")

SMTP_SERVER = _env("SMTP_SERVER", "")
SMTP_PORT   = int(_env("SMTP_PORT", "587") or 587)
SMTP_USER   = _env("SMTP_USER", "")
SMTP_PASS   = _env("SMTP_PASS", "")
EMAIL_FROM  = _env("EMAIL_FROM", SMTP_USER or "bot@ejemplo.com")
EMAIL_TO    = _env("EMAIL_TO", "soporte@ejemplo.com")

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")

def send_email(subject: str, body: str, to_addr: str) -> bool:
    if not (SMTP_SERVER and SMTP_USER and SMTP_PASS and to_addr):
        return False
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = EMAIL_FROM
        msg["To"] = to_addr
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(EMAIL_FROM, [to_addr], msg.as_string())
        return True
    except Exception as e:
        print(f"[actions] Error enviando correo: {e}")
        return False

# =========================
#  Formularios (validación)
# =========================
class ValidateSoporteForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_soporte_form"

    def validate_nombre(self, value: Text, dispatcher, tracker, domain) -> Dict[Text, Any]:
        val = (value or "").strip()
        if len(val) < 3:
            dispatcher.utter_message("⚠️ El nombre debe tener al menos 3 caracteres. Intenta de nuevo, por favor.")
            return {"nombre": None}
        return {"nombre": val}

    def validate_email(self, value: Text, dispatcher, tracker, domain) -> Dict[Text, Any]:
        val = (value or "").strip()
        m = EMAIL_RE.search(val)
        if not m:
            dispatcher.utter_message("📧 Ese email no parece válido. Escribe algo como usuario@dominio.com")
            return {"email": None}
        return {"email": m.group(0)}

    def validate_mensaje(self, value: Text, dispatcher, tracker, domain) -> Dict[Text, Any]:
        val = (value or "").strip()
        if len(val) < 8:
            dispatcher.utter_message("📝 Dame un poco más de detalle del problema (mínimo 8 caracteres).")
            return {"mensaje": None}
        return {"mensaje": val}


class ValidateRecoveryForm(FormValidationAction):
    """Form para flujo de recuperación de contraseña (solo email)"""
    def name(self) -> Text:
        return "validate_recovery_form"

    def validate_email(self, value: Text, dispatcher, tracker, domain) -> Dict[Text, Any]:
        val = (value or "").strip()
        m = EMAIL_RE.search(val)
        if not m:
            dispatcher.utter_message("📧 Ese email no parece válido. Escribe algo como usuario@dominio.com")
            return {"email": None}
        return {"email": m.group(0)}

# ==============
#    Acciones
# ==============
class ActionEnviarCorreo(Action):
    def name(self) -> Text:
        return "action_enviar_correo"

    def run(self, dispatcher, tracker, domain) -> List[Dict[Text, Any]]:
        email = tracker.get_slot("email")
        if not email:
            dispatcher.utter_message("⚠️ No detecté tu correo. Por favor, escríbelo (ej: usuario@ejemplo.com).")
            return []
        reset_link = f"https://zajuna.com/reset?email={email}"
        body = (
            "Hola,\n\nHas solicitado recuperar tu contraseña.\n"
            f"Usa el siguiente enlace para continuar: {reset_link}\n\n"
            "Si no fuiste tú, ignora este mensaje."
        )
        sent = send_email("Recuperación de contraseña", body, email)
        if sent:
            dispatcher.utter_message("📬 Te envié un enlace de recuperación a tu correo.")
        else:
            dispatcher.utter_message("ℹ️ Registré tu solicitud. Si el envío falla, te contactará soporte.")
        return []

class ActionConectarHumano(Action):
    def name(self) -> Text:
        return "action_conectar_humano"

    def run(self, dispatcher, tracker, domain) -> List[Dict[Text, Any]]:
        import json, requests

        user_text = tracker.latest_message.get("text", "")
        nombre  = tracker.get_slot("nombre") or tracker.get_slot("user_name") or "Estudiante"
        email   = tracker.get_slot("email") or "sin-correo@zajuna.edu"
        contexto = {
            "conversation_id": tracker.sender_id,
            "last_message": user_text,
            "slots": tracker.current_slot_values(),
        }

        kind = os.getenv("HELPDESK_KIND", "webhook").lower()

        try:
            if kind == "zendesk":
                url = os.getenv("HELPDESK_URL")
                token = os.getenv("HELPDESK_TOKEN")
                agent = os.getenv("HELPDESK_EMAIL", "agent@zajuna.edu")
                auth = (f"{agent}/token", token)
                payload = {
                    "ticket": {
                        "subject": f"[Zajuna] Soporte para {nombre}",
                        "comment": {"body": f"Email: {email}\n\nContexto:\n{json.dumps(contexto, ensure_ascii=False, indent=2)}"},
                        "requester": {"name": nombre, "email": email},
                        "priority": "normal",
                    }
                }
                r = requests.post(url, json=payload, auth=auth, timeout=10)
                r.raise_for_status()

            elif kind == "freshdesk":
                url = os.getenv("HELPDESK_URL")
                api_key = os.getenv("HELPDESK_TOKEN")
                headers = {"Content-Type": "application/json"}
                payload = {
                    "email": email,
                    "subject": f"[Zajuna] Soporte para {nombre}",
                    "description": f"Contexto:\n{json.dumps(contexto, ensure_ascii=False, indent=2)}",
                    "priority": 2,
                    "status": 2,
                }
                r = requests.post(url, json=payload, auth=(api_key, "X"), headers=headers, timeout=10)
                r.raise_for_status()

            elif kind == "jira":
                url = os.getenv("HELPDESK_URL")  # ej: https://TU.atlassian.net/rest/api/3/issue
                api_user = os.getenv("HELPDESK_EMAIL")
                api_token = os.getenv("HELPDESK_TOKEN")
                headers = {"Content-Type": "application/json"}
                payload = {
                    "fields": {
                        "summary": f"[Zajuna] Soporte para {nombre}",
                        "issuetype": {"name": "Task"},
                        "project": {"key": "HELP"},  # ajusta KEY
                        "description": f"Email: {email}\n\nContexto:\n{json.dumps(contexto, ensure_ascii=False, indent=2)}",
                    }
                }
                r = requests.post(url, json=payload, auth=(api_user, api_token), headers=headers, timeout=10)
                r.raise_for_status()

            elif kind == "zoho":
                url = os.getenv("HELPDESK_URL")
                token = os.getenv("HELPDESK_TOKEN")
                headers = {"Authorization": f"Zoho-oauthtoken {token}", "Content-Type": "application/json"}
                payload = {
                    "subject": f"[Zajuna] Soporte para {nombre}",
                    "email": email,
                    "description": f"Contexto:\n{json.dumps(contexto, ensure_ascii=False, indent=2)}",
                    "departmentId": os.getenv("ZOHO_DEPT_ID"),
                }
                r = requests.post(url, json=payload, headers=headers, timeout=10)
                r.raise_for_status()

            else:
                # Webhook genérico
                url = os.getenv("HELPDESK_WEBHOOK")
                token = os.getenv("HELPDESK_TOKEN", "")
                headers = {"Content-Type": "application/json"}
                if token:
                    headers["Authorization"] = f"Bearer {token}"
                payload = {"nombre": nombre, "email": email, "contexto": contexto}
                r = requests.post(url, json=payload, headers=headers, timeout=10)
                r.raise_for_status()

            dispatcher.utter_message("🧑‍💼 Listo: te estamos derivando con un agente humano. Te contactarán pronto.")
        except Exception as e:
            print(f"[actions] Escalado falló: {e}")
            dispatcher.utter_message("⚠️ No pude crear el ticket ahora. Dejé registrada tu solicitud y lo intentaremos de nuevo.")

        return []

class ActionEnviarSoporte(Action):
    def name(self) -> Text:
        return "action_enviar_soporte"

    def run(self, dispatcher, tracker, domain) -> List[Dict[Text, Any]]:
        nombre  = tracker.get_slot("nombre")
        email   = tracker.get_slot("email")
        mensaje = tracker.get_slot("mensaje")

        if not (nombre and email and mensaje):
            dispatcher.utter_message("❌ Faltan datos para enviar el formulario de soporte.")
            return []

        # Guardar en Mongo
        try:
            client = MongoClient(MONGO_URI)
            db = client[MONGO_DB]
            db.soporte.insert_one({
                "nombre": nombre,
                "email": email,
                "mensaje": mensaje,
                "leido": False
            })
            print("[actions] ✅ Soporte guardado en MongoDB.")
        except Exception as e:
            print(f"[actions] ❌ Error guardando en Mongo: {e}")
            dispatcher.utter_message("⚠️ No pude guardar la solicitud en la base de datos.")
            return []

        # Notificación por correo (opcional)
        body = (
            "📩 Nueva solicitud de soporte\n\n"
            f"👤 Nombre: {nombre}\n"
            f"📧 Email: {email}\n"
            f"📝 Mensaje:\n{mensaje}\n"
        )
        _ = send_email("🛠️ Nueva solicitud de soporte", body, EMAIL_TO)

        dispatcher.utter_message("✅ Hemos recibido tu solicitud de soporte. Te contactaremos pronto.")
        return [SlotSet("nombre", None), SlotSet("email", None), SlotSet("mensaje", None)]

class ActionConectarHumano(Action):
    def name(self) -> Text:
        return "action_conectar_humano"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Datos básicos (si tienes slots nombre/email, úsalos)
        nombre = tracker.get_slot("nombre") or tracker.sender_id
        email = tracker.get_slot("email")
        last_user_msg = next((e.get("text") for e in reversed(tracker.events) if e.get("event")=="user"), None)

        payload = {
            "name": nombre,
            "email": email,
            "subject": "Escalada a humano desde el chatbot",
            "message": last_user_msg or "El usuario solicitó ser atendido por un humano.",
            "conversation_id": tracker.sender_id,
            "channel": "web",
            "meta": {
                "slots": tracker.current_slot_values(),
                "latest_intent": tracker.latest_message.get("intent", {}).get("name"),
                "timestamp": int(time.time()),
            }
        }

        headers = {"Content-Type": "application/json"}
        if HELPDESK_TOKEN:
            headers["Authorization"] = f"Bearer {HELPDESK_TOKEN}"

        try:
            r = requests.post(HELPDESK_WEBHOOK, headers=headers, data=json.dumps(payload), timeout=10)
            if r.status_code >= 300:
                dispatcher.utter_message("⚠️ No pude crear el ticket de soporte en este momento.")
            else:
                dispatcher.utter_message("🧑‍💻 ¡Listo! Te conecto con un agente humano, por favor espera…")
        except Exception:
            dispatcher.utter_message("⚠️ No pude contactar a la mesa de ayuda. Intentaremos de nuevo en breve.")

        return []
class ValidateSoporteForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_soporte_form"

    def validate_nombre(
        self,
        value: Text,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        v = (value or "").strip()
        if len(v) < 2:
            dispatcher.utter_message(text="⚠️ El nombre es muy corto. ¿Podrías escribir tu nombre completo?")
            return {"nombre": None}
        if len(v) > 120:
            dispatcher.utter_message(text="⚠️ El nombre es muy largo. ¿Podrías abreviarlo un poco?")
            return {"nombre": None}
        return {"nombre": v}

    def validate_email(
        self,
        value: Text,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        v = (value or "").strip()
        if not EMAIL_RE.match(v):
            dispatcher.utter_message(text="⚠️ Ese correo no parece válido. ¿Puedes verificarlo?")
            return {"email": None}
        return {"email": v}

    def validate_mensaje(
        self,
        value: Text,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        v = (value or "").strip()
        if len(v) < 5:
            dispatcher.utter_message(text="⚠️ Cuéntame un poco más del problema (5+ caracteres).")
            return {"mensaje": None}
        if len(v) > 5000:
            dispatcher.utter_message(text="⚠️ El mensaje es muy largo. Intenta resumirlo (máx. 5000).")
            return {"mensaje": None}
        return {"mensaje": v}


class ActionSoporteSubmit(Action):
    def name(self) -> Text:
        return "action_soporte_submit"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> List[Dict[Text, Any]]:
        nombre = tracker.get_slot("nombre")
        email = tracker.get_slot("email")
        mensaje = tracker.get_slot("mensaje")

        # Contexto útil
        meta: Dict[str, Any] = {
            "rasa_sender_id": tracker.sender_id,
            "latest_intent": (tracker.latest_message.get("intent") or {}).get("name"),
            "conversation_id": tracker.sender_id,
        }

        payload = {
            "name": nombre,
            "email": email,
            "subject": "Soporte técnico (Rasa)",
            "message": mensaje,
            "conversation_id": tracker.sender_id,
            "metadata": meta,
        }

        headers = {"Content-Type": "application/json"}
        if HELPDESK_TOKEN:
            headers["Authorization"] = f"Bearer {HELPDESK_TOKEN}"

        try:
            resp = requests.post(HELPDESK_WEBHOOK, data=json.dumps(payload), headers=headers, timeout=10)
            if resp.status_code >= 200 and resp.status_code < 300:
                dispatcher.utter_message(response="utter_soporte_creado")
                # Limpia slots
                return [SlotSet("nombre", None), SlotSet("email", None), SlotSet("mensaje", None)]
            else:
                dispatcher.utter_message(response="utter_soporte_error")
                dispatcher.utter_message(text=f"(Detalle técnico: {resp.status_code})")
                return []
        except Exception as e:
            dispatcher.utter_message(response="utter_soporte_error")
            dispatcher.utter_message(text=f"(Excepción: {e})")
            return []