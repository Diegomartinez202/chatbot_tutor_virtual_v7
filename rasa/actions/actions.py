import os
import smtplib
from email.mime.text import MIMEText
from pymongo import MongoClient
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

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
            mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
            mongo_db = os.getenv("MONGO_DB_NAME", "chatbot_db")
            client = MongoClient(mongo_uri)
            db = client[mongo_db]
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
            smtp_user = os.getenv("SMTP_USER", "tubot@zajuna.edu.co")
            smtp_pass = os.getenv("SMTP_PASS", "")
            to = os.getenv("EMAIL_TO", smtp_user)

            msg = MIMEText(f"📩 Nueva solicitud de soporte\n\n👤 Nombre: {nombre}\n📧 Email: {email}\n📝 Mensaje:\n{mensaje}")
            msg["Subject"] = "🛠️ Nueva solicitud de soporte"
            msg["From"] = smtp_user
            msg["To"] = to

            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, to, msg.as_string())
            print("✅ Correo de soporte enviado.")
        except Exception as e:
            print(f"❌ Error enviando correo: {e}")
            dispatcher.utter_message("⚠️ Guardamos tu solicitud pero falló el envío del correo.")
            return []

        dispatcher.utter_message("✅ Hemos recibido tu solicitud de soporte. Te contactaremos pronto.")

        # 🧹 Limpiar slots
        return [
            SlotSet("nombre", None),
            SlotSet("email", None),
            SlotSet("mensaje", None)
        ]