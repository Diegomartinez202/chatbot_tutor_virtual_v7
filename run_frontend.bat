@echo off
REM === Levantar admin_panel_react con npm run dev ===

cd /d %~dp0\admin_panel_react

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js/NPM no estan instalados o no estan en PATH.
  echo Descargalo desde: https://nodejs.org/en/download/
  pause
  exit /b 1
)

echo [1/2] Instalando dependencias (si es necesario)...
call npm install

echo [2/2] Iniciando servidor Vite en http://localhost:5173 ...
call npm run dev

pause
