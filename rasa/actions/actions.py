# rasa/actions/actions.py
from typing import Any, Text, Dict, List, Optional
from email.mime.text import MIMEText
import smtplib
from pymongo import MongoClient

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

# Si corres actions en un contenedor separado, usa variables de entorno directas
# o crea un módulo settings liviano. Aquí lo hacemos con ENV para que funcione
# tanto local como en Railway sin acoplar al backend.
import os

def _env(name: str, default: Optional[str] = None) -> Optional[str]:
    return os.getenv(name, default)

# ---- Config via ENV (ajústalo en tu deployment de actions) ----
MONGO_URI = _env("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB   = _env("MONGO_DB_NAME", "chatbot_tutor_virtual_v2")

SMTP_SERVER = _env("SMTP_SERVER", "")
SMTP_PORT   = int(_env("SMTP_PORT", "587") or 587)
SMTP_USER   = _env("SMTP_USER", "")
SMTP_PASS   = _env("SMTP_PASS", "")
EMAIL_FROM  = _env("EMAIL_FROM", SMTP_USER or "bot@ejemplo.com")
EMAIL_TO    = _env("EMAIL_TO", "soporte@ejemplo.com")


def send_email(subject: str, body: str, to_addr: str) -> bool:
    """Envia correo si SMTP está configurado; retorna True si lo intentó/consiguió."""
    if not (SMTP_SERVER and SMTP_USER and SMTP_PASS):
        # SMTP no configurado → no romper; retornar False
        return False
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = EMAIL_FROM
        msg["To"] = to_addr

        # TLS (587) por defecto; si usas 465, cambia a SMTP_SSL
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(EMAIL_FROM, [to_addr], msg.as_string())
        return True
    except Exception as e:
        print(f"[actions] Error enviando correo: {e}")
        return False


class ActionEnviarCorreo(Action):
    """Envía link de recuperación al email capturado (slot email)."""

    def name(self) -> Text:
        return "action_enviar_correo"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        email = tracker.get_slot("email")
        if not email:
            dispatcher.utter_message("⚠️ No detecté tu correo. Por favor, escríbelo (ej: usuario@ejemplo.com).")
            return []

        # Aquí podrías generar un enlace real de recuperación
        reset_link = f"https://zajuna.com/reset?email={email}"

        body = (
            "Hola,\n\n"
            "Has solicitado recuperar tu contraseña.\n"
            f"Usa el siguiente enlace para continuar: {reset_link}\n\n"
            "Si no fuiste tú, ignora este mensaje."
        )
        sent = send_email("Recuperación de contraseña", body, email)
        if sent:
            dispatcher.utter_message("📬 Te envié un enlace de recuperación a tu correo.")
        else:
            dispatcher.utter_message("ℹ️ Dejé registrado tu correo. Si el envío falla, el equipo te contactará manualmente.")

        return []


class ActionConectarHumano(Action):
    """Aquí conectarías con tu mesa de ayuda / Zendesk / Freshdesk / etc."""

    def name(self) -> Text:
        return "action_conectar_humano"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Puedes levantar un ticket con la última entrada del usuario:
        last_user_msg = tracker.latest_message.get("text", "")
        # TODO: integrar con tu sistema de tickets
        print(f"[actions] Escalando a humano. Último mensaje: {last_user_msg}")
        dispatcher.utter_message("🧑‍💼 Te vamos a derivar con un agente humano. ¡Gracias por tu paciencia!")
        return []


class ActionEnviarSoporte(Action):
    """Persiste solicitud de soporte en MongoDB y notifica por email a soporte."""

    def name(self) -> Text:
        return "action_enviar_soporte"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Estos slots pueden llenarse via NLU/regex o un formulario (no definido aquí)
        nombre  = tracker.get_slot("nombre")
        email   = tracker.get_slot("email")
        mensaje = tracker.get_slot("mensaje")

        if not (nombre and email and mensaje):
            dispatcher.utter_message("❌ Faltan datos para enviar el formulario de soporte. Escribe: nombre, email y el problema.")
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

        # Notificar por correo a la mesa
        body = (
            "📩 Nueva solicitud de soporte\n\n"
            f"👤 Nombre: {nombre}\n"
            f"📧 Email: {email}\n"
            f"📝 Mensaje:\n{mensaje}\n"
        )
        _ = send_email("🛠️ Nueva solicitud de soporte", body, EMAIL_TO)

        dispatcher.utter_message("✅ Hemos recibido tu solicitud de soporte. Te contactaremos pronto.")
        return [
            SlotSet("nombre", None),
            SlotSet("email", None),
            SlotSet("mensaje", None),
        ]