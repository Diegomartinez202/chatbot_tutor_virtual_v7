




# 🐍 Dockerfile oficial para Railway con FastAPI modular en /backend
FROM python:3.10-slim

# Crear directorio de trabajo
WORKDIR /app

# Copiar todo el contenido del proyecto al contenedor
COPY . .

# Instalar dependencias
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Exponer el puerto donde correrá FastAPI
EXPOSE 8000

# Ejecutar FastAPI desde backend/main.py
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

por favor integra las mejoras y entregame el archivo completo y actualizado sin eliminar, ni afectar codigo de la logica de negocio:

(Opcional) Dockerfile (FastAPI + UVicorn)
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Sistema básico
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

# Requisitos
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Código
COPY backend ./backend
COPY .env* ./  # por si necesitás uno para build-time (opcional)

# Puerto
EXPOSE 8000

# Entrypoint
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]



# ---------- Base ----------
FROM python:3.11-slim AS base
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Paquetes básicos (compilación de deps nativas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

# Dependencias (usa backend/requirements.txt)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ---------- Dev ----------
FROM base AS dev
WORKDIR /app
COPY backend ./backend
# (Opcional) pasa algún .env que necesites en build-time
# COPY backend/.env* ./
EXPOSE 8000
# Uvicorn con reload para desarrollo
CMD ["uvicorn", "backend.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]

# ---------- Prod ----------
FROM base AS prod
WORKDIR /app
COPY backend ./backend
# (Opcional) pasa algún .env que necesites en build-time
# COPY backend/.env* ./
EXPOSE 8000
# Servidor en modo producción (sin --reload)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
