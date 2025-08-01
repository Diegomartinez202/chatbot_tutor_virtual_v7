from email.mime.text import MIMEText
from pymongo import MongoClient
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from backend.settings import settings  # ✅ Configuración centralizada

class ActionEnviarSoporte(Action):
    def name(self) -> Text:
        return "action_enviar_soporte"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # 🎯 Recuperar slots
        nombre = tracker.get_slot("nombre")
        email = tracker.get_slot("email")
        mensaje = tracker.get_slot("mensaje")

        if not (nombre and email and mensaje):
            dispatcher.utter_message("❌ Faltan datos para enviar el formulario de soporte.")
            return []

        # 📦 Guardar en MongoDB
        try:
            client = MongoClient(settings.mongo_uri)
            db = client[settings.mongo_db_name]
            db.soporte.insert_one({
                "nombre": nombre,
                "email": email,
                "mensaje": mensaje,
                "leido": False
            })
            print("✅ Soporte guardado en MongoDB.")
        except Exception as e:
            print(f"❌ Error guardando en Mongo: {e}")
            dispatcher.utter_message("⚠️ No pude guardar la solicitud en la base de datos.")
            return []

        # 📧 Enviar correo
        try:
            msg = MIMEText(
                f"📩 Nueva solicitud de soporte\n\n"
                f"👤 Nombre: {nombre}\n"
                f"📧 Email: {email}\n"
                f"📝 Mensaje:\n{mensaje}"
            )
            msg["Subject"] = "🛠️ Nueva solicitud de soporte"
            msg["From"] = settings.smtp_user
            msg["To"] = settings.email_to

            import smtplib
            with smtplib.SMTP_SSL(settings.smtp_server, settings.smtp_port) as server:
                server.login(settings.smtp_user, settings.smtp_pass)
                server.sendmail(settings.smtp_user, settings.email_to, msg.as_string())

            print("✅ Correo de soporte enviado.")
        except Exception as e:
            print(f"❌ Error enviando correo: {e}")
            dispatcher.utter_message("⚠️ Guardamos tu solicitud pero falló el envío del correo.")
            return []

        dispatcher.utter_message("✅ Hemos recibido tu solicitud de soporte. Te contactaremos pronto.")

        return [
            SlotSet("nombre", None),
            SlotSet("email", None),
            SlotSet("mensaje", None)
        ]