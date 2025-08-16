#!/usr/bin/env sh
set -e

if [ -z "${ACTION_SERVER_URL}" ]; then
  echo "⚠️  ACTION_SERVER_URL no definido. Usando default local."
  export ACTION_SERVER_URL="http://action_server:5055/webhook"
fi

if [ -f "/app/endpoints.tpl.yml" ]; then
  echo "🧩 Generando /app/endpoints.yml desde plantilla"
  # envsubst viene en la base (busybox); si no, instala gettext
  envsubst < /app/endpoints.tpl.yml > /app/endpoints.yml
fi

echo "🔎 endpoints.yml resultante:"
cat /app/endpoints.yml || true

# Arranque de Rasa Core
exec rasa run --enable-api --cors "*" --port 5005