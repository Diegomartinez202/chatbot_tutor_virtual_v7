# Makefile – Tareas del proyecto Chatbot Tutor Virtual

run:
	@echo "🚀 Iniciando backend en modo desarrollo..."
	uvicorn backend.main:app --reload

train:
	@echo "🧠 Entrenando Rasa..."
	bash train_rasa.sh

test:
	@echo "🧪 Ejecutando pruebas generales..."
	pytest backend/test --disable-warnings

logs:
	@echo "🧪 Ejecutando pruebas de logs..."
	pytest backend/test/test_logs.py --disable-warnings

users:
	@echo "👥 Ejecutando pruebas de usuarios..."
	pytest backend/test/test_users.py --disable-warnings

upload:
	@echo "⬆️ Ejecutando prueba de subida de intents por CSV..."
	pytest backend/test/test_upload_csv.py --disable-warnings

all:
	@echo "🧪 Ejecutando test_all.sh completo..."
	bash test_all.sh
