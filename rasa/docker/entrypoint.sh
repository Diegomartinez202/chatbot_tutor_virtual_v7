#!/usr/bin/env sh
set -euo pipefail

echo "🚀 Rasa entrypoint"

# 1) ACTION_SERVER_URL → endpoints.yml
if [ -z "${ACTION_SERVER_URL:-}" ]; then
  echo "⚠️  ACTION_SERVER_URL no definido; usando default: http://action-server:5055/webhook"
  ACTION_SERVER_URL="http://action-server:5055/webhook"
fi

if [ -f "/app/endpoints.tpl.yml" ]; then
  echo "🧩 Generando /app/endpoints.yml desde plantilla"
  if command -v envsubst >/dev/null 2>&1; then
    envsubst < /app/endpoints.tpl.yml > /app/endpoints.yml
  else
    # Fallback simple si no está envsubst
    sed "s|\${ACTION_SERVER_URL}|${ACTION_SERVER_URL}|g" /app/endpoints.tpl.yml > /app/endpoints.yml
  fi
fi

echo "🔎 endpoints.yml resultante:"
cat /app/endpoints.yml || true

# 2) Auto-train opcional
NEED_TRAIN="false"
if [ "${RASA_AUTOTRAIN:-false}" = "true" ]; then
  NEED_TRAIN="true"
fi

if [ ! -d "/app/models" ] || [ -z "$(ls -A /app/models 2>/dev/null || true)" ]; then
  echo "ℹ️  No se encontró modelo en /app/models"
  NEED_TRAIN="true"
fi

if [ "$NEED_TRAIN" = "true" ]; then
  echo "🏋️  Entrenando modelo (rasa train)..."
  rasa train || {
    echo "❌ Entrenamiento falló. Continuando sin detener el contenedor (revisar datos)."
  }
fi

# 3) Ejecutar servidor
#    --enable-api expone /webhooks/rest/webhook y /status
#    CORS abierto por ahora; ajusta a orígenes concretos si lo deseas.
echo "🌐 Iniciando Rasa server..."
exec rasa run --enable-api --cors "*" --port 5005