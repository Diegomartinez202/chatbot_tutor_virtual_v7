# syntax=docker/dockerfile:1.6

# Imagen base completa (incluye spacy/tf/etc. para entrenar si hiciera falta)
FROM rasa/rasa:3.6.20-full

# Paquetes de sistema necesarios para entrypoint (envsubst) y healthcheck
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    gettext-base curl \
 && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo estándar
WORKDIR /app

# Copiamos el proyecto Rasa (ajusta si tu estructura difiere)
# Asumo que todo tu proyecto está bajo la carpeta "rasa/" del repo.
COPY rasa /app

# Copiamos explícitamente la plantilla y el entrypoint (por si cambian rutas)
# (Se sobreescriben con los archivos que te dejo abajo)
COPY rasa/endpoints.tpl.yml /app/endpoints.tpl.yml
COPY rasa/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Usuario no root propio de la imagen
USER 1000

EXPOSE 5005

# Healthcheck: /status requiere --enable-api en el run
HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
  CMD curl -fsS http://localhost:5005/status || exit 1

ENTRYPOINT ["/entrypoint.sh"]
