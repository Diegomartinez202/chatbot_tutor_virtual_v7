# ✅ backend/config/settings.py

from pydantic import BaseSettings, Field, EmailStr
from typing import List

class Settings(BaseSettings):
    # 📦 MongoDB
    mongo_uri: str = Field("mongodb://localhost:27017", env="MONGO_URI")
    mongo_db_name: str = Field("chatbot_tutor", env="MONGO_DB_NAME")

    # 🔐 JWT
    secret_key: str = Field("supersecretkey", env="SECRET_KEY")
    access_token_expire_minutes: int = Field(60, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # 🤖 Rasa Bot
    rasa_url: str = Field("http://localhost:5005/webhooks/rest/webhook", env="RASA_URL")
    rasa_data_path: str = Field("../rasa/data/nlu.yml", env="RASA_DATA_PATH")
    rasa_domain_path: str = Field("../rasa/domain.yml", env="RASA_DOMAIN_PATH")
    rasa_train_command: str = Field("rasa train", env="RASA_TRAIN_COMMAND")
    rasa_model_path: str = Field("../rasa/models", env="RASA_MODEL_PATH")

    # 📧 SMTP y correos
    smtp_server: str = Field("smtp.gmail.com", env="SMTP_SERVER")
    smtp_port: int = Field(587, env="SMTP_PORT")
    smtp_user: str = Field("bot@ejemplo.com", env="SMTP_USER")
    smtp_pass: str = Field("123456", env="SMTP_PASS")
    email_from: EmailStr = Field("bot@ejemplo.com", env="EMAIL_FROM")
    email_to: EmailStr = Field("soporte@ejemplo.com", env="EMAIL_TO")

    # 👤 Admin
    admin_email: EmailStr = Field("admin@ejemplo.com", env="ADMIN_EMAIL")

    # 🧾 Logs y entorno
    log_dir: str = Field("logs", env="LOG_DIR")
    allowed_origins: List[str] = Field(["http://localhost:5173"], env="ALLOWED_ORIGINS")
    debug: bool = Field(False, env="DEBUG")

    class Config:
        env_file = ".env"  # Usa "docker/.env" si estás en contenedor

# ✅ Instancia global lista para usar
settings = Settings()