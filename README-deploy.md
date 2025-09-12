# 📦 Chatbot Tutor Virtual – Despliegue local y producción (Docker)

Este README es la **guía maestra** para levantar el proyecto en *build/dev*, *prod* y *vanilla*, con checklist de QA y salud. **No modifica la lógica del proyecto.**

## 0) Perfiles de ejecución

- **build (desarrollo/pruebas):** mongo, action-server, rasa, backend-dev (hot reload), admin-dev (Vite), nginx-dev (proxy).
- **prod (entrega profesional):** imágenes inmutables: mongo, action-server, rasa, backend, admin (Nginx), nginx (reverse proxy).
- **vanilla (diagnóstico):** imágenes oficiales montando carpetas: ctv_mongo, ctv_rasa, ctv_rasa_actions, ctv_fastapi.

## 1) Requisitos

- Docker Desktop 4.x (Compose V2)
- Puertos libres: 80, 443, 8000, 5005, 5055, 5173, 6379
- (Opcional) Windows: Python 3.12 si corres el backend en venv local

## 2) Comandos rápidos

### DEV/BUILD
```bash
docker compose --profile build up -d --build
docker compose --profile build ps
docker compose --profile build logs -f backend-dev rasa action-server
PROD
bash
Copiar código
docker compose --profile prod build
docker compose --profile prod up -d
docker compose --profile prod ps
docker compose --profile prod logs -f nginx backend rasa action-server
VANILLA (diagnóstico)
bash
Copiar código
docker compose --profile vanilla up -d
docker compose --profile vanilla logs -f
3) Salud (health)
FastAPI: http://127.0.0.1:8000/chat/health

Rasa: http://127.0.0.1:5005/status (o vía proxy http://localhost/rasa/status)

Actions: http://127.0.0.1:5055/health

Docs API: http://127.0.0.1:8000/docs (o http://localhost/api/docs vía proxy)

Windows: usa .\check_health.ps1 (actualizado para incluir Action Server).

4) Rate-limit (sin tocar código)
El backend ya integra 3 proveedores. Actívalo con variables:

A) Builtin (memoria) – simple

yaml
Copiar código
environment:
  RATE_LIMIT_ENABLED: "true"
  RATE_LIMIT_PROVIDER: builtin
  RATE_LIMIT_BACKEND: memory
B) Builtin + Redis (recomendado)

yaml
Copiar código
# Volumen + servicio redis en docker-compose:
volumes:
  redis-data:
services:
  redis:
    image: redis:7-alpine
    command: ["redis-server","--appendonly","yes"]
    ports: ["6379:6379"]
    volumes: ["redis-data:/data"]

# En backend-dev y backend:
environment:
  RATE_LIMIT_ENABLED: "true"
  RATE_LIMIT_PROVIDER: builtin
  RATE_LIMIT_BACKEND: redis
  REDIS_URL: redis://redis:6379/0
C) SlowAPI (si añadiste deps en requirements)

yaml
Copiar código
environment:
  RATE_LIMIT_ENABLED: "true"
  RATE_LIMIT_PROVIDER: slowapi
  RATE_LIMIT_STORAGE_URI: redis://redis:6379/0
5) Frontend (proxy vs dominios absolutos)
Con proxy (recomendado): el panel usa rutas relativas /api, /rasa, /ws.
El compose (servicio admin) pasa build args al Dockerfile.

Sin proxy (dominios absolutos): usa admin_panel_react/.env.production.external, o build args en docker-compose.yml del admin.

Ver detalle en admin_panel_react/README.md.

6) Rasa
Entrenamiento automático (RASA_AUTOTRAIN=true) si no hay modelo.

Plantillas de endpoints: ENDPOINTS_TEMPLATE=default|mongo.
Si usas Mongo tracker: define TRACKER_MONGO_URL, TRACKER_MONGO_DB, TRACKER_MONGO_COLLECTION.

Ver detalle en rasa/README.md.

7) QA – Smoke tests
Básicos

GET /api/ping → 200 OK

GET /rasa/status → versión y modelo

GET /api/chat/health → {ok:true}

Intents (REST Rasa)

bash
Copiar código
curl -s http://localhost/rasa/webhooks/rest/webhook \
  -H 'Content-Type: application/json' \
  -d '{"sender":"test","message":"hola"}'
Forms (soporte_form)

Disparar “necesito soporte técnico”.

Al enviar: action_soporte_submit → HELPDESK_WEBHOOK recibe POST 2xx.

Recuperación contraseña

“olvidé mi clave” → action_enviar_correo → correo (si SMTP está configurado).

Tickets directos

/enviar_soporte{"nombre":"X","email":"y@z.com","mensaje":"prueba"} → action_enviar_soporte.

Auth-gating

estado_estudiante|ver_certificados sin token → utter_need_auth.

Con token válido → respuestas protegidas.

CORS/WS

Dev: 5173 ↔ 8000 sin CORS.

Prod: SPA → /api sin CORS (mismo origen).

WS: si usas, comprobar conexión a /ws.

Rate-limit

POST /api/chat: 60 req/min → 429 al exceder.

8) Troubleshooting
Puertos ocupados → libera 80/443/8000/5005/5055/5173/6379.

actions 404 → revisa ACTION_SERVER_URL y que action-server esté UP.

Rasa sin modelo → revisa logs de training o fuerza RASA_FORCE_TRAIN=1.

CORS dev → allowed_origins ya incluye localhost:5173.

9) Documentos locales
Frontend: ./admin_panel_react/README.md

Rasa: ./rasa/README.md

Docker ops: ./docs/DOCKER.md