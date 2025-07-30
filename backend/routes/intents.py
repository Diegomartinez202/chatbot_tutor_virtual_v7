# backend/routes/intents.py

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List, Optional
import csv, io, json
from backend.schemas.intent_schema import IntentOut
from backend.services.intent_manager import (
    intent_ya_existe,
    cargar_intents,
    entrenar_rasa,
    eliminar_intent,
    guardar_intent_csv
)
from backend.dependencies.auth import get_current_user_with_role
from backend.db.mongodb import get_intents_collection

router = APIRouter(prefix="/admin/intents", tags=["Intents"])

class IntentData(UploadFile):
    intent: str
    examples: list[str] = []
    responses: list[str] = []

@router.post("")
def cargar_y_entrenar(data: IntentData, user=Depends(get_current_user_with_role(["admin"]))):
    if intent_ya_existe(data.intent):
        raise HTTPException(status_code=400, detail=f"El intent '{data.intent}' ya existe")
    cargar_intents(data.dict())
    entrenar_rasa()
    return {"message": "✅ Intent agregado y bot reentrenado"}

@router.delete("/{intent_name}")
def eliminar(intent_name: str, user=Depends(get_current_user_with_role(["admin"]))):
    if not intent_ya_existe(intent_name):
        raise HTTPException(status_code=404, detail="El intent no existe")
    eliminar_intent(intent_name)
    entrenar_rasa()
    return {"message": f"🗑️ Intent '{intent_name}' eliminado y bot reentrenado"}

@router.get("", response_model=List[IntentOut])
async def listar(intent: Optional[str] = Query(None), example: Optional[str] = Query(None),
                 response: Optional[str] = Query(None),
                 user=Depends(get_current_user_with_role(["admin", "soporte"]))):
    filters = {}
    if intent:
        filters["intent"] = {"$regex": intent, "$options": "i"}
    if example:
        filters["examples"] = {"$elemMatch": {"$regex": example, "$options": "i"}}
    if response:
        filters["responses"] = {"$elemMatch": {"$regex": response, "$options": "i"}}
    cursor = get_intents_collection().find(filters)
    results = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        results.append(IntentOut(**doc))
    return results

@router.post("/upload")
async def upload(file: UploadFile = File(...), user=Depends(get_current_user_with_role(["admin"]))):
    content = await file.read()
    if file.filename.endswith(".csv"):
        reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
        for row in reader:
            guardar_intent_csv({
                "intent": row["intent"],
                "examples": row["examples"].split("\\n"),
                "responses": row["responses"].split("\\n")
            })
    elif file.filename.endswith(".json"):
        data = json.loads(content.decode("utf-8"))
        if isinstance(data, list):
            for item in data:
                guardar_intent_csv(item)
        else:
            guardar_intent_csv(data)
    else:
        raise HTTPException(status_code=400, detail="Formato inválido (.csv o .json)")
    entrenar_rasa()
    return {"message": "✅ Intents cargados y bot reentrenado"}

@router.get("/export", response_class=StreamingResponse)
async def exportar(user=Depends(get_current_user_with_role(["admin"]))):
    cursor = get_intents_collection().find()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["intent", "examples", "responses"])
    async for doc in cursor:
        writer.writerow([
            doc.get("intent", ""),
            " | ".join(doc.get("examples", [])),
            " | ".join(doc.get("responses", []))
        ])
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={
        "Content-Disposition": "attachment; filename=intents.csv"
    })