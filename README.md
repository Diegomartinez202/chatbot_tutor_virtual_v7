
## 📎 Integración en sitios externos
Consulta la guía: [EMBED_GUIDE.md](./EMBED_GUIDE.md)

# 🤖 Chatbot Tutor Virtual v2 – Proyecto SENA

Sistema modular e inteligente para orientación académica y soporte en línea de preguntas frecuentes, desarrollado como solución embebible para plataformas educativas como **Zajuna**. Utiliza **FastAPI**, **Rasa**, **MongoDB**, **React** y **Docker**.

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










# 📘 Proyecto Chatbot Tutor Virtual v7.3

---

## 🏫 Institución
**Servicio Nacional de Aprendizaje (SENA)**

## 👤 Autor
**Daniel Hernán Martínez Cano**

## 📅 Versión
v7.3 — 2025

---

## 📌 Introducción

El **Chatbot Tutor Virtual** es una solución tecnológica diseñada para apoyar a los aprendices del SENA en la interacción con la plataforma **Zajuna** y en la gestión de procesos académicos y administrativos.  

El proyecto combina **Inteligencia Artificial** (Rasa para NLU/NLG) con un **backend en FastAPI**, **MongoDB** como base de datos, un **panel administrativo en React (Vite)**, y un **widget web embebible**.  
Además, está preparado para despliegues en **Visual Studio 2022 (F5)** y en **Docker Compose**, lo que garantiza portabilidad y escalabilidad.

---

## 🎯 Objetivos

### Objetivo General
Desarrollar un **Chatbot Tutor Virtual** que facilite el acompañamiento académico, mejore la experiencia de los aprendices en la plataforma Zajuna y optimice los procesos de soporte.

### Objetivos Específicos
1. **Levantamiento de requerimientos** funcionales y no funcionales.  
2. **Diseño de arquitectura tecnológica** modular, escalable y desacoplada.  
3. **Implementación del backend** en FastAPI con autenticación JWT y conexión a MongoDB.  
4. **Integración de Rasa** como motor de NLU/NLG para flujos conversacionales inteligentes.  
5. **Desarrollo de un panel administrativo** en React + Vite para la gestión de intents, logs y métricas.  
6. **Construcción de un widget web embebible** que permita integrar el chatbot en la plataforma Zajuna.  
7. **Pruebas unitarias, funcionales y E2E** para garantizar la calidad del sistema.  
8. **Contenerización con Docker Compose**, habilitando despliegue de backend, frontend, Rasa y servicios asociados.  
9. **Documentación técnica e institucional** para entrega y sustentación.  

---

## 🏗️ Arquitectura General

El sistema está conformado por los siguientes componentes:

- **Backend (FastAPI + MongoDB)**  
  Maneja API REST, autenticación, panel de administración y comunicación con Rasa.  

- **Rasa (NLU/NLG + Action Server)**  
  Procesa las intenciones de los usuarios, gestiona historias, reglas y acciones personalizadas.  

- **Frontend (Admin Panel en React + Vite)**  
  Permite a los administradores gestionar intents, entrenar el bot y visualizar métricas.  

- **Widget Web Embebible**  
  Proporciona la interfaz del chatbot para integrar en Zajuna y otros portales.  

- **Orquestación con Docker Compose**  
  Define perfiles (`build` con Dockerfiles locales, `vanilla` con imágenes oficiales) para flexibilidad en desarrollo y producción.  

---

## 📂 Estructura del Proyecto

chatbot_tutor_virtual_v7.3/
│── backend/ # FastAPI + conexión a MongoDB
│── rasa/ # NLU/NLG (domain.yml, nlu.yml, rules.yml, stories.yml)
│── rasa_action_server/ # Custom actions de Rasa
│── admin_panel_react/ # Panel administrativo en React + Vite
│── ops/nginx/conf.d/ # Configuración de Nginx
│── docker-compose.yml # Orquestación con perfiles build/vanilla
│── run_backend.bat
│── run_frontend.bat
│── run_all.bat
│── run_compose_build.bat
│── run_compose_vanilla.bat
│── check_health.bat
│── check_health.ps1
│── README.md # Documento institucional
│── README-dev.md # Guía técnica para desarrolladores

