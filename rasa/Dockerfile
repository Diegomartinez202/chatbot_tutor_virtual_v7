# Usa la imagen oficial de Rasa
FROM rasa/rasa:3.6.10

# Copia todos los archivos necesarios
COPY . /app
WORKDIR /app

# Entrena el modelo automáticamente al hacer railway up
RUN rasa train

# Expone el puerto por el que se conectará FastAPI
EXPOSE 5005

# Ejecuta Rasa en modo servidor API
CMD ["rasa", "run", "--enable-api", "--cors", "*", "--debug", "--port", "5005"]