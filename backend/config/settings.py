# backend/config/settings.py
from pydantic import BaseSettings, Field, EmailStr, validator
from typing import List, Optional, Literal
import json

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
    rasa_data_path: str = Field("rasa/data/nlu.yml", env="RASA_DATA_PATH")
    rasa_domain_path: str = Field("rasa/domain.yml", env="RASA_DOMAIN_PATH")
    rasa_model_path: str = Field("rasa/models", env="RASA_MODEL_PATH")
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
    allowed_origins: List[str] = Field(default_factory=lambda: ["http://localhost:5173"], env="ALLOWED_ORIGINS")

    # 📁 Rutas estáticas
    static_dir: str = Field("backend/static", env="STATIC_DIR")
    template_dir: str = Field("backend/templates", env="TEMPLATE_DIR")
    favicon_path: str = Field("backend/static/favicon.ico", env="FAVICON_PATH")

    # ☁️ S3 (opcional)
    aws_access_key_id: Optional[str] = Field(None, env="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(None, env="AWS_SECRET_ACCESS_KEY")
    aws_s3_bucket_name: Optional[str] = Field(None, env="AWS_S3_BUCKET_NAME")
    aws_s3_region: str = Field("us-east-1", env="AWS_S3_REGION")
    aws_s3_endpoint_url: str = Field("https://s3.amazonaws.com", env="AWS_S3_ENDPOINT_URL")

    # 🌐 URL base de backend
    base_url: str = Field("http://localhost:8000", env="BASE_URL")

    # 🧩 Embebido (CSP + redirects)
    frame_ancestors: List[str] = Field(default_factory=lambda: ["'self'"], env="FRAME_ANCESTORS")
    embed_enabled: bool = Field(True, env="EMBED_ENABLED")
    frontend_site_url: str = Field("http://localhost:5173", env="FRONTEND_SITE_URL")

    # 🌱 Entorno
    app_env: Literal["dev", "test", "prod"] = Field("dev", env="APP_ENV")

    # 🚦 Rate limiting
    rate_limit_enabled: bool = Field(True, env="RATE_LIMIT_ENABLED")
    rate_limit_backend: Literal["memory", "redis"] = Field("memory", env="RATE_LIMIT_BACKEND")
    rate_limit_window_sec: int = Field(60, env="RATE_LIMIT_WINDOW_SEC")
    rate_limit_max_requests: int = Field(60, env="RATE_LIMIT_MAX_REQUESTS")
    redis_url: Optional[str] = Field(None, env="REDIS_URL")

    # ───── Normalizadores CSV/JSON ─────
    @validator("allowed_origins", "frame_ancestors", pre=True)
    def _csv_or_json(cls, v):
        if v is None:
            return v
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            s = v.strip()
            if not s:
                return []
            if s.startswith("["):
                try:
                    parsed = json.loads(s)
                    if isinstance(parsed, list):
                        return [str(x).strip() for x in parsed if str(x).strip()]
                except Exception:
                    pass
            return [x.strip() for x in s.split(",") if x.strip()]
        return v

    @property
    def s3_enabled(self) -> bool:
        return bool(self.aws_s3_bucket_name and self.aws_access_key_id and self.aws_secret_access_key)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()