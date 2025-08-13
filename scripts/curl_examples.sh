#!/usr/bin/env bash
# scripts/curl_examples.sh
# Uso:
#   MODE=rasa ./scripts/curl_examples.sh A         # pega directo a Rasa (REST)
#   MODE=backend ./scripts/curl_examples.sh A      # pega al proxy FastAPI /api/chat
#   MODE=rasa ./scripts/curl_examples.sh B

set -euo pipefail

MODE="${MODE:-backend}"        # backend | rasa
SENDER_A="tester-001"
SENDER_B="tester-002"

# Endpoints
BACKEND_CHAT="${BACKEND_CHAT:-http://localhost:8000/api/chat}"          # FastAPI proxy
RASA_REST="${RASA_REST:-http://localhost:5005/webhooks/rest/webhook}"   # Rasa REST directo

# Auth opcional (si tu backend protege /api/chat)
TOKEN="${TOKEN:-}"   # export TOKEN="Bearer eyJ..."  (sin comillas si prefieres)

curl_json () {
  local url="$1"; shift
  local data="$1"; shift
  if [[ -n "${TOKEN}" ]]; then
    curl -sS -X POST "$url" -H "Content-Type: application/json" -H "Authorization: ${TOKEN}" -d "$data"
  else
    curl -sS -X POST "$url" -H "Content-Type: application/json" -d "$data"
  fi
}

send () {
  local sender="$1"; shift
  local message="$1"; shift
  local payload

  if [[ "$MODE" == "backend" ]]; then
    payload=$(jq -cn --arg s "$sender" --arg m "$message" \
      '{sender:$s, message:$m, metadata:{source:"curl"}}')
    curl_json "$BACKEND_CHAT" "$payload"
  else
    payload=$(jq -cn --arg s "$sender" --arg m "$message" \
      '{sender:$s, message:$m}')
    curl_json "$RASA_REST" "$payload"
  fi
}

flow_A () {
  echo "== Flujo A: soporte_form =="
  send "$SENDER_A" "necesito soporte técnico"; echo
  send "$SENDER_A" "Mi nombre es Daniel Martinez"; echo
  send "$SENDER_A" "daniel.martinez010201@gmail.com"; echo
  send "$SENDER_A" "Pantalla blanca al abrir el curso de IA."; echo
}

flow_B () {
  echo "== Flujo B: recovery_form =="
  send "$SENDER_B" "quiero ingresar a zajuna"; echo
  send "$SENDER_B" "recuperar contraseña"; echo
  send "$SENDER_B" "usuario+test@domain.io"; echo
}

case "${1:-A}" in
  A) flow_A ;;
  B) flow_B ;;
  *) echo "Uso: $0 [A|B]   (A=soporte_form, B=recovery_form)"; exit 1 ;;
esac
