import logging
import os

os.makedirs("logs", exist_ok=True)

logger = logging.getLogger("chatbot_logger")
logger.setLevel(logging.INFO)
handler = logging.FileHandler("logs/system.log")
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

os.makedirs("backend/logs", exist_ok=True)

logger = logging.getLogger("chatbot_logger")
logger.setLevel(logging.INFO)
handler = logging.FileHandler("backend/logs/system.log")
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
