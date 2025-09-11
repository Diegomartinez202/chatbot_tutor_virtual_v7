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

# Plantilla de endpoints: default | mongo
export ENDPOINTS_TEMPLATE="${ENDPOINTS_TEMPLATE:-default}"

# Si usas tracker en Mongo, predefine vars
if [ "${ENDPOINTS_TEMPLATE}" = "mongo" ]; then
  export TRACKER_MONGO_URL="${TRACKER_MONGO_URL:-mongodb://mongo:27017}"
  export TRACKER_MONGO_DB="${TRACKER_MONGO_DB:-rasa}"
  export TRACKER_MONGO_COLLECTION="${TRACKER_MONGO_COLLECTION:-conversations}"
fi

# =========================
# Render de endpoints.yml
# =========================
TPL="/app/endpoints.tpl.yml"
if [ "${ENDPOINTS_TEMPLATE}" = "mongo" ]; then
  TPL="/app/endpoints.mongo.tpl.yml"
fi

if [ -f "${TPL}" ]; then
  echo "🧩 Renderizando /app/endpoints.yml desde ${TPL}"
  if command -v envsubst >/dev/null 2>&1; then
    envsubst < "${TPL}" > /app/endpoints.yml
  else
    # Fallback mínimo sin envsubst
    cp "${TPL}" /app/endpoints.yml
    sed -i "s|\${ACTION_SERVER_URL}|${ACTION_SERVER_URL}|g" /app/endpoints.yml || true
    if [ "${ENDPOINTS_TEMPLATE}" = "mongo" ]; then
      sed -i \
        -e "s|\${TRACKER_MONGO_URL}|${TRACKER_MONGO_URL}|g" \
        -e "s|\${TRACKER_MONGO_DB}|${TRACKER_MONGO_DB}|g" \
        -e "s|\${TRACKER_MONGO_COLLECTION}|${TRACKER_MONGO_COLLECTION}|g" \
        /app/endpoints.yml || true
    fi
  fi
else
  echo "⚠️  No encontré plantilla ${TPL}. Usaré /app/endpoints.yml existente si lo hay."
fi

echo "🔎 endpoints.yml resultante (si existe):"
( cat /app/endpoints.yml || true ) | sed -e 's/^/  /'

# =========================
# Entrenamiento opcional
# =========================
mkdir -p /app/models

NEED_TRAIN=0
# Compatibilidad con dos flags:
#  - RASA_AUTOTRAIN=true   → entrena siempre
#  - RASA_FORCE_TRAIN=1    → entrena siempre
if [ "${RASA_AUTOTRAIN:-false}" = "true" ] || [ "${RASA_FORCE_TRAIN:-0}" = "1" ]; then
  NEED_TRAIN=1
elif ! ls /app/models/*.tar.gz >/dev/null 2>&1; then
  NEED_TRAIN=1
fi

if [ "${NEED_TRAIN}" -eq 1 ]; then
  echo "🏋️  Entrenando modelo (rasa train)..."
  set +e
  rasa train \
    --domain /app/domain.yml \
    --data /app/data \
    --config /app/config.yml \
    --out /app/models \
    ${RASA_TRAIN_FLAGS:-}
  TRAIN_RC=$?
  set -e
  if [ ${TRAIN_RC} -ne 0 ]; then
    echo "❌ Entrenamiento falló (rc=${TRAIN_RC})."
    if [ "${RASA_FAIL_ON_TRAIN_ERROR:-0}" = "1" ]; then
      exit ${TRAIN_RC}
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