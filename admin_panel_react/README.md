# 🧠 Panel Administrativo – Chatbot Tutor Virtual

Este panel permite la gestión de *intents*, visualización de *logs* y administración general del **Chatbot Tutor Virtual**, desarrollado con **React + Vite** y conectado a un backend en **FastAPI**.

---

## 🚀 Funcionalidades principales

- 🔐 Login con JWT (solo administradores)
- 🧭 Navegación protegida por rol (`admin`)
- 📊 Dashboard general con métricas
- 📝 Visualización y descarga de logs
- 🤖 Carga y edición de *intents*
- 🧠 Entrenamiento automático del chatbot
- 📁 Subida de archivos `.csv` o `.json`
- 👤 Gestión de usuarios y roles

---

## 📁 Estructura de carpetas

admin-panel-react/
├── public/ # HTML base y favicon
└── src/
├── components/ # Botones, headers, formularios reutilizables
├── pages/ # LoginPage, Dashboard, LogsPage, IntentsPage, etc.
├── services/ # api.js, auth.js, axiosClient.js, etc.
├── hooks/ # useAuth, useAdminActions, useToast, etc.
├── context/ # AuthContext, ToastContext
├── styles/ # index.css, toast.css, sidebar.css
├── App.jsx # Enrutador principal
├── main.jsx # Punto de entrada
└── vite.config.js # Configuración Vite



---

## ▶️ Instalación y ejecución

### 1. Clonar el repositorio

git clone https://github.com/tuusuario/chatbot-tutor-admin.git
cd admin-panel-react
2. Instalar dependencias
bash
Copiar
Editar
npm install
3. Ejecutar en modo desarrollo
bash
Copiar
Editar
npm run dev
La app se abrirá en: http://localhost:5173

⚙️ Variables de entorno
Crea un archivo .env en la raíz con el siguiente contenido:

env
Copiar
Editar
VITE_API_URL=http://localhost:8000/api
VITE_BOT_NAME=Tutor Virtual
🛠️ Compilación para producción
bash
Copiar
Editar
npm run build
🧪 Pruebas
bash
Copiar
Editar
npm run test
Incluye pruebas con Vitest + Testing Library para:

Formularios

Hooks

Rutas protegidas

Sidebar y modales

📦 Despliegue
Este proyecto está listo para ser desplegado en:

Railway

Vercel

GitHub Pages (con ajuste de base: './')

Docker (con nginx)

📜 Licencia
MIT © 2025 – Proyecto educativo SENA

🤝 Autores
Daniel Martínez
Ferreenvíos & Suministros – Tutor Virtual Zajuna
Desarrollado con ❤️ para formación técnica en Colombia.
