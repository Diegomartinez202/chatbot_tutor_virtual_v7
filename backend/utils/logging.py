# backend/utils/logging.py
import logging
import os
from logging.handlers import RotatingFileHandler
from backend.config.settings import settings
from backend.middleware.request_id import get_request_id

class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        # Inserta el X-Request-ID del ContextVar
        record.request_id = get_request_id()
        return True

def setup_logging():
    """
    Configura el root logger una sola vez:
    - Nivel según DEBUG
    - Handler a consola (stdout)
    - Handler a archivo rotativo en LOG_DIR/system.log
    - Ambos con RequestIdFilter para rid=...
    - Propaga logs de uvicorn/httpx hacia root con el mismo formato
    """
    level = logging.DEBUG if getattr(settings, "debug", False) else logging.INFO
    fmt = "%(asctime)s | %(levelname)s | %(name)s | rid=%(request_id)s | %(message)s"

    # Asegurar carpeta para logs
    log_dir = getattr(settings, "LOG_DIR", "./logs")
    os.makedirs(log_dir, exist_ok=True)
    log_path = os.path.join(log_dir, "system.log")

    # Formatter + filtro
    formatter = logging.Formatter(fmt)
    rid_filter = RequestIdFilter()

    # Handlers
    stream_h = logging.StreamHandler()
    stream_h.setFormatter(formatter)
    stream_h.addFilter(rid_filter)

    file_h = RotatingFileHandler(
        log_path, maxBytes=10_000_000, backupCount=5, encoding="utf-8"
    )
    file_h.setFormatter(formatter)
    file_h.addFilter(rid_filter)

    # Root logger
    root = logging.getLogger()
    # Limpia handlers previos para evitar duplicados si se re‑invoca
    root.handlers.clear()
    root.setLevel(level)
    root.addHandler(stream_h)
    root.addHandler(file_h)

    # Alinear loggers de uvicorn y librerías comunes
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access", "httpx"):
        lg = logging.getLogger(name)
        lg.handlers.clear()       # usa los del root
        lg.propagate = True
        lg.setLevel(level)

def get_logger(name: str) -> logging.Logger:
    """
    Obtén un logger por módulo. No añade handlers (hereda del root).
    """
    return logging.getLogger(name)