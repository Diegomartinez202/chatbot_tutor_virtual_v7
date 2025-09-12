Entregable: Chatbot Tutor Virtual – despliegue local y producción con Docker (Rasa + Action Server + FastAPI + Frontend React + Nginx)

0) Perfiles / modos de ejecución

build (desarrollo / pruebas integradas):
Levanta mongo, action-server, rasa, backend-dev (hot-reload), admin-dev (Vite) y nginx-dev (proxy).

prod (entrega profesional):
Imágenes inmutables: mongo, action-server, rasa, backend, admin (Nginx), nginx (reverse proxy).

vanilla (sólo para diagnóstico rápido):
ctv_mongo, ctv_rasa, ctv_rasa_actions, ctv_fastapi montando carpetas.

No cambies tu lógica: ya está todo cableado para que funcione con /api (backend), /rasa y /ws (Rasa WebSocket) vía Nginx.

1) Estructura relevante del repo
.
├─ backend/                         # FastAPI
│  ├─ Dockerfile
│  ├─ .env / .env.production
│  └─ requirements.txt
├─ rasa/                            # Proyecto Rasa
│  ├─ Dockerfile
│  ├─ entrypoint.sh                 # render endpoints + autotrain opcional
│  ├─ endpoints.tpl.yml             # default (action server)
│  ├─ endpoints.mongo.tpl.yml       # tracker Mongo (opcional)
│  ├─ domain.yml / config.yml / data/
│  ├─ credentials.yml / endpoints.yml (runtime)
│  └─ actions/                      # código de actions (Opción A)
├─ rasa_action_server/              # Dockerfile del action-server
│  ├─ Dockerfile
│  └─ requirements.txt (opcional)
├─ admin_panel_react/               # Frontend (Vite/React + Nginx)
│  ├─ Dockerfile
│  ├─ nginx.conf
│  ├─ .env.development
│  ├─ .env.production               # detrás del proxy
│  ├─ .env.production.external      # sin proxy (dominios absolutos)
│  └─ .env.example
├─ ops/nginx/conf.d/
│  └─ app.conf                      # reverse proxy /, /api, /rasa, /ws
├─ check_health.ps1                 # salud local (Windows)
└─ docker-compose.yml

2) Variables clave (resumen)
2.1 Rasa (contenedor rasa)

ACTION_SERVER_URL → http://action-server:5055/webhook

RASA_AUTOTRAIN → "true" si quieres que entrene si no encuentra modelo.

(Opcional tracker Mongo)

ENDPOINTS_TEMPLATE="mongo"

TRACKER_MONGO_URL="mongodb://mongo:27017"

TRACKER_MONGO_DB="rasa"

TRACKER_MONGO_COLLECTION="conversations"

2.2 Action Server

HELPDESK_WEBHOOK → p.ej. http://backend:8000/api/helpdesk/tickets

ACTIONS_LOG_LEVEL → INFO

2.3 Backend

MONGO_URI → mongodb://mongo:27017/chatbot_tutor_virtual_v2

RASA_URL → http://rasa:5005

2.4 Frontend (Vite)

Detrás de proxy (producción):
.env.production con
VITE_API_BASE=/api
VITE_RASA_HTTP=/rasa
VITE_RASA_WS=/ws

Dev local (Vite):
.env.development con URLs locales (ya listo).

3) Comandos de despliegue
3.1 Desarrollo (build)
# levantar todo lo necesario para pruebas locales integradas
docker compose --profile build up -d mongo action-server rasa backend-dev admin-dev nginx-dev
# logs útiles
docker compose logs -f backend-dev rasa action-server


Front web en: http://localhost/ (servido por nginx-dev, que enruta a admin-dev:5173).

3.2 Producción (entrega)
# construir imágenes
docker compose --profile prod build

# levantar
docker compose --profile prod up -d

# ver estado
docker compose ps

# logs (útil si algo falla)
docker compose logs -f nginx backend rasa action-server


Front web en: http://localhost/ (o tu dominio en 80/443 si habilitas TLS).

4) Salud / Healthchecks
4.1 PowerShell (Windows): check_health.ps1 (actualizado con Action Server)
param(
  [string]$FastApiUrl = "http://127.0.0.1:8000",
  [string]$RasaUrl    = "http://127.0.0.1:5005",
  [string]$ActionsUrl = "http://127.0.0.1:5055"
)

$ErrorActionPreference = "SilentlyContinue"

