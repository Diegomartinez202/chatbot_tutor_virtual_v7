# 🤖 Chatbot Tutor Virtual v2 – Proyecto SENA

Sistema modular e inteligente para orientación académica y soporte en línea, desarrollado como solución embebible para plataformas educativas como **Zajuna**.

---

## 🧩 Componentes del Proyecto

- **`backend/`**: API con [FastAPI](https://fastapi.tiangolo.com/), conexión a MongoDB, autenticación JWT y servidor para el widget.
- **`rasa/`**: Núcleo conversacional con intents, acciones personalizadas y reglas entrenadas con [Rasa Open Source](https://rasa.com/).
- **`admin-panel-react/`**: Panel de administración con [React + Vite](https://vitejs.dev/).
- **`static/widget/`**: Chatbot embebible en otras plataformas vía iframe + JS.
- **`docker/`**: Archivos de despliegue Docker y configuración.
- **`.github/workflows/`**: Integración y despliegue continuo (CI/CD) con GitHub Actions.
- **`scripts/`**: Automatización de tareas como push, pull, entrenamiento, backup, etc.

---

## 🚀 Instalación local paso a paso

### 1. Clona el proyecto

```bash
git clone https://github.com/Diegomartinez202/chatbot_tutor_virtual_v7.git
cd chatbot_tutor_virtual_v7
2. Backend FastAPI
bash
Copiar
Editar
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
3. Motor de IA Rasa
bash
Copiar
Editar
cd rasa
pip install rasa
rasa train
rasa run --enable-api --cors "*" --port 5005 --debug
4. Panel de administración React
bash
Copiar
Editar
cd admin-panel-react
npm install
npm run dev
💡 Widget embebido
Puedes integrar el chatbot en otras plataformas insertando:

html
Copiar
Editar
<script src="https://TU_DOMINIO/static/widget/embed.js"></script>
🧪 Ejecutar pruebas
bash
Copiar
Editar
cd backend
pytest tests/
🐳 Despliegue con Docker
bash
Copiar
Editar
docker-compose up --build
Incluye Rasa, FastAPI, MongoDB y el panel React en una sola orquestación.

☁️ Despliegue en Railway (CI/CD)
Crea un proyecto en https://railway.app

Conecta tu repositorio

Agrega tus variables de entorno (.env)

Deploy automático en cada push a main

Usa los workflows .github/workflows/deploy_railway.yml y train_rasa.yml.

📂 Estructura del proyecto
swift
Copiar
Editar
chatbot_tutor_virtual_v7/
├── backend/
├── rasa/
├── admin-panel-react/
├── static/widget/
├── docker/
├── scripts/
└── .github/workflows/
📄 Scripts útiles
🔁 scripts/run_full_stack.sh
bash
Copiar
Editar
#!/bin/bash
echo "🎯 Entrenando y desplegando todo..."
cd rasa && rasa train
cd ..
docker-compose up --build
🚀 scripts/push_github.sh
bash
Copiar
Editar
#!/bin/bash
git add .
git commit -m "🚀 Actualización"
git push origin main
🧠 Créditos
Desarrollado por Daniel Martínez como solución de tutoría automatizada para el SENA.
Integración con Zajuna, IA conversacional Rasa y panel admin React.

📜 Licencia – MIT
Este proyecto está licenciado bajo la Licencia MIT.

¿Qué significa?
✅ Puedes usar, modificar, distribuir y comercializar el código.

❌ El autor no se hace responsable de daños derivados.

📝 Solo se requiere mantener este aviso de licencia.

