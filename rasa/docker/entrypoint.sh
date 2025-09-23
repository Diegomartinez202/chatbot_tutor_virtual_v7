#!/bin/sh
set -eu

echo "Rasa entrypoint"

# =========================
# Config por variables ENV
# =========================
RASA_PORT="${RASA_PORT:-5005}"
RASA_HOST="${RASA_HOST:-0.0.0.0}"
RASA_CORS="${RASA_CORS:-*}"

# URL del Action Server
ACTION_SERVER_URL="${ACTION_SERVER_URL:-http://action-server:5055/webhook}"

# Plantilla de endpoints: default | mongo
ENDPOINTS_TEMPLATE="${ENDPOINTS_TEMPLATE:-default}"

# Si usas tracker en Mongo, predefine vars
if [ "$ENDPOINTS_TEMPLATE" = "mongo" ]; then
  TRACKER_MONGO_URL="${TRACKER_MONGO_URL:-mongodb://mongo:27017}"
  TRACKER_MONGO_DB="${TRACKER_MONGO_DB:-rasa}"
  TRACKER_MONGO_COLLECTION="${TRACKER_MONGO_COLLECTION:-conversations}"
fi

# =========================
# Render de endpoints.yml
# =========================
TPL="/app/endpoints.tpl.yml"
[ "$ENDPOINTS_TEMPLATE" = "mongo" ] && TPL="/app/endpoints.mongo.tpl.yml"

if [ -f "$TPL" ]; then
  if command -v envsubst >/dev/null 2>&1; then
    envsubst < "$TPL" > /app/endpoints.yml
  else
    cp "$TPL" /app/endpoints.yml
    sed -i "s|\${ACTION_SERVER_URL}|$ACTION_SERVER_URL|g" /app/endpoints.yml || true
    if [ "$ENDPOINTS_TEMPLATE" = "mongo" ]; then
      sed -i \
        -e "s|\${TRACKER_MONGO_URL}|$TRACKER_MONGO_URL|g" \
        -e "s|\${TRACKER_MONGO_DB}|$TRACKER_MONGO_DB|g" \
        -e "s|\${TRACKER_MONGO_COLLECTION}|$TRACKER_MONGO_COLLECTION|g" \
        /app/endpoints.yml || true
    fi
  fi
fi

# =========================
# Entrenamiento opcional
# =========================
mkdir -p /app/models

NEED_TRAIN=0
[ "${RASA_AUTOTRAIN:-false}" = "true" ] && NEED_TRAIN=1
[ -z "$(ls -1 /app/models/*.tar.gz 2>/dev/null || true)" ] && NEED_TRAIN=1

if [ "$NEED_TRAIN" -eq 1 ]; then
  echo "Training model (rasa train)..."
  set +e
  rasa train \
    --domain /app/domain.yml \
    --data /app/data \
    --config /app/config.yml \
    --out /app/models \
    ${RASA_TRAIN_FLAGS:-}
  TRAIN_RC=$?
  set -e
  if [ $TRAIN_RC -ne 0 ]; then
    echo "Train failed (rc=$TRAIN_RC)."
    if [ "${RASA_FAIL_ON_TRAIN_ERROR:-0}" = "1" ]; then
      exit $TRAIN_RC
    else
      echo "Continuing without stopping the container."
    fi
  fi
else
  echo "Model found in /app/models. Skipping training."
fi

# =========================
# Run server
# =========================
echo "Starting Rasa server on ${RASA_HOST}:${RASA_PORT}"
exec rasa run \
  --enable-api \
  -i "${RASA_HOST}" \
  -p "${RASA_PORT}" \
  --endpoints /app/endpoints.yml \
  --model /app/models \
  --cors "${RASA_CORS}"