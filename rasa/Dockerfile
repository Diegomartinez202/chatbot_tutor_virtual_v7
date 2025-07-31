# 🤖 Rasa Core
FROM rasa/rasa:3.6.10

WORKDIR /app
COPY . .

# Entrena automáticamente
CMD ["run", "--enable-api", "--cors", "*", "--debug"]