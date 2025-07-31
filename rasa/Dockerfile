# 🤖 Rasa Bot - versión 3.6.10
FROM rasa/rasa:3.6.10

WORKDIR /app
COPY . .

EXPOSE 5005

CMD ["rasa", "run", "--enable-api", "--cors", "*", "--debug"]