# app/routers/admin_failed.py
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from datetime import date
import csv, io

router = APIRouter(prefix="/admin/intentos-fallidos", tags=["admin-intentos-fallidos"])

@router.get("/top")
def top_failed(desde: date | None = None, hasta: date | None = None, limit: int = 10):
    data = [{"intent":"fallback","count":42},{"intent":"soporte_contacto","count":18}]
    return data[:limit]

@router.get("/logs")
def failed_logs(desde: date | None = None, hasta: date | None = None,
                intent: str | None = None, page: int = 1, page_size: int = 20):
    items = [{
        "_id":"1","timestamp":"2025-08-08T12:00:00Z","email":"a@b.c",
        "message":"hola","intent": intent or "fallback"
    }]*5
    return {"items": items, "total": 5, "page": page, "page_size": page_size}

@router.get("/export")
def export_failed(desde: date | None = None, hasta: date | None = None, intent: str | None = None):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["timestamp","email","message","intent"])
    writer.writerow(["2025-08-08T12:00:00Z","a@b.c","hola", intent or "fallback"])
    output.seek(0)
    filename = f"intentos_fallidos_{(desde or '')}_{(hasta or '')}.csv".replace("None","").replace("__","_")
    headers = {"Content-Disposition": f'attachment; filename="{filename or "intentos_fallidos.csv"}"'}
    return StreamingResponse(iter([output.getvalue().encode("utf-8-sig")]),
                             media_type="text/csv; charset=utf-8", headers=headers)