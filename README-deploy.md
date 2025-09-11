Ámbito: Entregable 4 — Contenedor Docker funcional con un solo docker-compose.yml y dos perfiles (build/prod), imágenes reproducibles, y reverse proxy.
Estado: Perfiles listos. Back/Front/Rasa/Action Server listos. Nginx listo. Health-check listo. Sin eliminar ni modificar tu lógica de negocio.

1) Requisitos

Docker Desktop o Docker Engine + Compose v2

4 GB RAM libres recomendados

Puertos libres: 80, 8000, 5005, 5055, 5173 (solo build)

2) Estructura del repo (resumen)
chatbot_tutor_virtual_v7.3/
├─ docker-compose.yml
├─ backend/
│  ├─ Dockerfile               # multi-stage (dev/prod)
│  ├─ requirements.txt
│  ├─ .env                     # desarrollo
│  └─ .env.production          # producción (usa hostnames internos)
├─ rasa/
│  ├─ Dockerfile               # imagen de Rasa (con entrypoint.sh)
│  ├─ entrypoint.sh            # render de endpoints + auto-train
│  ├─ endpoints.tpl.yml        # template default
│  ├─ endpoints.mongo.tpl.yml  # template con tracker Mongo (opcional)
│  ├─ domain.yml / config.yml / data/** / ...
│  └─ actions/                 # ⚠️ código de acciones (una sola base)
│     ├─ actions.py
│     ├─ __init__.py
│     └─ Dockerfile            # (LEGACY/OPCIONAL, ver notas)
├─ rasa_action_server/
│  ├─ Dockerfile               # ⬅️ imagen oficial del Action Server (Opción A)
│  ├─ requirements.txt         # (opcional para extras)
│  └─ actions/entrypoint.sh    # (opcional; no requerido en Opción A)
├─ ops/
│  └─ nginx/conf.d/app.conf    # reverse proxy build/prod
├─ check_health.ps1            # health: FastAPI, /chat/health, Rasa, Action Server


Nota sobre rasa/actions/Dockerfile: lo conservamos solo como legado (no lo usa docker-compose). La imagen en uso del Action Server es la de rasa_action_server/Dockerfile y copia tu código desde rasa/actions/** (Opción A). No se elimina nada.

3) Perfiles y entornos

build (desarrollo/test): hot-reload en backend y Vite, CORS flexible, logs de depuración, auto-train Rasa si no hay modelo.

prod (entrega): imágenes inmutables, Uvicorn en backend, Nginx para SPA/API/Rasa, CORS/headers más estrictos, hostnames internos.

4) Variables de entorno

backend/.env y backend/.env.production ya preparados.
En producción, los servicios internos se resuelven como:

MONGO_URI=mongodb://mongo:27017/chatbot_tutor_virtual_v2

RASA_URL=http://rasa:5005

Rasa: ENDPOINTS_TEMPLATE=default|mongo (por defecto default).
Para usar tracker en Mongo:

ENDPOINTS_TEMPLATE=mongo
TRACKER_MONGO_URL=mongodb://mongo:27017
TRACKER_MONGO_DB=rasa
TRACKER_MONGO_COLLECTION=conversations


Action Server:

HELPDESK_WEBHOOK (por defecto lo definimos a http://backend:8000/api/helpdesk/tickets)

ACTIONS_LOG_LEVEL, ACTIONS_LOG_FILE (opcional), ACTIONS_HTTP_TIMEOUT, ACTIONS_HTTP_RETRIES

5) Cómo levantar
5.1 Desarrollo / pruebas (perfil build)
# desde la raíz del repo
docker compose --profile build up -d --build
docker compose --profile build logs -f rasa action-server backend-dev admin-dev nginx-dev


UI (admin-dev): http://localhost

API (backend-dev): http://localhost/api

Rasa (REST): http://localhost/rasa

WS a Rasa: ws://localhost/ws

5.2 Producción (perfil prod)
docker compose --profile prod up -d --build
docker compose --profile prod logs -f nginx backend rasa action-server admin


UI (admin): http://localhost

API (backend): http://localhost/api

Rasa (REST): http://localhost/rasa

WS a Rasa: ws://localhost/ws

TLS (opcional): coloca certificados en ops/nginx/certs/ y habilita el puerto 443 en el servicio nginx (ya dejé la plantilla en app.conf lista para ampliar).

6) Health check
Windows (PowerShell):
.\check_health.ps1 -OpenDocs

Linux/macOS (curl equivalente rápido):
set -e
for u in \
  http://127.0.0.1:8000/ping \
  http://127.0.0.1:8000/chat/health \
  http://127.0.0.1:5005/status \
  http://127.0.0.1:5055/health ; do
  echo "=> $u"; curl -fsSL "$u" >/dev/null && echo "OK" || (echo "FAIL" && exit 1)
done

7) Comandos útiles
# reconstruir solo backend dev
docker compose build backend-dev && docker compose up -d backend-dev

# reconstruir Rasa (si cambias NLU/data)
docker compose build rasa && docker compose up -d rasa

# reconstruir action server (si cambias actions.py)
docker compose build action-server && docker compose up -d action-server

# ver logs de un servicio
docker compose logs -f backend  # (o backend-dev / rasa / action-server / admin / nginx)

8) Errores comunes

Puerto en uso: libera 80/8000/5005/5055/5173 o cambia mapeos en docker-compose.yml.

Rasa sin modelo: si models/ está vacío, el entrypoint.sh entrena; revisa errores en datos NLU.

CORS/iframe: ajusta ALLOWED_ORIGINS, FRAME_ANCESTORS y CSP del Nginx si incrustas el widget.

Mongo auth (vanilla): hay un servicio ctv_mongo con auth para pruebas alternas (perfil vanilla). No se usa en build/prod.

9) Archivos revisados/entregados (Action Server)

Opción A confirmada: una sola base de acciones en rasa/actions/**. La imagen de ejecución se construye desde rasa_action_server/Dockerfile y copia esa carpeta.

A. rasa_action_server/Dockerfile ✅ (en uso por docker-compose)
# syntax=docker/dockerfile:1.6
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app/actions

# Sistema mínimo (curl para healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Rasa SDK
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir rasa-sdk==3.6.2

# (Opcional) dependencias de tus acciones si creas este archivo
# (lo buscará en la RAÍZ DEL REPO: rasa_action_server/requirements.txt)
COPY rasa_action_server/requirements.txt /tmp/requirements.txt
RUN if [ -f /tmp/requirements.txt ]; then \
      pip install --no-cache-dir -r /tmp/requirements.txt ; \
    fi

# Copia SOLO el código de acciones desde tu ubicación original (Opción A)
COPY rasa/actions /app/actions

# Usuario no-root
RUN adduser --disabled-password --gecos "" --uid 10002 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 5055

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://localhost:5055/health || exit 1

# Lanza el servidor de acciones cargando el módulo "actions"
CMD ["python", "-m", "rasa_sdk", "--actions", "actions", "--port", "5055"]

B. rasa/actions/Dockerfile 🟨 (legado/alternativo – no lo usa compose)

Lo dejamos por compatibilidad. Si alguna vez quisieras construir un contenedor auto-contenido que incluya solo rasa/actions (sin copiar desde fuera), este Dockerfile funciona. No afecta tu despliegue actual.

# 🧠 Action Server para Rasa (LEGADO/ALTERNATIVO)
FROM rasa/rasa-sdk:3.6.2

WORKDIR /app/actions

# Copiar solo las acciones, no el resto del proyecto
COPY . .

# Inicia el servidor de acciones
CMD ["start", "--actions", "actions"]


Si quieres evitar confusiones en el futuro, puedes renombrarlo a Dockerfile.legacy o dejar un comentario al inicio indicando que no lo usa docker-compose. No lo elimino para respetar tu requerimiento.

10) Nginx (reverse proxy)

Ya entregado y validado en ops/nginx/conf.d/app.conf. Apunta a:

/ → admin | admin-dev

/api/ → backend | backend-dev

/rasa/ y /ws → rasa

Para TLS, añade los certificados en ops/nginx/certs/ y expón 443.

11) Validación final (checklist)

 docker-compose.yml en raíz con perfiles build y prod

 backend/Dockerfile multi-stage (dev/prod) + .env + .env.production

 rasa/Dockerfile + entrypoint.sh + endpoints.tpl.yml (+ endpoints.mongo.tpl.yml)

 Acciones en rasa/actions/** (una sola base)

 Imagen Action Server desde rasa_action_server/Dockerfile (en uso)

 ops/nginx/conf.d/app.conf (proxy /, /api, /rasa, /ws)

 check_health.ps1 prueba FastAPI, /chat/health, Rasa, Action Server

 Levanta --profile build y --profile prod sin errores

 (Opcional) TLS en Nginx funcionando