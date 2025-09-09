# Chatbot Tutor Virtual v7.3 — Guía de Desarrollo

Este documento resume los pasos para levantar el proyecto **en local**, **con Docker** y **en Visual Studio 2022 (F5)**.

---

## 🔧 1. Requisitos previos

- **Python 3.11+**
- **Node.js LTS (npm incluido)**
- **Docker Desktop** (con `docker compose v2`)
- **Visual Studio 2022** con workloads:
  - Desarrollo de Python
  - (Opcional) Desarrollo de Node.js para Task Runner

---

## 🚀 2. Levantar en local (sin Docker)

### Backend (FastAPI)
```powershell
cd chatbot_tutor_virtual_v7.3
.venv\Scripts\activate
python -m pip install -r backend\requirements.txt --no-cache-dir
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
👉 Docs: http://127.0.0.1:8000/docs

Frontend (React + Vite)
powershell
Copiar código
cd admin_panel_react
npm install
npm run dev
👉 App: http://localhost:5173

🐳 3. Levantar con Docker Compose
Perfiles disponibles
build → usa tus Dockerfiles (./backend, ./rasa, ./rasa_action_server, ./admin_panel_react, ./ops/nginx).

vanilla → usa imágenes oficiales y monta tu código (./backend, ./rasa, ./rasa/actions).

Comandos rápidos
powershell
Copiar código
# Modo build
docker compose --profile build up -d --build

# Modo vanilla
docker compose --profile vanilla up -d --build

# Apagar
docker compose down

# Logs
docker compose --profile build logs -f backend
👉 Servicios:

Backend: http://localhost:8000/docs

Rasa: http://localhost:5005/status

Admin (React, solo build): http://localhost:8080

Nginx (solo build): http://localhost

🖥️ 4. Visual Studio 2022 (F5)
Si abriste la solución .sln
Startup project: backend

Startup File: main.py

Script Arguments:

diff
Copiar código
-m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
Interpreter: .venv\Scripts\python.exe

Si abriste solo la carpeta backend/
Crea el archivo .vs\launch.vs.json en la raíz:

json
Copiar código
{
  "version": "0.2.1",
  "configurations": [
    {
      "type": "python",
      "name": "FastAPI (Uvicorn) - backend",
      "project": "backend",
      "pythonInterpreter": ".venv\\Scripts\\python.exe",
      "script": "-m",
      "args": [
        "uvicorn",
        "backend.main:app",
        "--reload",
        "--host",
        "127.0.0.1",
        "--port",
        "8000"
      ],
      "workingDirectory": "."
    }
  ]
}
Presiona F5 → inicia el backend en http://127.0.0.1:8000/docs.

📜 5. Scripts útiles (doble clic)
run_backend.bat → activa .venv y levanta FastAPI.

run_frontend.bat → levanta React (npm run dev).

run_all.bat → abre backend + frontend en 2 ventanas.

run_compose_build.bat → menú up/down/logs/rebuild para perfil build.

run_compose_vanilla.bat → menú up/down/logs/rebuild para perfil vanilla.

check_health.bat y check_health.ps1 → testean /ping, /chat/health, /status.

📂 6. Estructura relevante
bash
Copiar código
chatbot_tutor_virtual_v7.3/
│── backend/              # FastAPI
│── rasa/                 # NLU/NLG
│── rasa_action_server/   # Custom actions
│── admin_panel_react/    # Panel admin (Vite + React)
│── ops/nginx/conf.d/     # Nginx configs
│── docker-compose.yml    # Orquestación con perfiles
│── run_backend.bat
│── run_frontend.bat
│── run_all.bat
│── run_compose_build.bat
│── run_compose_vanilla.bat
│── check_health.bat
│── check_health.ps1
│── README-dev.md         # (este documento)
🛠️ 7. Tips
No mezcles perfiles de compose (build y vanilla) al mismo tiempo.

Usa docker compose ps para ver contenedores levantados.

Si Rasa dice No model found, entrena manualmente:

bash
Copiar código
docker exec -it ctv_rasa rasa train
Revisa .env en la raíz para las credenciales de vanilla.