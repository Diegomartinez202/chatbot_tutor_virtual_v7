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

# Utils mínimos en runtime (curl p/healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
 && rm -rf /var/lib/apt/lists/*

############################
# DEPS (instala requirements con cache estable)
############################
FROM python:3.11-slim AS deps

# Paquetes de compilación (bcrypt, cffi, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libffi-dev \
 && rm -rf /var/lib/apt/lists/*

# Instala en un prefijo "fijo" para copiar luego (imagen más chica)
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip \
 && pip install --prefix=/install -r /tmp/requirements.txt

############################
# PROD (no-root, salud, workers configurables)
############################
FROM base AS prod

# Copiamos librerías instaladas en /install
COPY --from=deps /install /usr/local

# Código del backend (sólo tu app)
COPY backend /app/backend

# Directorios usados por tu app + usuario no-root
RUN mkdir -p /app/logs /app/backend/static && \
    adduser --disabled-password --gecos "" --uid 10001 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Healthcheck contra el endpoint ya existente
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/chat/health || exit 1

# Uvicorn configurable sin re-build
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

# Paquetes útiles para desarrollo (reload + server completo)
RUN pip install --no-cache-dir watchfiles uvicorn[standard]

ENV APP_ENV=dev \
    DEBUG=1

# Dev arranca con --reload (workers=1 por defecto de uvicorn)
CMD ["bash","-lc","exec uvicorn backend.main:app --reload --host ${UVICORN_HOST} --port ${UVICORN_PORT}"]