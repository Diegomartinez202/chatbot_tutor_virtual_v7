from pydantic import BaseSettings, Field, EmailStr

class Settings(BaseSettings):
    # 📦 MongoDB
    mongo_uri: str = Field("mongodb://localhost:27017", env="MONGO_URI")
    mongo_db_name: str = Field("chatbot_tutor", env="MONGO_DB_NAME")

    # 🔐 JWT
    jwt_secret: str = Field("clave-super-secreta", env="JWT_SECRET")
    jwt_expiration_minutes: int = Field(60, env="JWT_EXPIRATION_MINUTES")

    # 🤖 Rasa Bot
    rasa_data_path: str = Field("../rasa/data/nlu.yml", env="RASA_DATA_PATH")
    rasa_domain_path: str = Field("../rasa/domain.yml", env="RASA_DOMAIN_PATH")
    rasa_train_command: str = Field("rasa train", env="RASA_TRAIN_COMMAND")
    rasa_model_path: str = Field("../rasa/models", env="RASA_MODEL_PATH")
    rasa_url: str = Field("http://localhost:5005/webhooks/rest/webhook", env="RASA_SERVER_URL")

    # 📧 SMTP y correos
    smtp_server: str = Field("smtp.gmail.com", env="SMTP_SERVER")
    smtp_port: int = Field(587, env="SMTP_PORT")
    smtp_user: str = Field("bot@ejemplo.com", env="SMTP_USER")
    smtp_pass: str = Field("123456", env="SMTP_PASS")
    email_from: EmailStr = Field("bot@ejemplo.com", env="EMAIL_FROM")
    email_to: EmailStr = Field("soporte@ejemplo.com", env="EMAIL_TO")

    # 👤 Admin
    admin_email: EmailStr = Field("admin@ejemplo.com", env="ADMIN_EMAIL")

    class Config:
        env_file = "docker/.env"  # Cambia a ".env" si ejecutas localmente

# ✅ Instancia global lista para importar en cualquier parte del backend
settings = Settings()