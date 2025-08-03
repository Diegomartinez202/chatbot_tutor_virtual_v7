#!/bin/bash

echo "🔄 Esperando que MongoDB y Rasa estén disponibles..."
sleep 10  # Puedes ajustar este tiempo según lo que tarden en iniciar

echo "🚀 Iniciando el servidor FastAPI..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000