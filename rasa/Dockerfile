# syntax=docker/dockerfile:1.6
FROM rasa/rasa:3.6.20-full

USER root
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
RUN chmod +x /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

USER 1000
EXPOSE 5005

HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
  CMD curl -fsS http://localhost:5005/status || exit 1

ENTRYPOINT ["/entrypoint.sh"]
