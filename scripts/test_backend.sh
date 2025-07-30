#!/bin/bash

echo "🚀 Ejecutando pruebas del backend..."

# Ir a raíz del proyecto (desde la ubicación del script)
cd "$(dirname "$0")/.."

# Ejecutar pruebas del backend
cd backend
pytest test/

# Regresar a la raíz si se desea continuar con otras tareas
cd ..