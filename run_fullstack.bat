@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  Chatbot Tutor Virtual v7.3 - RUN FULLSTACK (Mixto)
REM  - Levanta: Mongo + Rasa + Rasa Actions (Docker)
REM  - Corre:   FastAPI (Uvicorn) en tu .venv local
REM  Requisitos:
REM    * Docker Desktop instalado y corriendo
REM    * docker-compose.yml en la raiz (ya te lo dejé)
REM    * .venv creado y dependencias instaladas (o lo hace)
REM ============================================================

cd /d %~dp0

echo [1/7] Verificando Docker ...
where docker >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Docker no esta instalado o no esta en PATH.
  echo Descarga Docker Desktop: https://www.docker.com/products/docker-desktop/
  pause
  exit /b 1
)

REM Intentar compose v2
docker compose version >nul 2>&1
if %errorlevel%==0 (
  set "DC=docker compose"
) else (
  REM Fallback compose v1
  where docker-compose >nul 2>&1
  if %errorlevel%==0 (
    set "DC=docker-compose"
  ) else (
    echo [ERROR] No se encontro ni "docker compose" ni "docker-compose".
    echo Instala/actualiza Docker Desktop.
    pause
    exit /b 1
  )
)

echo [2/7] Creando .env.docker si no existe ...
if not exist ".env.docker" (
  > .env.docker echo MONGO_INITDB_ROOT_USERNAME=admin
  >> .env.docker echo MONGO_INITDB_ROOT_PASSWORD=admin123
  >> .env.docker echo MONGO_DB=chatbot
  >> .env.docker echo FASTAPI_PORT=8000
  >> .env.docker echo RASA_PORT=5005
)

echo [3/7] Levantando SOLO servicios Docker necesarios (mongo, rasa, rasa-actions) ...
%DC% --env-file .env.docker up -d --build mongo rasa rasa-actions
if errorlevel 1 (
  echo [ERROR] Fallo al levantar servicios Docker.
  pause
  exit /b 1
)

echo [4/7] Esperando a que Rasa y Mongo esten listos (timeout ~60s) ...
set "READY_RASA=0"
set "READY_MONGO=0"

for /l %%I in (1,1,30) do (
  REM Check Rasa
  powershell -Command "try { $r = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5005/status -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
  if !errorlevel! == 0 (
    set "READY_RASA=1"
  )

  REM Check Mongo (puerto abierto)
  powershell -Command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', 27017); if ($c.Connected) { $c.Close(); exit 0 } else { exit 1 } } catch { exit 1 }"
  if !errorlevel! == 0 (
    set "READY_MONGO=1"
  )

  if "!READY_RASA!"=="1" if "!READY_MONGO!"=="1" goto :rdy
  timeout /t 2 >nul
)

:rdy
if not "!READY_RASA!"=="1" (
  echo [ADVERTENCIA] Rasa no respondio a tiempo en http://127.0.0.1:5005/status
) else (
  echo [OK] Rasa arriba: http://127.0.0.1:5005/status
)
if not "!READY_MONGO!"=="1" (
  echo [ADVERTENCIA] Mongo no confirmo TCP en 27017 (puede estar levantando aun).
) else (
  echo [OK] Mongo accesible por TCP 127.0.0.1:27017
)

echo [5/7] Verificando entorno virtual .venv ...
if not exist ".venv\Scripts\activate.bat" (
  echo [INFO] No existe .venv, creando...
  python -m venv .venv
  if errorlevel 1 (
    echo [ERROR] No se pudo crear el entorno virtual .venv
    pause
    exit /b 1
  )
)

echo [6/7] Activando .venv e instalando dependencias esenciales ...
call .venv\Scripts\activate.bat
python -m ensurepip --upgrade
python -m pip install --upgrade pip setuptools wheel
if exist "backend\requirements.txt" (
  python -m pip install -r backend\requirements.txt --no-cache-dir
) else (
  echo [AVISO] No encontre backend\requirements.txt. Instalare fastapi y uvicorn minimos.
  python -m pip install fastapi uvicorn
)

echo [7/7] Iniciando FastAPI local (Uvicorn) en http://127.0.0.1:8000 ...
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

echo.
echo [INFO] Para detener los contenedores Docker (Rasa/Mongo/Actions) ejecuta:
echo        run_fullstack_down.bat
echo.
pause
endlocal
