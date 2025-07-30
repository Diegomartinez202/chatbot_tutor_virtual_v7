import os
from dotenv import load_dotenv

# 🔁 Cargar variables desde el archivo .env
load_dotenv()

# ================================
# ⚙️ Variables de configuración
# ================================

# 📦 MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "chatbot_tutor")

# 🔐 JWT
JWT_SECRET = os.getenv("JWT_SECRET", "clave-super-secreta")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", 60))

# 🤖 Rasa Bot
RASA_DATA_PATH = os.getenv("RASA_DATA_PATH", "../rasa/data/nlu.yml")
RASA_DOMAIN_PATH = os.getenv("RASA_DOMAIN_PATH", "../rasa/domain.yml")
RASA_TRAIN_COMMAND = os.getenv("RASA_TRAIN_COMMAND", "rasa train")
RASA_MODEL_PATH = os.getenv("RASA_MODEL_PATH", "../rasa/models")
RASA_SERVER_URL = os.getenv("RASA_SERVER_URL", "http://localhost:5005/webhooks/rest/webhook")

# 📧 Configuración de correo SMTP
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
EMAIL_FROM = os.getenv("EMAIL_FROM")
EMAIL_TO = os.getenv("EMAIL_TO")

# 👤 Correo del administrador
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")