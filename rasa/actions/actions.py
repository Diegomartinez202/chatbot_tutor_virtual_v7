# rasa/actions/actions.py
from __future__ import annotations

import os
import re
import time
import smtplib
from typing import Any, Dict, List, Optional, Text

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

HELPDESK_WEBHOOK: str = (os.getenv("HELPDESK_WEBHOOK") or "http://localhost:8000/api/helpdesk/tickets").strip()
HELPDESK_TOKEN: str = (os.getenv("HELPDESK_TOKEN") or "").strip()

# SMTP (opcional para action_enviar_correo)
SMTP_SERVER = (os.getenv("SMTP_SERVER") or "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT") or 587)
SMTP_USER = (os.getenv("SMTP_USER") or "").strip()
SMTP_PASS = (os.getenv("SMTP_PASS") or "").strip()
EMAIL_FROM = (os.getenv("EMAIL_FROM") or SMTP_USER or "bot@ejemplo.com").strip()

# Timeouts/reintentos para webhooks
REQUEST_TIMEOUT_SECS = int(os.getenv("ACTIONS_HTTP_TIMEOUT", "10"))
MAX_RETRIES = int(os.getenv("ACTIONS_HTTP_RETRIES", "2"))


# =========================
#   Utilidades HTTP/SMTP
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
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=REQUEST_TIMEOUT_SECS) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(EMAIL_FROM, [to_addr], msg.as_string())
        print("[actions] ✅ Correo enviado correctamente.")
        return True
    except Exception as e:
        print(f"[actions] ❌ Error enviando correo: {e}")
        return False


def post_json_with_retries(url: str, payload: Dict[str, Any], headers: Optional[Dict[str, str]] = None) -> Optional[requests.Response]:
    """
    POST JSON con cabeceras y reintento básico.
    Devuelve Response o None si falla definitivamente.
    """
    headers = dict(headers or {})
    headers.setdefault("Content-Type", "application/json")
    for attempt in range(1, MAX_RETRIES + 2):
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=REQUEST_TIMEOUT_SECS)
            return resp
        except Exception as e:
            print(f"[actions] POST intento {attempt} falló: {e}")
            if attempt >= MAX_RETRIES + 1:
                break
            time.sleep(0.5 * attempt)
    return None


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


class ActionEnviarSoporte(Action):
    """
    Variante genérica para enviar un soporte rápido sin pasar por el form,
    usando el último mensaje del usuario y slots si existen.
    """

    def name(self) -> Text:
        return "action_enviar_soporte"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> List[Dict[Text, Any]]:
        nombre = (tracker.get_slot("nombre") or "Usuario").strip()
        email = (tracker.get_slot("email") or "sin-correo@zajuna.edu").strip()
        mensaje = (tracker.latest_message.get("text") or "").strip() or "Solicitud de soporte (sin detalle)."

        meta: Dict[str, Any] = {
            "rasa_sender_id": tracker.sender_id,
            "latest_intent": (tracker.latest_message.get("intent") or {}).get("name"),
            "timestamp": int(time.time()),
            "slots": tracker.current_slot_values(),
        }

        payload = {
            "name": nombre,
            "email": email,
            "subject": "Soporte rápido (Rasa)",
            "message": mensaje,
            "conversation_id": tracker.sender_id,
            "metadata": meta,
        }

        headers = {"Content-Type": "application/json"}
        if HELPDESK_TOKEN:
            headers["Authorization"] = f"Bearer {HELPDESK_TOKEN}"

        resp = post_json_with_retries(HELPDESK_WEBHOOK, payload, headers)
        if resp and 200 <= resp.status_code < 300:
            dispatcher.utter_message(text="✅ He enviado tu solicitud de soporte. Un agente te contactará.")
            return []
        else:
            code = getattr(resp, "status_code", "sin-respuesta")
            print(f"[actions] action_enviar_soporte: fallo {code}")
            dispatcher.utter_message(text="⚠️ No pude registrar el soporte ahora mismo. Intentaremos de nuevo.")
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

        resp = post_json_with_retries(HELPDESK_WEBHOOK, payload, headers)
        if resp and 200 <= resp.status_code < 300:
            data: Dict[str, Any] = {}
            try:
                data = resp.json()
            except Exception:
                pass
            tid = (data or {}).get("ticket_id") or (data or {}).get("id")
            if tid:
                dispatcher.utter_message(text=f"🎫 Ticket creado correctamente. ID: {tid}")
            else:
                dispatcher.utter_message(response="utter_soporte_creado")
            # limpiar slots del form
            return [SlotSet("nombre", None), SlotSet("email", None), SlotSet("mensaje", None)]
        else:
            code = getattr(resp, "status_code", "sin-respuesta")
            print(f"[actions] Helpdesk respondió {code}: {getattr(resp, 'text', '')}")
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

        resp = post_json_with_retries(HELPDESK_WEBHOOK, payload, headers)
        if resp and 200 <= resp.status_code < 300:
            dispatcher.utter_message(text="🧑‍💻 ¡Listo! Te conecto con un agente humano, por favor espera…")
        else:
            code = getattr(resp, "status_code", "sin-respuesta")
            print(f"[actions] Escalado falló {code}: {getattr(resp, 'text', '')}")
            dispatcher.utter_message(text="⚠️ No pude crear el ticket de escalado en este momento.")
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

    # (Opcional) Validación local del JWT si decidieras pasar el token crudo.
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