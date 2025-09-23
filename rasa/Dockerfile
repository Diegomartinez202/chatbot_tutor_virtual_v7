# syntax=docker/dockerfile:1.6
FROM rasa/rasa:3.6.20-full

USER root

# Paquetes mínimos + curl para healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    gettext-base curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia tu proyecto Rasa completo
COPY . /app

# Copia entrypoint y plantillas de endpoints
COPY docker/entrypoint.sh /entrypoint.sh
COPY endpoints.tpl.yml /app/endpoints.tpl.yml
COPY endpoints.mongo.tpl.yml /app/endpoints.mongo.tpl.yml

# Normaliza EOL (CRLF -> LF), elimina BOM y fija permisos/propietario
# - sin heredoc, usando sed en modo seguro
RUN sed -i 's/\r$//' /entrypoint.sh \
 && sed -i '1s/^\xEF\xBB\xBF//' /entrypoint.sh \
 && find /app -type f -name "*.sh" -exec sed -i 's/\r$//' {} \; || true \
 && chown -R 1000:1000 /app /entrypoint.sh \
 && chmod +x /entrypoint.sh

# Usuario sin privilegios (coherente con la imagen base)
USER 1000

# Entrypoint único y limpio
ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 5005

HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
  CMD curl -fsS http://127.0.0.1:5005/status || exit 1