# reset_dev.ps1
# Script para reiniciar o administrar el entorno de desarrollo con Docker Compose
# Menú interactivo con opciones + logs opcionales al final

function Show-Menu {
    Clear-Host
    Write-Host "============================" -ForegroundColor Cyan
    Write-Host "   Reset Dev - Docker Menu"
    Write-Host "============================" -ForegroundColor Cyan
    Write-Host "1) Detener y eliminar contenedores (docker compose down)"
    Write-Host "2) Limpiar recursos huérfanos (docker system prune)"
    Write-Host "3) Reconstruir y levantar (docker compose up --build -d)"
    Write-Host "4) Ciclo completo (down + prune + up)"
    Write-Host "5) Ver estado de los contenedores (docker compose ps)"
    Write-Host "0) Salir"
    Write-Host "============================" -ForegroundColor Cyan
}

function Show-Logs {
    $seeLogs = Read-Host "¿Quieres ver los logs en tiempo real? (s/n)"
    if ($seeLogs -eq "s") {
        Write-Host "`n[LOGS] Mostrando logs (Ctrl+C para salir, Enter para volver al menú):" -ForegroundColor Cyan
        docker compose logs -f
        Write-Host "`n👀 Fin de logs. Presiona Enter para volver al menú..." -ForegroundColor Cyan
        Read-Host | Out-Null
    }
}

do {
    Show-Menu
    $choice = Read-Host "Selecciona una opción"

    switch ($choice) {
        "1" {
            try {
                Write-Host "[DOWN] Deteniendo y eliminando contenedores..." -ForegroundColor Red
                docker compose down
                Show-Logs
            } catch {
                Write-Host "❌ Error ejecutando docker compose down: $_" -ForegroundColor Red
            }
        }
        "2" {
            try {
                Write-Host "[PRUNE] Limpiando recursos huérfanos (volúmenes, redes, imágenes dangling)..." -ForegroundColor Yellow
                docker system prune -f --volumes
                Show-Logs
            } catch {
                Write-Host "❌ Error ejecutando docker system prune: $_" -ForegroundColor Red
            }
        }
        "3" {
            try {
                Write-Host "[UP] Reconstruyendo y levantando contenedores..." -ForegroundColor Green
                docker compose up --build -d
                Show-Logs
            } catch {
                Write-Host "❌ Error ejecutando docker compose up: $_" -ForegroundColor Red
            }
        }
        "4" {
            try {
                Write-Host "[DOWN] Deteniendo y eliminando contenedores..." -ForegroundColor Red
                docker compose down
                Write-Host "[PRUNE] Limpiando recursos huérfanos..." -ForegroundColor Yellow
                docker system prune -f --volumes
                Write-Host "[UP] Reconstruyendo y levantando contenedores..." -ForegroundColor Green
                docker compose up --build -d
                Show-Logs
            } catch {
                Write-Host "❌ Error ejecutando ciclo completo: $_" -ForegroundColor Red
            }
        }
        "5" {
            try {
                Write-Host "[STATUS] Estado actual de los contenedores:" -ForegroundColor Cyan
                docker compose ps
                Show-Logs
            } catch {
                Write-Host "❌ Error mostrando estado: $_" -ForegroundColor Red
            }
        }
        "0" {
            Write-Host "👋 Saliendo del menú..." -ForegroundColor Magenta
        }
        default {
            Write-Host "❌ Opción no válida, intenta de nuevo." -ForegroundColor Red
        }
    }
} while ($choice -ne "0")