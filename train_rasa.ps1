Write-Host "=== Validando datos Rasa ===" -ForegroundColor Cyan
docker exec -it ctv_rasa rasa data validate --fail-on-warning
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en validación de datos" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "=== Entrenando modelo Rasa ===" -ForegroundColor Green
docker exec -it ctv_rasa rasa train