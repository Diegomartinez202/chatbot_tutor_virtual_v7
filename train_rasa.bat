@echo off
echo === Validando datos Rasa ===
docker exec -it ctv_rasa rasa data validate --fail-on-warning
if %errorlevel% neq 0 (
    echo ❌ Error en validacion de datos
    pause
    exit /b %errorlevel%
)
echo === Entrenando modelo Rasa ===
docker exec -it ctv_rasa rasa train
pause