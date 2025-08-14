# TESTING – Zajuna (FastAPI + Rasa + Frontend)

## 0) Requisitos
- Backend FastAPI corriendo y accesible.
- Rasa (webhook REST y actions) corriendo y accesible.
- `DEBUG=true` para habilitar `/chat/debug` (solo en entornos de prueba).
- `VITE_ALLOWED_HOST_ORIGINS` configurado en el frontend (CSV) para validar `postMessage`.

---

## 1) Variables (frontend Vite)
Crea `frontend/.env.local` (o configura en Railway → Variables):
VITE_ALLOWED_HOST_ORIGINS=https://app.zajuna.edu,http://localhost:5173
VITE_ZAJUNA_LOGIN_URL=https://zajuna.edu/login
VITE_CHAT_REST_URL=/api/chat

yaml
Copiar
Editar

---

## 2) Arranque local
```bash
# Backend FastAPI
uvicorn backend.main:app --reload --port 8000

# Rasa (en carpeta rasa/)
rasa train
rasa run --enable-api -p 5005
rasa run actions -p 5055

# Frontend
npm run dev  # o pnpm dev
3) Handshake de auth (embed)
En el host (página que inyecta el launcher):

html
Copiar
Editar
<script src="/chat-widget.js"
  data-chat-url="/chat-embed.html?embed=1"
  data-allowed-origins="http://localhost:5173"
  data-login-url="http://localhost:5173/login"
  data-badge="auto"></script>

<script>
  // simular login:
  localStorage.setItem("zajuna_token", "JWT_DE_PRUEBA");
  window.getZajunaToken = () => localStorage.getItem("zajuna_token");
</script>
Flujo esperado:

El iframe solicita contenido privado → emite auth:needed.

El host responde con auth:token (si encuentra token o redirige a login).

4) Health checks rápidos
Local
bash
Copiar
Editar
curl -sS http://localhost:8000/health | jq
curl -sS http://localhost:8000/chat/health | jq
curl -sS http://localhost:8000/chat/debug | jq   # requiere DEBUG=true
Railway
bash
Copiar
Editar
export BACKEND_URL="https://<backend>.railway.app"
curl -sS "$BACKEND_URL/health" | jq
curl -sS "$BACKEND_URL/chat/health" | jq
curl -sS "$BACKEND_URL/chat/debug" | jq   # si DEBUG=true
5) Smoke /api/chat (sin/con token)
SIN token → fuerza metadata.auth.hasToken=false hacia Rasa
bash
Copiar
Editar
curl -sS -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sender":"smoke","message":"/ver_certificados","metadata":{}}' | jq
CON token → fuerza metadata.auth.hasToken=true
bash
Copiar
Editar
TOKEN="<JWT_VALIDO>"
curl -sS -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer '"$TOKEN"'" \
  -H "Content-Type: application/json" \
  -d '{"sender":"smoke","message":"/ver_certificados","metadata":{}}' | jq
Tip: en ambos casos, revisa logs/system.log y busca rid=<X-Request-ID> para la correlación.

6) Verificación de X-Request-ID (end-to-end)
A) Desde cURL
bash
Copiar
Editar
curl -i -sS -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sender":"ridtest","message":"hola","metadata":{}}'
La respuesta no incluye el X-Request-ID en el body (está en logs y se propaga a Rasa).

Abre logs/system.log y busca el rid= en el timestamp del request.

B) Desde el navegador (DevTools)
Abre tu SPA (panel) o /chat-embed.html.

Network → envía un mensaje.

Abre la request a /api/chat (o /chat) y mira Request Headers:

X-Request-ID: <uuid>

Valida el mismo rid en logs/system.log.

7) Verificación del Badge (postMessage + orígenes)
A) Comportamiento esperado
El Header (parent) muestra <Badge mode="chat" />.

El iframe (ChatUI) emite:

postMessage({ type: "chat:badge", count }, parentOrigin) → sube el contador.

El launcher (parent) emite hacia el iframe:

postMessage({ type: "chat:visibility", open: true }, frameOrigin) → el iframe resetea su contador local; el Header también debe resetear su badge (porque el parent reenvía y el componente Badge escucha).

B) Simulación rápida (sin tocar código)
En consola del iframe:

js
Copiar
Editar
// ORIGEN del parent (ajústalo al del panel)
const parentOrigin = window.location !== window.parent.location
  ? (document.referrer && new URL(document.referrer).origin)
  : window.location.origin;

// Simula 5 sin leer
window.parent.postMessage({ type: "chat:badge", count: 5 }, parentOrigin);

// Simula apertura (reset)
window.parent.postMessage({ type: "chat:visibility", open: true }, parentOrigin);
C) Validación de orígenes
VITE_ALLOWED_HOST_ORIGINS debe incluir el origin del iframe o del parent según corresponda.

Nuestro launcher ya usa frameOrigin como targetOrigin y valida origin + source del iframe.

8) Capturas para el informe
Tamaño: 1440×900, zoom 100%.
Planos: vista completa y detalle.

Rutas:

/chat-embed (modo widget)

/chat (vista normal)

Secuencia:

Carrusel de cursos (cards)

Mensaje: /explorar_temas

Captura: 3 cards (Excel, Soldadura, Web) con “Inscribirme”.

Botones de recomendados

Continuar tras /explorar_temas

Captura: “Python Básico – Ago 2025” y “IA Educativa – Sep 2025”.

Quick replies / sugerencias

Cualquier intent que devuelva quick_replies.

Captura: chips horizontales.

Flujo privado (auth)

SIN token → /ver_certificados → “Iniciar sesión” (custom.type=auth_needed).

CON token → /ver_certificados → lista de certificados + botones.

9) Scripts Railway (opcional)
bash
Copiar
Editar
# Variables
export BACKEND_URL="https://<backend>.railway.app"
export RASA_URL="https://<rasa>.railway.app/webhooks/rest/webhook"
export ACTIONS_URL="https://<actions>.railway.app"
export DEBUG=true

# Health
bash scripts/railway/health.sh

# Smoke
bash scripts/railway/smoke_chat.sh   # ACCESS_TOKEN opcional
10) Problemas comunes
Badge no aparece

Verifica que el iframe emita postMessage (chat:badge).

Revisa VITE_ALLOWED_HOST_ORIGINS y que los orígenes coincidan (parent/iframe).

En el parent, loguea ev.origin y ev.data en el listener para depurar.

JWT inválido

Asegura JWT_ALGORITHM (HS vs RS) y claves (SECRET_KEY o JWT_PUBLIC_KEY).

El backend siempre fija metadata.auth.hasToken según Authorization.

No ves X-Request-ID

No va en el body; está en headers hacia Rasa y en logs (rid=).

bash
Copiar
Editar
