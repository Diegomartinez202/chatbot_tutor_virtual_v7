# ✅ backend/config/settings.py

from pydantic import BaseSettings, Field, EmailStr
from typing import List
import os
SECRET_KEY = os.getenv("SECRET_KEY", "clave_insegura_por_defecto")
class Settings(BaseSettings):
    # 📦 MongoDB
    mongo_uri: str = Field(..., env="MONGO_URI")
    mongo_db_name: str = Field(..., env="MONGO_DB_NAME")

    # 🔐 JWT
    secret_key: str = Field(..., env="SECRET_KEY")
    access_token_expire_minutes: int = Field(60, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # 🤖 Rasa Bot
    rasa_url: str = Field(..., env="RASA_URL")
    rasa_data_path: str = Field(..., env="RASA_DATA_PATH")
    rasa_domain_path: str = Field(..., env="RASA_DOMAIN_PATH")
    rasa_train_command: str = Field("rasa train", env="RASA_TRAIN_COMMAND")
    rasa_model_path: str = Field(..., env="RASA_MODEL_PATH")

    # 📧 SMTP
    smtp_server: str = Field(..., env="SMTP_SERVER")
    smtp_port: int = Field(587, env="SMTP_PORT")
    smtp_user: str = Field(..., env="SMTP_USER")
    smtp_pass: str = Field(..., env="SMTP_PASS")
    email_from: EmailStr = Field(..., env="EMAIL_FROM")
    email_to: EmailStr = Field(..., env="EMAIL_TO")

    # 👤 Admin
    admin_email: EmailStr = Field(..., env="ADMIN_EMAIL")

    # 🧾 Logs y entorno
    log_dir: str = Field("logs", env="LOG_DIR")
    allowed_origins: List[str] = Field(["http://localhost:5173"], env="ALLOWED_ORIGINS")
    debug: bool = Field(False, env="DEBUG")

    class Config:
        env_file = ".env"

# ✅ Instancia global lista para importar en todo el backend
settings = Settings()