function Test-Endpoint {
  param([string]$Url, [string]$Name)
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $res = Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 -Uri $Url
    $sw.Stop()
    if ($res.StatusCode -eq 200) {
      Write-Host ("[OK]  {0}  {1}ms" -f $Url, $sw.ElapsedMilliseconds) -ForegroundColor Green
      return @{ ok=$true; ms=$sw.ElapsedMilliseconds; name=$Name }
    } else {
      Write-Host ("[FAIL]{0}  {1}" -f (" " * 2), $Url) -ForegroundColor Red
      return @{ ok=$false; ms=$sw.ElapsedMilliseconds; name=$Name }
    }
  } catch {
    $sw.Stop()
    Write-Host ("[FAIL] {0} ({1}ms)" -f $Url, $sw.ElapsedMilliseconds) -ForegroundColor Red
    return @{ ok=$false; ms=$sw.ElapsedMilliseconds; name=$Name }
  }
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host " Chatbot Tutor Virtual - Health Check " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$fastapiPing  = Test-Endpoint -Url "$FastApiUrl/ping"        -Name "fastapi_ping"
$chatHealth   = Test-Endpoint -Url "$FastApiUrl/chat/health" -Name "chat_health"
$rasaStatus   = Test-Endpoint -Url "$RasaUrl/status"         -Name "rasa_status"
$actionsHealth= Test-Endpoint -Url "$ActionsUrl/health"      -Name "actions_health"

$allOk = $fastapiPing.ok -and $chatHealth.ok -and $rasaStatus.ok -and $actionsHealth.ok
Write-Host "--------------------------------------"
if ($allOk) {
  Write-Host "TODOS LOS SERVICIOS RESPONDEN OK" -ForegroundColor Green
  Start-Process "$FastApiUrl/docs"
} else {
  Write-Host "ALGÚN SERVICIO FALLÓ (ver arriba)" -ForegroundColor Yellow
}
Write-Host "--------------------------------------"


En prod puedes probar a través del Nginx:

http://localhost/api/docs (FastAPI)

http://localhost/rasa/status (Rasa)

WS: ws://localhost/ws (Rasa Socket.IO/WS según configuración del cliente)

5) Nginx (reverse proxy)

Archivo: ops/nginx/conf.d/app.conf

/ → Admin (SPA o Vite)

/api → FastAPI

/rasa y /ws → Rasa (HTTP y WebSocket)

Ya está listo. Si activas TLS: coloca certificados en ops/nginx/certs/ y habilita 443:443 en docker-compose.yml.

6) Frontend: variantes con proxy / sin proxy

Con proxy (recomendado): ya viene todo con rutas relativas (/api, /rasa, /ws).

Sin proxy (dominios absolutos):

Opción 1 (rápida):

cd admin_panel_react
cp .env.production.external .env.production
docker compose --profile prod build admin
docker compose --profile prod up -d admin nginx


Opción 2 (CI/CD y reproducible – recomendado): pasar build args en docker-compose.yml del servicio admin (ya incluido).

7) Smoke tests / QA checklist
7.1 Conexión básica

GET /api/ping ⇒ 200 OK

GET /rasa/status ⇒ versión Rasa

GET /api/chat/health ⇒ ok

7.2 Intents públicos (REST Rasa)
curl -XPOST http://localhost/rasa/webhooks/rest/webhook \
  -H 'Content-Type: application/json' \
  -d '{"sender":"test1","message":"hola"}'


Esperado: utter_saludo + botones.

curl -XPOST http://localhost/rasa/webhooks/rest/webhook \
  -H 'Content-Type: application/json' \
  -d '{"sender":"test1","message":"quiero ver cursos"}'


Esperado: carrusel / recomendados.

7.3 Forms (soporte_form)

Disparar: “necesito soporte técnico”

Bot pide nombre, email, mensaje.

Al cerrar form: utter_soporte_resumen → action_soporte_submit → utter_soporte_creado.

Ver en logs del backend si se recibió POST /api/helpdesk/tickets.

7.4 Recuperación de contraseña (recovery_form)

“olvidé mi clave” → pide email → action_enviar_correo → utter_confirmar_recuperacion.

7.5 Tickets directos (intent enviar_soporte)

Enviar payload: /enviar_soporte{"nombre":"X","email":"y@z.com","mensaje":"prueba"}

Esperado: action_enviar_soporte → confirmación.

7.6 Auth-gating (intents privados)