markdown
Copiar código

---

## ⚙️ Tecnologías Implementadas

- **Lenguajes y Frameworks**
  - Python 3.11 (FastAPI, Uvicorn, Pydantic)
  - JavaScript (React + Vite)
  - YAML (definición de intents, reglas e historias en Rasa)

- **Bases de Datos**
  - MongoDB (persistencia de usuarios, logs y métricas)

- **IA Conversacional**
  - Rasa (NLU/NLG, stories, rules, forms)
  - Rasa SDK (acciones personalizadas)

- **Contenerización**
  - Docker & Docker Compose
  - Perfiles (`build` con Dockerfiles, `vanilla` con imágenes oficiales)

- **Infraestructura**
  - Visual Studio 2022 (integración con F5 para backend Python)
  - Node.js + NPM para React/Vite
  - Nginx (reverse proxy y hosting del panel en perfil build)

---

## ✅ Estado Actual

- Backend FastAPI **implementado y probado**.  
- Autenticación JWT y guardado en MongoDB.  
- Panel React con login, intents, logs y métricas.  
- Widget web embebible con botones, carruseles y escalado a humano.  
- Rasa integrado con intents, reglas, historias y acciones personalizadas.  
- Docker Compose listo con perfiles **build** y **vanilla**.  
- Scripts `.bat` para automatizar ejecución local y con contenedores.  
- Documentación técnica (`README-dev.md`) y de entrega (`README.md`).

---

## 📜 Licencia

Este proyecto es de uso académico e institucional para el **SENA**.  
La distribución y uso externo requiere autorización expresa del autor.

---

# 🔄 Scripts de Reset para Entorno Docker

Este repositorio contiene **tres variantes** de scripts PowerShell para administrar el entorno de desarrollo con **Docker Compose**.

---

## 📌 1. `reset_dev.ps1` (Menú interactivo)

👉 Ideal para **desarrolladores** que quieren tener varias opciones en un solo script.

### Funcionalidad
- Menú con opciones:
  1. Detener y eliminar contenedores (`docker compose down`)
  2. Limpiar recursos huérfanos (`docker system prune`)
  3. Reconstruir y levantar (`docker compose up --build -d`)
  4. Ciclo completo (**down + prune + up**)
  5. Ver estado de contenedores (`docker compose ps`)
- Permite ver logs en tiempo real (opcional).

### Ejecución
```powershell
pwsh ./reset_dev.ps1
📌 2. reset_dev_light.ps1 (Ciclo completo + logs)
👉 Ideal para uso rápido cuando quieres resetear todo y seguir los logs directamente.

Funcionalidad
Ejecuta en orden:

docker compose down

docker system prune -f --volumes

docker compose up --build -d

Muestra logs en tiempo real (docker compose logs -f).

Ejecución
powershell
Copiar código
pwsh ./reset_dev_light.ps1
ℹ️ Se queda en los logs hasta que detengas con Ctrl+C.

📌 3. reset_dev_auto.ps1 (Ciclo completo sin logs)
👉 Ideal para CI/CD o tareas programadas, donde solo quieres reiniciar todo y que el script termine.

Funcionalidad
Ejecuta en orden:

docker compose down

docker system prune -f --volumes

docker compose up --build -d

No se queda en logs, termina automáticamente.

Ejecución
powershell
Copiar código
pwsh ./reset_dev_auto.ps1
🛠️ Requisitos
Tener instalado Docker Desktop o Docker Engine.

Tener un archivo docker-compose.yml en el directorio actual.

Ejecutar con PowerShell 5+ o PowerShell Core (pwsh).

🚀 Recomendación de uso
👨‍💻 Desarrollo local: reset_dev.ps1

🔍 Debug rápido: reset_dev_light.ps1

🤖 Automatización/CI: reset_dev_auto.ps1