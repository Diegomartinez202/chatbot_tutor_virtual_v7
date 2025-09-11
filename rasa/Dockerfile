# syntax=docker/dockerfile:1.6

# Imagen base completa (incluye TF/spaCy para entrenar si hace falta)
FROM rasa/rasa:3.6.20-full

# Paquetes para plantillas y healthcheck
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    gettext-base curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiamos TODO el proyecto Rasa (esta carpeta es /rasa del repo)
COPY . /app

# (Opcional) instalar extras si existe requirements.txt
RUN if [ -f /app/requirements.txt ]; then \
      pip install --no-cache-dir -r /app/requirements.txt ; \
    fi

# Entrypoint
RUN chmod +x /app/docker/entrypoint.sh

# Volvemos a usuario no-root que trae la imagen
USER 1000

EXPOSE 5005

# /status requiere --enable-api
HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
  CMD curl -fsS http://localhost:5005/status || exit 1

ENTRYPOINT ["/app/docker/entrypoint.sh"]