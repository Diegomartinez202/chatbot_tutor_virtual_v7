#!/bin/bash

echo "🤖 Ejecutando pruebas de Rasa..."

# Ir a raíz del proyecto
cd "$(dirname "$0")/.."

# Entrenar Rasa (opcional si ya entrenaste)
cd rasa
rasa train

# Simular un mensaje de prueba al bot si está corriendo
curl -X POST http://localhost:5005/webhooks/rest/webhook \
     -H "Content-Type: application/json" \
     -d '{
           "sender": "test_user",
           "message": "Hola"
         }'

cd ..
