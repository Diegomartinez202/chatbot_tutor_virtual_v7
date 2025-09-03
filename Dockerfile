# syntax=docker/dockerfile:1.6

############################
# BASE
############################
FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONPATH=/app
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

############################
# DEPS
############################
FROM python:3.11-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libffi-dev \
 && rm -rf /var/lib/apt/lists/*

# Preferimos backend/requirements.txt; si tu CI usa "requirements.txt" en raíz, duplica ese archivo.
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip \
 && pip install --prefix=/install -r /tmp/requirements.txt

############################
# PROD
############################
FROM base AS prod
COPY --from=deps /install /usr/local
COPY backend /app/backend

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
ENV APP_ENV=dev DEBUG=1
CMD ["bash","-lc","exec uvicorn backend.main:app --reload --host ${UVICORN_HOST} --port ${UVICORN_PORT}"]