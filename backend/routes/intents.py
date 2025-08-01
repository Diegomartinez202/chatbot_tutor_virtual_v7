from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List, Optional
import csv, io, json

from backend.schemas.intent_schema import IntentOut
from backend.services.intent_manager import (
    intent_ya_existe,
    cargar_intents,
    eliminar_intent,
    guardar_intent_csv
)
from backend.services.train_service import entrenar_chatbot as entrenar_rasa
from backend.dependencies.auth import get_current_user_with_role
from backend.db.mongodb import get_intents_collection