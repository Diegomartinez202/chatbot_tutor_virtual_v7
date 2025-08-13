# rasa/actions/actions.py
from __future__ import annotations

import os
import re
import time
import smtplib
from typing import Any, Dict, List, Text

import requests
from email.mime.text import MIMEText

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from rasa_sdk.types import DomainDict
from rasa_sdk.forms import FormValidationAction  # Rasa SDK 3.x

# =========================
#    Config & Constantes
# =========================
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")

HELPDESK_WEBHOOK: str = os.getenv(
    "HELPDESK_WEBHOOK",
    "http://localhost:8000/api/helpdesk/tickets",
).strip()

HELPDESK_TOKEN: str = (os.getenv("HELPDESK_TOKEN") or "").strip()

# SMTP (opcional para action_enviar_correo)
SMTP_SERVER = (os.getenv("SMTP_SERVER") or "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT") or 587)
SMTP_USER = (os.getenv("SMTP_USER") or "").strip()
SMTP_PASS = (os.getenv("SMTP_PASS") or "").strip()
EMAIL_FROM = (os.getenv("EMAIL_FROM") or SMTP_USER or "bot@ejemplo.com").strip()


# =========================
#   Utilidades opcionales
# =========================
def send_email(subject: str, body: str, to_addr: str) -> bool:
    """
    Envía un correo simple por SMTP si hay configuración. Devuelve True/False.
    No lanza excepciones al flujo del bot.
    """
    if not (SMTP_SERVER and SMTP_USER and SMTP_PASS and to_addr):
        print("[actions] SMTP no configurado; omitiendo envío.")
        return False
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = EMAIL_FROM
        msg["To"] = to_addr
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(EMAIL_FROM, [to_addr], msg.as_string())
        print("[actions] ✅ Correo enviado correctamente.")
        return True
    except Exception as e:
        print(f"[actions] ❌ Error enviando correo: {e}")
        return False


# =========================
#   Validaciones de Forms
# =========================
class ValidateSoporteForm(FormValidationAction):
    """Valida los slots del soporte_form: nombre, email, mensaje"""

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
        if len(v) < 3:
            dispatcher.utter_message(text="⚠️ El nombre debe tener al menos 3 caracteres.")
            return {"nombre": None}
        if len(v) > 120:
            dispatcher.utter_message(text="⚠️ El nombre es muy largo. ¿Puedes abreviarlo un poco?")
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
            dispatcher.utter_message(text="📧 Ese email no parece válido. Escribe algo como usuario@dominio.com")
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
        if len(v) < 8:
            dispatcher.utter_message(text="📝 Dame un poco más de detalle del problema (mínimo 8 caracteres).")
            return {"mensaje": None}
        if len(v) > 5000:
            dispatcher.utter_message(text="📝 El mensaje es muy largo. Intenta resumirlo (máx. 5000).")
            return {"mensaje": None}
        return {"mensaje": v}


