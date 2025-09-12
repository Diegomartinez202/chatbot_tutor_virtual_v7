# Windows Quickstart (PowerShell + Visual Studio 2022)

Guía de comandos para levantar **Chatbot Tutor Virtual** en Windows, con y sin Docker.
No modifica tu lógica de negocio. Resume lo esencial para DEV/PROD, health y depuración.

---

## 0) Prerrequisitos

- **Docker Desktop 4.x** (o Docker Engine + Compose v2)
- **PowerShell 5+** (Windows 10/11)
- **Python 3.12** instalado (para backend local con venv)
- Puertos libres: 80, 443, 8000, 5005, 5055, 5173, 6379

---

## 1) Tareas “one-click” (scripts/tasks.ps1)

Desde la **raíz del repo**:

```powershell
# Primero (una vez): permitir scripts locales
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

# Arrancar DEV (build) con reconstrucción
.\scripts\tasks.ps1 -Profile build -Rebuild

# Arrancar PROD local con reconstrucción
.\scripts\tasks.ps1 -Profile prod -Rebuild

# Detener todo
.\scripts\tasks.ps1 -Stop

# Logs útiles (build o prod)
.\scripts\tasks.ps1 -Logs backend-dev,rasa,action-server
Si descargaste el repo de internet, quizá necesites:
Unblock-File .\scripts\tasks.ps1

2) Levantar todo con Docker
2.1 DEV (perfil build)
powershell
Copiar código
# raíz del repo
docker compose --profile build up -d mongo action-server rasa backend-dev admin-dev nginx-dev
docker compose --profile build logs -f backend-dev rasa action-server
# UI: http://localhost/
# Docs FastAPI: http://localhost:8000/docs
# Rasa status: http://localhost:5005/status
# Actions health: http://localhost:5055/health
2.2 PROD local (perfil prod)
powershell
Copiar código
docker compose --profile prod build
docker compose --profile prod up -d
docker compose --profile prod logs -f nginx backend rasa action-server
# UI: http://localhost/
# API: http://localhost/api
# Rasa: http://localhost/rasa
# WS:   ws://localhost/ws
3) Backend local (venv 3.12) + dependencias en Docker
Recomendado para depurar el backend sin tocar Rasa/Actions/Mongo.

powershell
Copiar código
# 3.1 Levanta dependencias en contenedores
docker compose --profile build up -d mongo action-server rasa

# 3.2 Backend local (Visual Studio 2022 o PowerShell)
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -U pip wheel
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
# Docs: http://127.0.0.1:8000/docs
Si ves un warning de codificación en pip install -r requirements.txt,
consulta la sección 8.3 Pip / encoding de este archivo.

4) Health y verificación
powershell
Copiar código
# FastAPI
curl http://127.0.0.1:8000/chat/health

# Rasa
curl http://127.0.0.1:5005/status

# Action Server
curl http://127.0.0.1:5055/health
Smoke del chat (PowerShell):

powershell
Copiar código
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/chat -Body (@{
  sender="qa-session"
  message="hola"
} | ConvertTo-Json) -ContentType "application/json"
5) Rasa/Actions (debug rápido)
Entrar al contenedor de Rasa:

powershell
Copiar código
docker exec -it rasa sh
# dentro:
rasa shell nlu
rasa --version
cat /app/endpoints.yml
Entrar al Action Server:

powershell
Copiar código
docker exec -it action-server sh
6) Frontend (Vite/React)
DEV (Vite + HMR)
powershell
Copiar código
docker compose --profile build up -d admin-dev
# UI dev: http://localhost:5173
PROD (imagen estática + Nginx)
powershell
Copiar código
docker compose --profile prod up -d --build admin nginx
# UI prod: http://localhost/
7) Redis (opcional para rate-limit)
Activar Redis y backend contra Redis:

powershell
Copiar código
# Ya está en docker-compose.yml
docker compose --profile build up -d redis
docker compose --profile prod  up -d redis
Variables (en backend-dev y backend):

ini
Copiar código
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PROVIDER=builtin
RATE_LIMIT_BACKEND=redis
REDIS_URL=redis://redis:6379/0
8) Problemas comunes (y solución)
8.1 Puertos ocupados
powershell
Copiar código
# Ver procesos en 80/443/8000/5005/5055/5173/6379
Get-NetTCPConnection -State Listen | ? {$_.LocalPort -in 80,443,8000,5005,5055,5173,6379} | ft -AutoSize
# Matar si es necesario (identifica PID primero)
Stop-Process -Id <PID> -Force
8.2 CORS en DEV
Asegura que backend/.env incluya:

bash
Copiar código
ALLOWED_ORIGINS=http://localhost:5173,http://localhost
8.3 pip install -r requirements.txt muestra WARNING encoding (cp1252)
Opciones (cualquiera sirve):

Opción A — Re-guardar como UTF-8 (recomendada)

Abre backend/requirements.txt en tu editor.

“Guardar como…” → UTF-8 (sin BOM).

Reintenta:

powershell
Copiar código
pip install -r requirements.txt
Opción B — Convertir con PowerShell

powershell
Copiar código
$path = "requirements.txt"
$content = Get-Content -Raw -Encoding Default $path
Set-Content -Path $path -Value $content -Encoding utf8
pip install -r requirements.txt
Opción C — Añadir cabecera PEP-263 (rápido)
Agrega en la primera línea del requirements.txt:

markdown
Copiar código
# -*- coding: utf-8 -*-
y vuelve a instalar.

El warning no rompe la instalación si el archivo solo contiene ASCII.
Esto es solo para limpiar el mensaje y estandarizar.

9) Visual Studio 2022
Abre la carpeta del repo: File → Open → Folder…

Terminal integrada: View → Terminal (PowerShell)

Backend local:

powershell
Copiar código
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
Dependencias Docker (en otra terminal desde la raíz):

powershell
Copiar código
docker compose --profile build up -d mongo action-server rasa
10) Limpieza/Reset (con cuidado)
powershell
Copiar código
# Bajar servicios (perfil actual)
docker compose down

# Eliminar volúmenes (Mongo/Redis) – ¡borra datos!
docker volume rm chatbot_tutor_virtual_v7_3_mongo-data
docker volume rm chatbot_tutor_virtual_v7_3_redis-data

# Reconstruir todo (prod)
docker compose --profile prod up -d --build
11) Rutas útiles (proxy Nginx en prod)
SPA: http://localhost/

FastAPI: http://localhost/api (docs en /api/docs)

Rasa HTTP: http://localhost/rasa

Rasa WebSocket: ws://localhost/ws