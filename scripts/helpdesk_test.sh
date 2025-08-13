#!/usr/bin/env bash
set -euo pipefail

# helpdesk_test.sh — prueba rápida de tu webhook de Helpdesk
# Uso:
#   HELPDESK_WEBHOOK=http://localhost:8000/api/helpdesk/tickets ./scripts/helpdesk_test.sh
#   HELPDESK_WEBHOOK=... HELPDESK_TOKEN=... ./scripts/helpdesk_test.sh
# Opcionales:
#   NAME="Juan Pérez" EMAIL="juan@example.com" SUBJECT="Prueba" MESSAGE="Hola" ./scripts/helpdesk_test.sh

: "${HELPDESK_WEBHOOK:?❌ Debes definir HELPDESK_WEBHOOK, ej: HELPDESK_WEBHOOK=http://localhost:8000/api/helpdesk/tickets}"
HELPDESK_TOKEN="${HELPDESK_TOKEN:-}"

NAME="${NAME:-Test desde script}"
EMAIL="${EMAIL:-demo@example.com}"
SUBJECT="${SUBJECT:-Prueba rápida}"
MESSAGE="${MESSAGE:-Esto es un ticket de prueba enviado desde scripts/helpdesk_test.sh}"
CONV_ID="${CONVERSATION_ID:-script-test-$(date +%s)}"

echo "🔎 Enviando ticket de prueba a: ${HELPDESK_WEBHOOK}"
echo "👤 ${NAME} | 📧 ${EMAIL} | 🧵 ${CONV_ID}"

AUTH_HEADER=()
if [[ -n "${HELPDESK_TOKEN}" ]]; then
  AUTH_HEADER=(-H "Authorization: Bearer ${HELPDESK_TOKEN}")
fi

RESP=$(curl -sS -X POST "${HELPDESK_WEBHOOK}" \
  -H "Content-Type: application/json" \
  "${AUTH_HEADER[@]}" \
  -d @- <<EOF
{
  "name": "${NAME}",
  "email": "${EMAIL}",
  "subject": "${SUBJECT}",
  "message": "${MESSAGE}",
  "conversation_id": "${CONV_ID}"
}
EOF
)

echo "✅ Respuesta:"
echo "${RESP}"