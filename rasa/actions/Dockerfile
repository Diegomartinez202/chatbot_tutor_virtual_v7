# 🧠 Action Server para Rasa
FROM rasa/rasa-sdk:3.6.2

WORKDIR /app/actions

# Copiar solo las acciones, no el resto del proyecto
COPY . .

# Inicia el servidor de acciones
CMD ["start", "--actions", "actions"]