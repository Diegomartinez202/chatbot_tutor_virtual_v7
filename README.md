
## 📎 Integración en sitios externos
Consulta la guía: [EMBED_GUIDE.md](./EMBED_GUIDE.md)

# 🤖 Chatbot Tutor Virtual v2 – Proyecto SENA

Sistema modular e inteligente para orientación académica y soporte en línea, desarrollado como solución embebible para plataformas educativas como **Zajuna**. Utiliza **FastAPI**, **Rasa**, **MongoDB**, **React** y **Docker**.

---
![Status](https://img.shields.io/badge/estado-desarrollo-blue.svg)
![Licencia](https://img.shields.io/badge/licencia-MIT-brightgreen.svg)
![Chatbot Rasa](https://img.shields.io/badge/Rasa-IA%20Conversacional-purple.svg)
![FastAPI](https://img.shields.io/badge/API-FastAPI-green.svg)
![Panel React](https://img.shields.io/badge/Admin%20Panel-React%2BVite-blue.svg)
![Despliegue](https://img.shields.io/badge/despliegue-pendiente-lightgrey.svg)


<p align="center">
  <img src="https://img.shields.io/badge/Proyecto-SENA-008000?style=for-the-badge&logo=github" alt="Proyecto SENA" />
  <img src="https://img.shields.io/badge/Estado-En%20desarrollo-blue?style=for-the-badge" alt="Estado" />
  <img src="https://img.shields.io/github/license/Diegomartinez202/chatbot_tutor_virtual_v7?style=for-the-badge" alt="Licencia MIT" />
  <img src="https://img.shields.io/badge/Despliegue-Railway-grey?style=for-the-badge&logo=railway" alt="Railway" />
</p>
<div align="center">

![GitHub repo size](https://img.shields.io/github/repo-size/Diegomartinez202/chatbot_tutor_virtual_v7?label=Repo%20Size)
![GitHub last commit](https://img.shields.io/github/last-commit/Diegomartinez202/chatbot_tutor_virtual_v7?label=Last%20Commit)
![GitHub issues](https://img.shields.io/github/issues/Diegomartinez202/chatbot_tutor_virtual_v7)
![GitHub license](https://img.shields.io/github/license/Diegomartinez202/chatbot_tutor_virtual_v7)
![GitHub stars](https://img.shields.io/github/stars/Diegomartinez202/chatbot_tutor_virtual_v7?style=social)

</div>

## 🧩 Componentes del Proyecto

| Carpeta / Componente      | Tecnología           | Descripción                                                                 |
|---------------------------|----------------------|-----------------------------------------------------------------------------|
| `backend/`                | FastAPI + MongoDB    | API REST con autenticación JWT, gestión de intents, logs y usuarios        |
| `rasa/`                   | Rasa 3.6             | Motor conversacional con intents, reglas, slots y acciones personalizadas  |
| `admin-panel-react/`      | React + Vite         | Panel administrativo con login, intents, logs y estadísticas               |
| `static/widget/`          | HTML + JS            | Widget web embebible vía iframe/script                                     |
| `docker/`                 | Docker               | Configuración para contenedores, init Mongo, volúmenes                     |
| `.github/workflows/`      | GitHub Actions       | Despliegue continuo (CI/CD) en Railway                                     |
| `scripts/`                | Bash                 | Automatización de tareas: build, test, deploy, backup                      |

---

## 📁 Estructura del Proyecto

chatbot_tutor_virtual_v7/
├── backend/
├── rasa/
├── admin-panel-react/
├── static/widget/
├── docker/
├── scripts/
├── .github/workflows/
├── .env.example
└── docker-compose.yml

yaml
Copiar
Editar

---

## 🚀 Instalación Local (modo desarrollo)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Diegomartinez202/chatbot_tutor_virtual_v7.git
cd chatbot_tutor_virtual_v7
2. Backend – FastAPI
bash
Copiar
Editar
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
3. Motor de IA – Rasa
bash
Copiar
Editar
cd rasa
pip install rasa
rasa train
rasa run --enable-api --cors "*" --port 5005 --debug
4. Panel Admin – React
bash
Copiar
Editar
cd admin-panel-react
npm install
npm run dev
💬 Widget Embebido
Puedes integrarlo fácilmente en cualquier plataforma como Zajuna:

html
Copiar
Editar
<script src="https://TU_DOMINIO/static/widget/embed.js"></script>
O directamente:

html
Copiar
Editar
<iframe src="https://TU_DOMINIO/static/widget/widget.html" width="400" height="600"></iframe>
🧪 Pruebas Automáticas
bash
Copiar
Editar
cd backend
pytest tests/
🐳 Despliegue con Docker (modo producción local)
bash
Copiar
Editar
docker-compose up --build
Esto levantará:

API FastAPI en el puerto 8000

Motor Rasa en el puerto 5005

MongoDB

Panel admin (opcionalmente si está integrado)

Widget estático en /static/widget/widget.html

☁️ Despliegue en Railway (CI/CD)
Crea un proyecto en Railway

Conecta este repositorio

Configura tus variables de entorno (usa .env.example)

Elige backend como servicio principal

Railway ejecutará automáticamente el backend

Workflows útiles:

.github/workflows/deploy_railway.yml

.github/workflows/train_rasa.yml

🔐 Usuarios precargados (init-mongo.js)
json
Copiar
Editar
{
  "email": "admin@example.com",
  "password": "admin123",
  "rol": "admin"
}
📜 Scripts útiles (/scripts/)
🔁 run_full_stack.sh
bash
Copiar
Editar
#!/bin/bash
cd rasa && rasa train
cd ..
docker-compose up --build
🚀 push_github.sh
bash
Copiar
Editar
#!/bin/bash
git add .
git commit -m "🚀 Actualización"
git push origin main
🌐 URL de API y Widget
Una vez desplegado en Railway, la URL será algo como:

arduino
Copiar
Editar
https://chatbot-backend-production.up.railway.app
Apunta tu widget así:

js
Copiar
Editar
iframe.src = "https://chatbot-backend-production.up.railway.app/static/widget/widget.html";
🧠 Créditos
Desarrollado por Daniel Martínez como solución de tutoría automatizada para aprendices del SENA.

Incluye integración con:

Plataforma Zajuna

Inteligencia Conversacional Rasa

Panel administrativo React

Orquestación con Docker y Railway

📝 Licencia – MIT
✅ Puedes usar, modificar y distribuir este proyecto libremente.
❌ El autor no se hace responsable por daños derivados del uso.
🔒 Conserva este aviso de licencia en todos los archivos modificados.

<!-- Prueba de conexión GitHub ✅ -->

