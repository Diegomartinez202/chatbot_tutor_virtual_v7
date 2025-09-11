# syntax=docker/dockerfile:1.6

############################
# BASE (runtime base)
############################
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONPATH=/app

WORKDIR /app

# Utils mínimos en runtime (curl p/healthcheck) y poppler (pdf2image)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl poppler-utils \
 && rm -rf /var/lib/apt/lists/*

############################
# DEPS (instala requirements con cache estable)
############################
FROM python:3.11-slim AS deps

# Paquetes de compilación (bcrypt, cffi, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libffi-dev \
 && rm -rf /var/lib/apt/lists/*

# Instala deps en prefijo fijo para copiar luego (imagen final más chica)
COPY requirements.txt /tmp/requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --prefix=/install -r /tmp/requirements.txt

############################
# PROD (no-root, salud, workers configurables)
############################
FROM base AS prod

# Copia librerías ya instaladas
COPY --from=deps /install /usr/local

# Copia tu código (contexto = ./backend)
COPY . /app/backend

# Directorios usados por tu app + usuario no-root
RUN mkdir -p /app/logs /app/backend/static && \
    adduser --disabled-password --gecos "" --uid 10001 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Healthcheck contra tu endpoint existente
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/chat/health || exit 1

# Config Uvicorn por ENV (sin rebuild)
ENV UVICORN_HOST=0.0.0.0 \
    UVICORN_PORT=8000 \
    UVICORN_WORKERS=2 \
    APP_ENV=prod \
    DEBUG=0

# Arranque producción (sin reload)
CMD ["bash","-lc","exec uvicorn backend.main:app --host ${UVICORN_HOST} --port ${UVICORN_PORT} --workers ${UVICORN_WORKERS} --proxy-headers --forwarded-allow-ips='*'"]

############################
# DEV (reload, hot-reload)
############################
FROM prod AS dev

# Paquetes útiles para desarrollo
RUN pip install --no-cache-dir watchfiles uvicorn[standard]

ENV APP_ENV=dev \
    DEBUG=1

# Dev arranca con --reload (workers=1 por defecto)
CMD ["bash","-lc","exec uvicorn backend.main:app --reload --host ${UVICORN_HOST} --port ${UVICORN_PORT}"]