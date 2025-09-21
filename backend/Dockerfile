# syntax=docker/dockerfile:1.6

############################
# BASE (runtime base)
############################
FROM python:3.10-slim-bookworm AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore \
    PYTHONPATH=/app \
    DEBIAN_FRONTEND=noninteractive \
    APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1

WORKDIR /app

# apt robusto (sin cache mounts), unlock y reintentos
RUN set -eux; \
    rm -f /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock-frontend || true; \
    apt-get -o Acquire::Retries=5 update; \
    apt-get install -y --no-install-recommends \
      bash \
      curl \
      ca-certificates \
      poppler-utils \
    ; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

############################
# DEPS (requirements)
############################
FROM python:3.10-slim-bookworm AS deps

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore \
    DEBIAN_FRONTEND=noninteractive \
    APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1

# Toolchain + utilidades de saneo (sin cache mounts), unlock y reintentos
RUN set -eux; \
    rm -f /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock-frontend || true; \
    apt-get -o Acquire::Retries=5 update; \
    apt-get install -y --no-install-recommends \
      build-essential \
      libffi-dev \
      cargo \
      dos2unix \
      libc-bin \
      ca-certificates \
    ; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

# Ruta del requirements (por defecto, backend/)
ARG REQUIREMENTS_PATH=backend/requirements.txt

# Copia y sanea requirements
COPY ${REQUIREMENTS_PATH} /tmp/requirements.txt
RUN dos2unix /tmp/requirements.txt || true && \
    (iconv -f ISO-8859-1 -t UTF-8 /tmp/requirements.txt -o /tmp/requirements.txt || true)

# Instala dependencias en /install para copiar luego
RUN python -m pip install --upgrade "pip<25" "setuptools<70" wheel && \
    pip install --prefer-binary --prefix=/install -r /tmp/requirements.txt

############################
# PROD
############################
FROM base AS prod

# Trae paquetes instalados
COPY --from=deps /install /usr/local

# Copia solo el backend (si el build context es ./backend, esto será el contenido)
COPY . /app

# Permisos
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

USER root
RUN python -m pip install --no-cache-dir watchfiles uvicorn[standard]
USER appuser

ENV APP_ENV=dev \
    DEBUG=1

CMD ["bash","-lc","exec uvicorn backend.main:app --reload --host ${UVICORN_HOST} --port ${UVICORN_PORT}"]