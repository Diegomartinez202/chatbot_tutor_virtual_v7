# Despliegue con Docker — Perfiles `build` y `prod`

Este documento resume cómo **levantar** el proyecto con Docker en dos perfiles:
- **build**: desarrollo/testing (hot reload, logs, CORS flexible)
- **prod**: entrega profesional (optimizado, Nginx, CORS cerrado)

---

## 1) Prerrequisitos

- **Docker Desktop** (Windows/Mac) o Docker + Compose v2 (Linux).
- Recomendado: WSL2 activo en Windows (Docker Desktop → Settings → General → WSL2 engine).

Verifica:
```bash
docker version
docker compose version
2) Estructura relevante
arduino
Copiar código
.
├─ backend/
│  ├─ Dockerfile        # multi-stage: dev (reload) y prod (workers)
│  ├─ .env              # desarrollo local
│  └─ .env.production   # producción (hostnames internos: mongo, rasa)
├─ admin_panel_react/
│  ├─ Dockerfile        # build SPA + Nginx
│  └─ .env.development / .env.production  (VITE_API_BASE)
├─ rasa/
│  ├─ Dockerfile
│  ├─ domain.yml, config.yml, data/, ...
│  └─ entrypoint.sh     # entrena si no hay modelo (opcional)
├─ rasa_action_server/
│  └─ Dockerfile, actions/, requirements.txt
├─ ops/
│  └─ nginx/
│     └─ conf.d/
│        └─ app.conf    # proxy /, /api, /rasa, /ws  (válido build y prod)
└─ docker-compose.yml   # perfiles: build, prod (+ vanilla opcional)
3) Variables de entorno
Backend
Dev: backend/.env (ejemplo incluido).

Prod: backend/.env.production (incluye JWT, Mongo, Rasa, CORS/EMBED, rate-limit, SMTP).
En Docker, usa hostnames internos:

ini
Copiar código
MONGO_URI=mongodb://mongo:27017/chatbot_tutor_virtual_v2
RASA_URL=http://rasa:5005
Frontend (Vite)
Dev: admin_panel_react/.env.development

ini
Copiar código
VITE_API_BASE=http://localhost:8000
Prod: admin_panel_react/.env.production

ini
Copiar código
VITE_API_BASE=https://api.tu-dominio.com    # o http://localhost/api si usas reverse proxy
4) Levantar los perfiles
Desarrollo / Testing — build
bash
Copiar código
docker compose --profile build up -d --build
# Backend (FastAPI dev): http://localhost:8000/docs
# Frontend (Vite dev) : http://localhost:5173
# Rasa               : http://localhost:5005/status
# (Opcional) Nginx dev: http://localhost/ → proxya /, /api, /rasa, /ws
Producción / Entrega — prod
bash
Copiar código
docker compose --profile prod up -d --build
# Admin (SPA Nginx) : http://localhost:8080
# Backend (Uvicorn) : http://localhost:8000/docs
# Rasa              : http://localhost:5005/status
# Reverse proxy (si deseas): http://localhost/  (montado a /, /api, /rasa, /ws)
Parar servicios:

bash
Copiar código
docker compose down
Logs:

bash
Copiar código
docker compose --profile build logs -f backend-dev
docker compose --profile prod  logs -f backend
5) Pruebas de salud (smoke tests)
Conexión directa:

bash
Copiar código
# Backend
curl -s http://localhost:8000/ping
curl -s http://localhost:8000/chat/health

# Rasa
curl -s http://localhost:5005/status
Vía reverse proxy (si montas Nginx y enrutas /api):

bash
Copiar código
curl -i http://localhost/api/ping
curl -i http://localhost/rasa/status
Swagger / OpenAPI:

http://localhost:8000/docs

6) CORS, EMBED y seguridad
build: CORS flexible (localhost:5173 / 8080), DEBUG=true.

prod: CORS cerrado (dominios institucionales), DEBUG=false.
Ajusta en backend/.env.production:

env
Copiar código
ALLOWED_ORIGINS=["https://zajuna.edu.co","https://app.zajuna.edu.co","https://chatbot-tutor.sena.edu.co"]
FRAME_ANCESTORS=["'self'","https://zajuna.edu.co","https://app.zajuna.edu.co","https://chatbot-tutor.sena.edu.co"]
(Opcional: TLS con Nginx; montar certs en ops/nginx/certs y habilitar 443.)

7) Checklist para entrega (los 4 productos)
API funcional (FastAPI):

Endpoint /ping OK

/auth/login, /admin/register, /chat responden (usa Postman/Swagger)

Logs sin errores en docker compose logs backend

Interfaz web conversacional:

build: http://localhost:5173 (HMR)

prod: http://localhost:8080 (SPA Nginx)

Si integras con Zajuna: iframe o consumir /api desde front institucional

Manual técnico / usuario:

Este README-deploy.md + README-frontend.md + README-solution.md

Esquemas: arquitectura, perfiles, endpoints, flujos, pruebas

Contenedor Docker funcional:

build/prod levantan sin cambios de código

ops/nginx/conf.d/app.conf enruta /, /api, /rasa, /ws

docker-compose.yml único con perfiles

8) Problemas comunes
Docker no corre (Windows): inicia Docker Desktop → docker version.

version obsoleta en compose: ignorable; quita version: "3.9" si molesta.

Puertos ocupados: cambia mapeos en docker-compose.yml.

Rasa sin modelo: usa un entrypoint.sh de Rasa que entrene si models/ está vacío (opcional).

CORS: añade tu dominio a ALLOWED_ORIGINS en .env.production.