estado_estudiante / ver_certificados con metadata.auth.hasToken=false
⇒ utter_need_auth (botón “Iniciar sesión” con custom.type=auth_needed).

Con metadata.auth.hasToken=true
⇒ utter_estado_estudiante / utter_certificados_info.

Para probar metadata, usa tu chat UI o un cliente que permita adjuntarla al mensaje.

7.7 CORS

Desde el admin-dev (5173) a http://localhost:8000/api debe funcionar preflight y POST/GET.

En prod: Admin → /api proxificado por Nginx (mismo origen), no debería haber CORS.

7.8 WebSocket

Si usas WS: comprueba que el cliente conecta a ws://localhost/ws (en prod) o ws://localhost:5005 (dev), según .env.

8) Troubleshooting

PUERTOS: 80, 443, 5005, 5055, 8000, 5173. Verifica que no haya conflictos.

Entrenamiento Rasa: si RASA_AUTOTRAIN=true y no hay modelos, entrenará al inicio.

Revisa docker compose logs -f rasa para ver errores de NLU/data.

Action Server: si HELPDESK_WEBHOOK no responde 2xx, verás mensaje de error y el bot avisará.

Nginx:

/api debe tener slash final en proxy_pass para preservar rutas. Ya está así.

WS: Upgrade y Connection están configurados.

9) Ejecución local sin Docker (diagnóstico rápido)
9.1 Backend (FastAPI)
cd backend
python -m venv .venv && . .venv/bin/activate  # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

9.2 Rasa + Actions
cd rasa
rasa train
rasa run --enable-api --cors "*" --port 5005  # terminal 1

# terminal 2 (actions)
cd rasa
python -m rasa_sdk --actions actions --port 5055

10) TLS (opcional)

Coloca fullchain.pem y privkey.pem en ops/nginx/certs/.

Ajusta ops/nginx/conf.d/app.conf para listen 443 ssl; y apunta a los certs.

Expone 443:443 en docker-compose.yml (nginx).

Anexo A — Ajustes mínimos a docker-compose.yml (frontend)

Sin eliminar funcionalidades; consolidamos duplicados para que el YAML sea válido. Mantén TODO lo demás como ya lo tenías.

Admin (prod) con build args (proxy):

  admin:
    profiles: ["prod"]
    build:
      context: ./admin_panel_react
      dockerfile: Dockerfile
      args:
        VITE_API_BASE: /api
        VITE_RASA_HTTP: /rasa
        VITE_RASA_WS: /ws
    container_name: admin
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - backend
    networks: [app-net]


Admin-dev (build) – un solo bloque (con Rasa explícito):

  admin-dev:
    profiles: ["build"]
    image: node:18-alpine
    container_name: admin-dev
    working_dir: /app
    command: sh -lc "npm ci && npm run dev -- --host --port 5173"
    volumes:
      - ./admin_panel_react:/app
    environment:
      VITE_API_BASE: http://localhost:8000
      VITE_RASA_HTTP: http://localhost:5005
      VITE_RASA_WS: ws://localhost:5005
    ports:
      - "5173:5173"
    depends_on:
      - backend-dev
    networks: [app-net]


Nota importante (YAML al final del archivo):

Tenías un bloque environment: suelto al final con variables de Rasa/Mongo. En Compose no hace efecto si no está dentro de un servicio.
→ Cuando quieras tracker en Mongo, pon estas dentro del servicio rasa y usa la plantilla mongo:

rasa:
  environment:
    ACTION_SERVER_URL: http://action-server:5055/webhook
    RASA_PORT: "5005"
    RASA_AUTOTRAIN: "true"
    ENDPOINTS_TEMPLATE: "mongo"
    TRACKER_MONGO_URL: "mongodb://mongo:27017"
    TRACKER_MONGO_DB: "rasa"
    TRACKER_MONGO_COLLECTION: "conversations"


Redis (si lo activas) – corrige indentación/typo:

  # redis:
  #   image: redis:7-alpine
  #   container_name: redis
  #   command: ["redis-server","--appendonly","yes"]
  #   ports:
  #     - "6379:6379"
  #   volumes:
  #     - redis-data:/data
  #   networks:
  #     - app-net

Anexo B — Frontend (archivos finales)

Ya están listos (y no tocan tu lógica):

admin_panel_react/Dockerfile (multi-stage)

admin_panel_react/nginx.conf (SPA + cache estáticos)

.env.development, .env.production, .env.production.external, .env.development.external, .env.example

.gitignore y .dockerignore optimizados