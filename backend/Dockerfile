# syntax=docker/dockerfile:1.6

############################
# BASE (runtime base)
############################
FROM python:3.10-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore \
    PYTHONPATH=/app

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl poppler-utils \
 && rm -rf /var/lib/apt/lists/*

############################
# DEPS (requirements)
############################
FROM python:3.10-slim AS deps

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore

# Toolchain para compilar si falta wheel + utilidades de saneo
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libffi-dev cargo dos2unix libc-bin \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /tmp/requirements.txt

# Sanea EOL/encoding SOLO después del COPY (ahora el archivo sí existe)
# - dos2unix: por si viene con CRLF
# - iconv: intenta convertir si venía ISO-8859-1/Windows-1252 (si ya está en UTF-8 no cambia nada)
RUN dos2unix /tmp/requirements.txt || true \
 && (iconv -f ISO-8859-1 -t UTF-8 /tmp/requirements.txt -o /tmp/requirements.txt || true)

# Herramientas de build conservadoras y deps
RUN python -m pip install --upgrade "pip<25" "setuptools<70" wheel && \
    pip install --prefer-binary --prefix=/install -r /tmp/requirements.txt

############################
# PROD
############################
FROM base AS prod

COPY --from=deps /install /usr/local
COPY . /app/backend

RUN mkdir -p /app/logs /app/backend/static && \
    adduser --disabled-password --gecos "" --uid 10001 appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/chat/health || exit 1

ENV UVICORN_HOST=0.0.0.0 \
    UVICORN_PORT=8000 \
    UVICORN_WORKERS=2 \
    APP_ENV=prod \
    DEBUG=0

CMD ["bash","-lc","exec uvicorn backend.main:app --host ${UVICORN_HOST} --port ${UVICORN_PORT} --workers ${UVICORN_WORKERS} --proxy-headers --forwarded-allow-ips='*'"]

############################
# DEV
############################
FROM prod AS dev

RUN pip install --no-cache-dir watchfiles uvicorn[standard]

ENV APP_ENV=dev \
    DEBUG=1

CMD ["bash","-lc","exec uvicorn backend.main:app --reload --host ${UVICORN_HOST} --port ${UVICORN_PORT}"]