# Dockerfile en la raíz del proyecto
FROM python:3.10-slim

# Crear directorio de trabajo
WORKDIR /app

# Copiar solo el backend como servicio principal
COPY ./backend /app

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Exponer el puerto del backend FastAPI
EXPOSE 8000

# Comando por defecto
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]