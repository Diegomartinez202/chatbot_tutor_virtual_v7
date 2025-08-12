#!/bin/bash

BACKEND_URL=${1:-"https://tu-backend.com"}

echo "🔍 Probando /chat-embed.html..."
curl -I "$BACKEND_URL/chat-embed.html" | grep -iE "HTTP|location|content-security-policy"

echo -e "\n🔍 Probando Content-Security-Policy..."
curl -s -D- "$BACKEND_URL/chat-embed.html" -o /dev/null | grep -i content-security-policy

echo -e "\n🔍 Probando redirect de /embed..."
curl -I "$BACKEND_URL/embed" | grep -i location

echo -e "\n🔍 Probando API health..."
curl -s "$BACKEND_URL/chat/health" | jq

echo -e "\n✅ Verificación completada.