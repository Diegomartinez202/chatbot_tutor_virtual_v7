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

FROM rasa/rasa:3.6.20-full

WORKDIR /app
COPY rasa /app

# Copiamos explícitamente la plantilla y el entrypoint
COPY rasa/endpoints.tpl.yml /app/endpoints.tpl.yml
COPY rasa/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5005
ENTRYPOINT ["/entrypoint.sh"]
