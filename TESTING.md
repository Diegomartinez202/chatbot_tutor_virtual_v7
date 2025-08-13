# TESTING / Pruebas rápidas

## 1) Variables (frontend Vite)
Crea `frontend/.env.local`:
VITE_ALLOWED_HOST_ORIGINS=https://app.zajuna.edu,http://localhost:5173
VITE_ZAJUNA_LOGIN_URL=https://zajuna.edu/login
VITE_CHAT_REST_URL=/api/chat

En Railway (servicio frontend), define las mismas VITE_*.

## 2) Arranque local
- Backend FastAPI: `uvicorn backend.main:app --reload --port 8000`
- Rasa: en `rasa/`:
  - `rasa train`
  - `rasa run --enable-api -p 5005`
  - `rasa run actions -p 5055`
- Frontend: `npm run dev` o `pnpm dev`

## 3) Handshake de auth (embed)
En el **host** (página que inyecta el widget):
```html
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
Abre el launcher → el iframe pedirá auth:needed cuando un intent privado sea solicitado (ej. “ver certificados”) → el host responde con auth:token y el bot responde contenido real.

4) cURL
chmod +x scripts/curl_examples.sh

Backend proxy: MODE=backend ./scripts/curl_examples.sh A

Directo a Rasa: MODE=rasa ./scripts/curl_examples.sh B

5) Screenshots sugeridas
Launcher con badge (no leídos).

Vista embed (/chat-embed.html?embed=1).

Flujo soporte_form completado.

Intent privado pidiendo login (botón “Iniciar sesión”).

Intent privado con token (respuesta real).

6) Railway
Servicio backend: expone /api/chat y /chat-embed.html.

Servicio actions (si separado): define ACTIONS_URL en endpoints.yml como http://action_server:5055/webhook (o usa variable).

Frontend: define VITE_*.

---

## ¿Algo más?
- **Dónde ubicarlos**
  - Env vars: `frontend/.env.local` (y en Railway → Variables del servicio frontend).
  - Action: `rasa/actions/actions.py`
  - Script cURL: `scripts/curl_examples.sh`
  - README de pruebas: `TESTING.md` (raíz)
- **Listo para hoy**: con esto pruebas embed sin login, gating por token para intents privados y los dos flujos de cURL. Si luego tu proxy valida JWT y agrega `metadata.auth.claims`, la `action_check_auth` ya lo contempla.