class ValidateRecoveryForm(FormValidationAction):
    """Valida el slot email del recovery_form (recuperación de contraseña)"""

    def name(self) -> Text:
        return "validate_recovery_form"

    def validate_email(
        self,
        value: Text,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        v = (value or "").strip()
        if not EMAIL_RE.match(v):
            dispatcher.utter_message(text="📧 Ese email no parece válido. Escribe algo como usuario@dominio.com")
            return {"email": None}
        return {"email": v}


# ==============   Acciones   ==============
class ActionEnviarCorreo(Action):
    """Envía un email de recuperación (opcionalmente por SMTP)"""

    def name(self) -> Text:
        return "action_enviar_correo"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> List[Dict[Text, Any]]:
        email = (tracker.get_slot("email") or "").strip()
        if not email:
            dispatcher.utter_message(text="⚠️ No detecté tu correo. Por favor, escríbelo (ej: usuario@ejemplo.com).")
            return []

        reset_link = f"https://zajuna.edu/reset?email={email}"
        body = (
            "Hola,\n\nHas solicitado recuperar tu contraseña.\n"
            f"Usa el siguiente enlace para continuar: {reset_link}\n\n"
            "Si no fuiste tú, ignora este mensaje."
        )
        sent = send_email("Recuperación de contraseña", body, email)
        if sent:
            dispatcher.utter_message(text="📬 Te envié un enlace de recuperación a tu correo.")
        else:
            dispatcher.utter_message(text="ℹ️ Tu solicitud fue registrada. Revisa tu correo más tarde.")
        return []


class ActionSoporteSubmit(Action):
    """
    Envía la solicitud del soporte_form al webhook del Helpdesk.
    Variables:
      - HELPDESK_WEBHOOK (URL)
      - HELPDESK_TOKEN   (Bearer opcional)
    """

    def name(self) -> Text:
        return "action_soporte_submit"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> List[Dict[Text, Any]]:
        nombre = (tracker.get_slot("nombre") or "").strip()
        email = (tracker.get_slot("email") or "").strip()
        mensaje = (tracker.get_slot("mensaje") or "").strip()

        if not (nombre and email and mensaje):
            dispatcher.utter_message(text="❌ Faltan datos para crear el ticket de soporte.")
            return []

        meta: Dict[str, Any] = {
            "rasa_sender_id": tracker.sender_id,
            "latest_intent": (tracker.latest_message.get("intent") or {}).get("name"),
            "timestamp": int(time.time()),
            "slots": tracker.current_slot_values(),
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
            resp = requests.post(
                HELPDESK_WEBHOOK,
                json=payload,
                headers=headers,
                timeout=10,
            )
            if 200 <= resp.status_code < 300:
                dispatcher.utter_message(response="utter_soporte_creado")
                return [SlotSet("nombre", None), SlotSet("email", None), SlotSet("mensaje", None)]
            else:
                print(f"[actions] Helpdesk respondió {resp.status_code}: {resp.text}")
                dispatcher.utter_message(response="utter_soporte_error")
                return []
        except Exception as e:
            print(f"[actions] Excepción contactando Helpdesk: {e}")
            dispatcher.utter_message(response="utter_soporte_error")
            return []


class ActionConectarHumano(Action):
    """Crea ticket de 'escalado a humano' por el mismo webhook genérico."""

    def name(self) -> Text:
        return "action_conectar_humano"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> List[Dict[Text, Any]]:
        nombre = (tracker.get_slot("nombre") or "Estudiante").strip()
        email = (tracker.get_slot("email") or "sin-correo@zajuna.edu").strip()
        last_user_msg = tracker.latest_message.get("text") or "El usuario solicitó ser atendido por un humano."

        contexto = {
            "conversation_id": tracker.sender_id,
            "last_message": last_user_msg,
            "slots": tracker.current_slot_values(),
            "latest_intent": (tracker.latest_message.get("intent") or {}).get("name"),
            "timestamp": int(time.time()),
        }

        payload = {
            "name": nombre,
            "email": email,
            "subject": "Escalada a humano desde el chatbot",
            "message": last_user_msg,
            "conversation_id": tracker.sender_id,
            "metadata": contexto,
        }

        headers = {"Content-Type": "application/json"}
        if HELPDESK_TOKEN:
            headers["Authorization"] = f"Bearer {HELPDESK_TOKEN}"

        try:
            resp = requests.post(
                HELPDESK_WEBHOOK,
                json=payload,
                headers=headers,
                timeout=10,
            )
            if 200 <= resp.status_code < 300:
                dispatcher.utter_message(text="🧑‍💻 ¡Listo! Te conecto con un agente humano, por favor espera…")
            else:
                print(f"[actions] Escalado falló {resp.status_code}: {resp.text}")
                dispatcher.utter_message(text="⚠️ No pude crear el ticket de escalado en este momento.")
        except Exception as e:
            print(f"[actions] Excepción en escalado: {e}")
            dispatcher.utter_message(text="⚠️ No pude contactar a la mesa de ayuda. Intentaremos de nuevo en breve.")
        return []


# =========================
#        Auth gating
# =========================
JWT_PUBLIC_KEY = os.getenv("JWT_PUBLIC_KEY", "")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "RS256")


def _has_auth(tracker: Tracker) -> bool:
    """Devuelve True si la UI/proxy indicó que hay auth válida."""
    meta = (tracker.latest_message or {}).get("metadata") or {}
    auth = meta.get("auth") if isinstance(meta, dict) else {}

    # Caso simple enviado por la UI: metadata.auth.hasToken = true|false
    if isinstance(auth, dict) and auth.get("hasToken"):
        return True

    # Si tu proxy añade claims tras validar JWT en FastAPI
    if isinstance(auth, dict) and auth.get("claims"):
        return True

    # (Opcional) Validación local del JWT si decidieras pasar el token crudo en metadata.
    # DESACTIVADA por seguridad a menos que tú la habilites.
    # token = isinstance(auth, dict) and auth.get("token")
    # if token and JWT_PUBLIC_KEY:
    #     try:
    #         import jwt  # pyjwt
    #         jwt.decode(token, JWT_PUBLIC_KEY, algorithms=[JWT_ALGORITHM], options={"verify_aud": False})
    #         return True
    #     except Exception:
    #         return False

    return False


class ActionCheckAuth(Action):
    def name(self) -> Text:
        return "action_check_auth"

    async def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: DomainDict
    ) -> List[Dict[Text, Any]]:
        intent = ((tracker.latest_message or {}).get("intent") or {}).get("name") or ""
        authed = _has_auth(tracker)

        if intent in ("estado_estudiante", "ver_certificados"):
            if not authed:
                # ChatUI reconocerá custom.type=auth_needed y mostrará botón "Iniciar sesión"
                dispatcher.utter_message(response="utter_need_auth")
                return []

            # Con auth válida: responde (o delega a otra action que consulte tu API)
            if intent == "estado_estudiante":
                dispatcher.utter_message(response="utter_estado_estudiante")
            elif intent == "ver_certificados":
                dispatcher.utter_message(response="utter_certificados_info")
            return []

        # Otros intents: no interviene
        return []