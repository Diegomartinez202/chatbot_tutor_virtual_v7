# backend/logger.py

import logging
import os
from backend.config.settings import settings  # ✅ Usar el import correcto

# Crear carpeta de logs si no existe
os.makedirs(settings.LOG_DIR, exist_ok=True)

# Configurar logger
logger = logging.getLogger("chatbot_logger")
logger.setLevel(logging.INFO)

# Archivo de log principal
log_path = os.path.join(settings.LOG_DIR, "system.log")
handler = logging.FileHandler(log_path)
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)