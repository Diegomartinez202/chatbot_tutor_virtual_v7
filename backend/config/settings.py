# backend/config/settings.py
from pydantic import BaseSettings, Field, EmailStr
from typing import List, Optional, Literal

class Settings(BaseSettings):
    # 📦 MongoDB
    mongo_uri: str = Field(..., env="MONGO_URI")
    mongo_db_name: str = Field(..., env="MONGO_DB_NAME")

    # 🔐 JWT
    secret_key: str = Field(..., env="SECRET_KEY")
    access_token_expire_minutes: int = Field(60, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    jwt_algorithm: str = Field("HS256", env="JWT_ALGORITHM")

    # 🤖 Rasa Bot
    rasa_url: str = Field(..., env="RASA_URL")
    rasa_data_path: str = Field(..., env="RASA_DATA_PATH")
    rasa_domain_path: str = Field(..., env="RASA_DOMAIN_PATH")
    rasa_model_path: str = Field(..., env="RASA_MODEL_PATH")
    rasa_train_command: str = Field("rasa train", env="RASA_TRAIN_COMMAND")

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
    debug: bool = Field(False, env="DEBUG")
    log_dir: str = Field("logs", env="LOG_DIR")
    allowed_origins: List[str] = Field(["http://localhost:5173"], env="ALLOWED_ORIGINS")

    # 📁 Rutas estáticas
    static_dir: str = Field("backend/static", env="STATIC_DIR")
    template_dir: str = Field("backend/templates", env="TEMPLATE_DIR")
    favicon_path: str = Field("backend/static/favicon.ico", env="FAVICON_PATH")

    # ☁️ S3
    aws_access_key_id: str = Field(..., env="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str = Field(..., env="AWS_SECRET_ACCESS_KEY")
    aws_s3_bucket_name: str = Field(..., env="AWS_S3_BUCKET_NAME")
    aws_s3_region: str = Field("us-east-1", env="AWS_S3_REGION")
    aws_s3_endpoint_url: str = Field("https://s3.amazonaws.com", env="AWS_S3_ENDPOINT_URL")

    # 🌐 URL base de backend
    base_url: str = Field("http://localhost:8000", env="BASE_URL")

    # 🧩 Embebido (opcional)
    frame_ancestors: List[str] = Field(default_factory=list, env="FRAME_ANCESTORS")

    # 🌱 Entorno
    app_env: Literal["dev", "test", "prod"] = Field("dev", env="APP_ENV")

    # 🚦 Rate limiting
    rate_limit_enabled: bool = Field(True, env="RATE_LIMIT_ENABLED")
    rate_limit_backend: Literal["memory", "redis"] = Field("memory", env="RATE_LIMIT_BACKEND")
    rate_limit_window_sec: int = Field(60, env="RATE_LIMIT_WINDOW_SEC")
    rate_limit_max_requests: int = Field(60, env="RATE_LIMIT_MAX_REQUESTS")
    redis_url: Optional[str] = Field(None, env="REDIS_URL")

    class Config:
        env_file = ".env"

settings = Settings()