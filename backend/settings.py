from pydantic import BaseSettings, Field, EmailStr

class Settings(BaseSettings):
    # Mongo
    mongo_uri: str = Field("mongodb://localhost:27017", env="MONGO_URI")
    mongo_db_name: str = Field("chatbot_tutor", env="MONGO_DB_NAME")

    # JWT
    jwt_secret: str = Field("supersecreto", env="JWT_SECRET")
    jwt_expiration_minutes: int = Field(60, env="JWT_EXPIRATION_MINUTES")

    # Rasa
    rasa_url: str = Field("http://localhost:5005/webhooks/rest/webhook", env="RASA_SERVER_URL")

    # Email
    smtp_server: str = Field("smtp.gmail.com", env="SMTP_SERVER")
    smtp_port: int = Field(587, env="SMTP_PORT")
    smtp_user: str = Field("bot@ejemplo.com", env="SMTP_USER")
    smtp_pass: str = Field("123456", env="SMTP_PASS")
    email_from: EmailStr = Field("bot@ejemplo.com", env="EMAIL_FROM")
    email_to: EmailStr = Field("soporte@ejemplo.com", env="EMAIL_TO")

    # Admin
    admin_email: EmailStr = Field("admin@ejemplo.com", env="ADMIN_EMAIL")

    class Config:
        env_file = "docker/.env"  # o ".env" si ejecutas fuera de Docker

# Instancia única que puedes importar
settings = Settings()