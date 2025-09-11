#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Rasa entrypoint"

# =========================
# Config por variables ENV
# =========================
export RASA_PORT="${RASA_PORT:-5005}"
export RASA_HOST="${RASA_HOST:-0.0.0.0}"
export RASA_CORS="${RASA_CORS:-*}"

# URL del Action Server
export ACTION_SERVER_URL="${ACTION_SERVER_URL:-http://action-server:5055/webhook}"

# Selección de plantilla de endpoints:
#   - ENDPOINTS_TEMPLATE=default|mongo
#   - Si no se define, usa 'default'
ENDPOINTS_TEMPLATE="${ENDPOINTS_TEMPLATE:-default}"

# =========================
# Render de endpoints.yml
# =========================
TPL="/app/endpoints.tpl.yml"
if [ "$ENDPOINTS_TEMPLATE" = "mongo" ]; then
  TPL="/app/endpoints.mongo.tpl.yml"
fi

if [ -f "${TPL}" ]; then
  echo "🧩 Renderizando /app/endpoints.yml desde ${TPL}"
  if command -v envsubst >/dev/null 2>&1; then
    envsubst < "${TPL}" > /app/endpoints.yml
  else
    # Fallback mínimo para ACTION_SERVER_URL (si no hay envsubst)
    sed "s|\${ACTION_SERVER_URL}|${ACTION_SERVER_URL}|g" "${TPL}" > /app/endpoints.yml
  fi
else
  echo "⚠️  No encontré plantilla ${TPL}. Usaré endpoints.yml existente si lo hay."
fi

echo "🔎 endpoints.yml resultante (si existe):"
( cat /app/endpoints.yml || true ) | sed -e 's/^/  /'

# =========================
# Entrenamiento opcional
# =========================
mkdir -p /app/models

NEED_TRAIN=0
# Dos flags compatibles:
#  - RASA_AUTOTRAIN=true   → entrena siempre
#  - RASA_FORCE_TRAIN=1    → entrena siempre
if [ "${RASA_AUTOTRAIN:-false}" = "true" ] || [ "${RASA_FORCE_TRAIN:-0}" = "1" ]; then
  NEED_TRAIN=1
elif ! ls /app/models/*.tar.gz >/dev/null 2>&1; then
  # No hay modelo empaquetado → entrenar
  NEED_TRAIN=1
fi

if [ "$NEED_TRAIN" = "1" ]; then
  echo "🏋️  Entrenando modelo (rasa train)..."
  # Puedes pasar flags adicionales con RASA_TRAIN_FLAGS (p. ej., "--debug")
  if ! rasa train \
        --domain /app/domain.yml \
        --data /app/data \
        --config /app/config.yml \
        --out /app/models \
        ${RASA_TRAIN_FLAGS:-}; then
    echo "❌ Entrenamiento falló."
    if [ "${RASA_FAIL_ON_TRAIN_ERROR:-0}" = "1" ]; then
      exit 1
    else
      echo "➡️  Continuo sin detener el contenedor (revisa tus datos/config)."
    fi
  fi
else
  echo "✅ Modelo encontrado en /app/models. Omitiendo entrenamiento."
fi

# =========================
# Run server
# =========================
echo "🌐 Iniciando Rasa server en ${RASA_HOST}:${RASA_PORT} (CORS=${RASA_CORS})"
exec rasa run \
  --enable-api \
  --cors "${RASA_CORS}" \
  --host "${RASA_HOST}" \
  --port "${RASA_PORT}" \
  --endpoints /app/endpoints.yml \
  --model /app/models