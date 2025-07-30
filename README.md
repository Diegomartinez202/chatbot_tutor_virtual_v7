# Chatbot Tutor Virtual v2

Proyecto modular para orientación automatizada con Rasa + FastAPI + MongoDB + Panel React.

## 🧩 Componentes
- `backend/`: API con FastAPI, conexión a MongoDB, servidor estático para widget.
- `rasa/`: Motor de IA conversacional con intents, actions y reglas.
- `admin-panel-react/`: Interfaz administrativa (React + Vite).
- `docker/`: Archivos para despliegue con Docker Compose.
- `static/widget/`: Widget embebido listo para plataformas como Zajuna.

## 🚀 Instrucciones básicas
```bash
bash run_full_stack.sh  # Inicia todo el sistema
📂 Documentación adicional
•	Manual de despliegue: DEPLOY.md
•	Scripts de entrenamiento y pruebas: train_rasa.sh, test_all.sh, etc.
________________________________________
yaml
CopiarEditar

---

### 📄 `run_full_rasa.sh`
```bash
#!/bin/bash

echo "🔄 Entrenando modelo Rasa..."
cd rasa
rasa train

echo "🚀 Levantando Rasa..."
rasa run --enable-api --cors "*" --port 5005 --debug
🔍 Explicación: Entrena y lanza el servidor de Rasa en localhost:5005.
