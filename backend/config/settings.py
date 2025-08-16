# backend/config/settings.py
from pydantic import BaseSettings, Field, EmailStr, validator
from pydantic_settings import SettingsConfigDict
from typing import List, Optional, Literal
import json

class Settings(BaseSettings):
    """
    Configuración centralizada del proyecto.
    Incluye soporte para JWT (HS y RS), MongoDB, Rasa, SMTP, S3,
    CSP/embebido, rate limiting, helpdesk, etc.
    """
    # === Configuración general de pydantic-settings ===
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    # 📦 MongoDB
    mongo_uri: str = Field(..., alias="MONGO_URI")
    mongo_db_name: str = Field(..., alias="MONGO_DB_NAME")

    # 🔐 JWT
    secret_key: Optional[str] = Field(default=None, alias="SECRET_KEY")  # HS*
    jwt_public_key: Optional[str] = Field(default=None, alias="JWT_PUBLIC_KEY")  # RS*
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=60, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    # 🤖 Rasa Bot
    rasa_url: str = Field(..., alias="RASA_URL")
    rasa_data_path: str = Field(default="rasa/data/nlu.yml", alias="RASA_DATA_PATH")
    rasa_domain_path: str = Field(default="rasa/domain.yml", alias="RASA_DOMAIN_PATH")
    rasa_model_path: str = Field(default="rasa/models", alias="RASA_MODEL_PATH")
    rasa_train_command: str = Field(default="rasa train", alias="RASA_TRAIN_COMMAND")

    # 📧 SMTP
    smtp_server: str = Field(..., alias="SMTP_SERVER")
    smtp_port: int = Field(default=587, alias="SMTP_PORT")
    smtp_user: str = Field(..., alias="SMTP_USER")
    smtp_pass: str = Field(..., alias="SMTP_PASS")
    email_from: EmailStr = Field(..., alias="EMAIL_FROM")
    email_to: EmailStr = Field(..., alias="EMAIL_TO")

    # 👤 Admin
    admin_email: EmailStr = Field(..., alias="ADMIN_EMAIL")

    # 🧾 Logs y entorno
    debug: bool = Field(default=False, alias="DEBUG")
    log_dir: str = Field(default="logs", alias="LOG_DIR")
    allowed_origins: List[str] = Field(
        default_factory=lambda: ["http://localhost:5173"], alias="ALLOWED_ORIGINS"
    )

    # 📁 Rutas estáticas
    static_dir: str = Field(default="backend/static", alias="STATIC_DIR")
    template_dir: str = Field(default="backend/templates", alias="TEMPLATE_DIR")
    favicon_path: str = Field(default="backend/static/favicon.ico", alias="FAVICON_PATH")

    # ☁️ S3 (opcional)
    aws_access_key_id: Optional[str] = Field(None, alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(None, alias="AWS_SECRET_ACCESS_KEY")
    aws_s3_bucket_name: Optional[str] = Field(None, alias="AWS_S3_BUCKET_NAME")
    aws_s3_region: str = Field(default="us-east-1", alias="AWS_S3_REGION")
    aws_s3_endpoint_url: str = Field(default="https://s3.amazonaws.com", alias="AWS_S3_ENDPOINT_URL")

    # 🌐 URL base de backend
    base_url: str = Field(default="http://localhost:8000", alias="BASE_URL")

    # 🧩 Embebido (CSP + redirects)
    frame_ancestors: List[str] = Field(default_factory=lambda: ["'self'"], alias="FRAME_ANCESTORS")
    embed_enabled: bool = Field(default=True, alias="EMBED_ENABLED")
    frontend_site_url: str = Field(default="http://localhost:5173", alias="FRONTEND_SITE_URL")

    # 🌱 Entorno
    app_env: Literal["dev", "test", "prod"] = Field(default="dev", alias="APP_ENV")

    # 🚦 Rate limiting
    rate_limit_enabled: bool = Field(default=True, alias="RATE_LIMIT_ENABLED")
    rate_limit_backend: Literal["memory", "redis"] = Field(default="memory", alias="RATE_LIMIT_BACKEND")
    rate_limit_window_sec: int = Field(default=60, alias="RATE_LIMIT_WINDOW_SEC")
    rate_limit_max_requests: int = Field(default=60, alias="RATE_LIMIT_MAX_REQUESTS")
    redis_url: Optional[str] = Field(None, alias="REDIS_URL")

    # 📞 Helpdesk / Escalada a humano
    helpdesk_kind: Literal["webhook", "zendesk", "freshdesk", "jira", "zoho"] = Field(
        default="webhook", alias="HELPDESK_KIND"
    )
    helpdesk_webhook: Optional[str] = Field(None, alias="HELPDESK_WEBHOOK")
    helpdesk_token: Optional[str] = Field(None, alias="HELPDESK_TOKEN")

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
        return bool(
            self.aws_s3_bucket_name and self.aws_access_key_id and self.aws_secret_access_key
        )

    # ⚙️ [ADDED] Compat: algunos módulos esperan 'rasa_rest_base'
    @property
    def rasa_rest_base(self) -> str:
        """
        Compatibilidad con módulos que usen settings.rasa_rest_base.
        En este proyecto, es equivalente a RASA_URL (REST API de Rasa).
        """
        return self.rasa_url

    # ⚙️ [ADDED] Por si algún middleware requiere lista garantizada
    @property
    def allowed_origins_list(self) -> List[str]:
        return list(self.allowed_origins or [])

# Instancia global de settings
settings = Settings()