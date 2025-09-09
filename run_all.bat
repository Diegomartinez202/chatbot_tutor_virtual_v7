@echo off
REM === Ejecuta BACKEND (FastAPI en .venv) y FRONTEND (Vite) en 2 ventanas ===
cd /d %~dp0

REM ───── BACKEND ──────────────────────────────────────────────────────────────
if not exist ".venv\Scripts\activate.bat" (
  echo [INFO] No existe .venv, creando...
  python -m venv .venv
)
REM abre una ventana nueva que activa el venv, instala minimos y levanta uvicorn
start "BACKEND FastAPI" cmd /k ^
".venv\Scripts\activate && ^
python -m pip install --upgrade pip setuptools wheel && ^
(if exist backend\requirements.txt (python -m pip install -r backend\requirements.txt --no-cache-dir) else (python -m pip install fastapi uvicorn)) && ^
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

REM ───── FRONTEND ────────────────────────────────────────────────────────────
if not exist "admin_panel_react\package.json" (
  echo [ERROR] No encuentro admin_panel_react\package.json
  echo Asegurate de estar en la raiz del proyecto.
  pause
  exit /b 1
)

start "FRONTEND React/Vite" cmd /k ^
"cd /d %~dp0\admin_panel_react && ^
npm -v || (echo [ERROR] Node/NPM no estan en PATH. Instala Node.js LTS. & pause & exit /b 1) && ^
npm install && ^
npm run dev"

echo.
echo [OK] Lanzadas dos ventanas:
echo   • Backend FastAPI: http://127.0.0.1:8000/docs
echo   • Frontend Vite : http://localhost:5173
echo.
echo Cierra cada ventana con CTRL+C cuando termines.
