# admin_panel_react/README.md

```md
# 🖥️ Admin Panel (React + Vite)

SPA para administración del Chatbot Tutor Virtual. **No cambia tu lógica**.

## 1) Modos

### A) Dev (Vite + HMR)
```bash
docker compose --profile build up -d admin-dev
# UI: http://localhost:5173
Variables (compose):

VITE_API_BASE=http://localhost:8000

VITE_RASA_HTTP=http://localhost:5005

VITE_RASA_WS=ws://localhost:5005

B) Prod (build + Nginx)
bash
Copiar código
docker compose --profile prod up -d --build admin nginx
# UI: http://localhost/
Build args que el compose pasa al Dockerfile:

VITE_API_BASE=/api

VITE_RASA_HTTP=/rasa

VITE_RASA_WS=/ws

2) Proxy vs dominios absolutos
✅ Con proxy (recomendado): nada que cambiar (usa rutas relativas).

🔄 Sin proxy: usa .env.production.external:

env
Copiar código
VITE_API_BASE=https://api.zajuna.edu.co/api
VITE_RASA_HTTP=https://rasa.zajuna.edu.co
VITE_RASA_WS=wss://rasa.zajuna.edu.co/ws
Construye:

bash
Copiar código
cd admin_panel_react
cp .env.production.external .env.production
docker compose --profile prod build admin
docker compose --profile prod up -d admin
(Alternativa CI/CD: build args en docker-compose.yml del admin.)

3) Nginx (SPA)
nginx.conf sirve la SPA con try_files $uri /index.html; y cachea estáticos.

4) Dos frontends (original + sustentación)
Puedes mantener dos builds sin tocar lógica:

Carpeta admin_panel_react/ (principal).

Carpeta admin_panel_react_sus/ (sustentación).

Agrega un servicio admin-sus al compose (perfil prod), mismo Dockerfile, distinto contexto:

yaml
Copiar código
admin-sus:
  profiles: ["prod"]
  build:
    context: ./admin_panel_react_sus
    dockerfile: Dockerfile
    args:
      VITE_API_BASE: /api
      VITE_RASA_HTTP: /rasa
      VITE_RASA_WS: /ws
  container_name: admin-sus
  restart: unless-stopped
  ports:
    - "8081:80"      # otro puerto
  depends_on:
    - backend
  networks: [app-net]
5) Smoke
UI carga (200)

fetch('/api/chat/health') → {ok:true}

Con dev: fetch('http://localhost:8000/api/chat/health')

6) Env files
.env.development (dev)

.env.production (proxy)

.env.production.external (sin proxy)

.env.example (plantilla)

yaml
Copiar código
