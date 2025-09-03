# syntax=docker/dockerfile:1.6

############################
# Base mínima
############################
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    UVICORN_HOST=0.0.0.0 \
    UVICORN_PORT=8000 \
    PYTHONPATH=/app

WORKDIR /app

# Sólo utilidades runtime aquí (curl para healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
 && rm -rf /var/lib/apt/lists/*

############################
# Capa de dependencias (build)
############################
FROM python:3.11-slim AS deps

# Paquetes de build para compilar bcrypt/cffi, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libffi-dev \
 && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip \
 && pip install -r /tmp/requirements.txt

############################
# Runtime final (no-root)
############################
FROM base AS runtime

# Copiamos deps de la capa anterior
COPY --from=deps /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=deps /usr/local/bin /usr/local/bin

# Copiamos el código
COPY backend /app/backend

# Preparamos dirs que tu app usa (logs, estáticos) y permisos
RUN mkdir -p /app/logs /app/backend/static && \
    adduser --disabled-password --gecos "" --uid 10001 appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Healthcheck al endpoint que ya tienes en main.py
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://localhost:8000/health || exit 1

# Variables opcionales para tunear uvicorn sin tocar la imagen
ENV UVICORN_WORKERS=2

# Arranque de producción
CMD ["bash","-lc","exec uvicorn backend.main:app --host ${UVICORN_HOST} --port ${UVICORN_PORT} --workers ${UVICORN_WORKERS}"]



# syntax=docker/dockerfile:1

########## BASE ##########
FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app

# Sistema mínimo para compilar libs (bcrypt, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
  && rm -rf /var/lib/apt/lists/*

# Dependencias Python primero (mejor cache)
COPY requirements.txt ./requirements.txt
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

########## PROD ##########
FROM base AS prod
# Código del backend
COPY backend ./backend
# (Opcional) .env* sólo si tu plataforma de build lo necesita.
COPY .env* ./

# Usuario no root + carpeta de logs
RUN useradd -ms /bin/bash appuser && \
    mkdir -p /app/logs && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
# Healthcheck contra /chat/health (ya existe en tu app)
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD python - <<'PY' || exit 1
import urllib.request, os
port = os.environ.get("PORT", "8000")
url  = os.environ.get("HEALTHCHECK_URL", f"http://127.0.0.1:{port}/chat/health")
try:
    with urllib.request.urlopen(url, timeout=2) as r:
        raise SystemExit(0 if 200 <= r.status < 300 else 1)
except Exception:
    raise SystemExit(1)
PY

ENV APP_ENV=prod
CMD ["sh","-c","uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]

########## DEV (reload) ##########
FROM base AS dev
# Herramientas para reload en local
RUN pip install --no-cache-dir watchfiles uvicorn[standard]
COPY backend ./backend
COPY .env* ./
ENV APP_ENV=dev DEBUG=1
EXPOSE 8000
CMD ["uvicorn","backend.main:app","--host","0.0.0.0","--port","8000","--reload"]