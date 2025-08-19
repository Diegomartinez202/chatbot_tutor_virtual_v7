# Embed Guide — Chatbot Tutor Virtual

Esta guía explica cómo **incrustar** el chatbot en sitios externos (p.ej. **Zajuna**) usando:
- el **launcher** público (`public/chat-widget.js`, botón flotante + panel con iframe), y
- la página **canónica de embed** (`public/chat-embed.html`).

Incluye **snippets con entidades HTML** para que tu editor no los trate como JSX/TSX.

---

## Archivos relevantes (frontend)

- `public/chat-widget.js` → launcher público (botón flotante + panel con iframe + postMessage seguro).
- `public/chat-embed.html` → contenedor canónico del chat (iframe → `/chat?embed=1`).
- `public/bot-avatar.png`, `public/bot-loading.png`, `public/favicon.ico`, `public/site.webmanifest`.

> **Importante:** `chat-embed.html` requiere `?src=/chat?embed=1` para renderizar tu Chat real en modo embed.

---

## Variables de entorno (frontend)

**Transporte:**
- `VITE_CHAT_TRANSPORT=rest` **o** `ws`
- `VITE_RASA_WS_URL=wss://tu-servidor-de-rasa/ws` (si `ws`)
- `VITE_CHAT_REST_URL=/api/chat` (proxy REST a backend)

**Seguridad postMessage:**
- `VITE_ALLOWED_HOST_ORIGINS=https://app.zajuna.edu,http://localhost:5173`

**Avatares:**
- `VITE_BOT_AVATAR=/bot-avatar.png`
- `VITE_USER_AVATAR=/user-avatar.png` (opcional)

---

## Backend (resumen)

- **CSP/iframe**: usar `FRAME_ANCESTORS`, `EMBED_ALLOWED_ORIGINS`, `FRONTEND_SITE_URL`, `EMBED_ENABLED=true`.
- **CORS**: `ALLOWED_ORIGINS` debe incluir los dominios que **incrustan** el widget.
- **Rutas públicas**: `/chat-embed.html` y assets deben servirse desde el dominio del frontend.

---

## 1) Launcher (botón flotante) — *snippet seguro (entidades HTML)*

**Para producción**, reemplaza `&lt;` por `<` y `&gt;` por `>`.

**[INICIO]**
```html
&lt;script src="/chat-widget.js"
         data-chat-url="/chat-embed.html?src=%2Fchat%3Fembed%3D1&amp;w=380px&amp;h=560px&amp;title=Chatbot%20Tutor&amp;avatar=%2Fbot-avatar.png"
         data-avatar="/bot-avatar.png"
         data-title="Abrir chat"
         data-position="bottom-right"
         data-panel-width="380px"
         data-panel-height="560px"
         data-allowed-origins="https://tu-sitio.com,https://app.zajuna.edu"
         data-login-url="https://zajuna.edu/login"
         data-badge="auto"
         defer&gt;&lt;/script&gt;
[FIN]

Notas:

data-chat-url DEBE llevar src=/chat?embed=1 (URL-encoded) para cargar el chat real dentro del chat-embed.html.

data-allowed-origins debe contener el origin donde corre el iframe (y el del panel si es otro).

data-login-url habilita SSO/redirect si no hay token disponible.

data-badge="auto" activa contador de no leídos.

2) Embed directo (iframe) — snippet seguro (entidades HTML)
[INICIO]

html
Copiar
Editar
&lt;iframe
  src="/chat-embed.html?src=%2Fchat%3Fembed%3D1&amp;w=380px&amp;h=560px"
  title="Chatbot"
  allow="clipboard-write"
  referrerpolicy="no-referrer"
  sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
  style="width:380px;height:560px;border:0;border-radius:16px;overflow:hidden"&gt;
&lt;/iframe&gt;
[FIN]

3) Handshake de autenticación (cómo funciona)
El iframe envía: postMessage({ type: "auth:needed" }).

El launcher intenta resolver un token (ej.: window.getZajunaToken(), window.ZAJUNA_TOKEN, localStorage.zajuna_token).

Si existe, responde: postMessage({ type: "auth:token", token }).

Si no hay token y existe data-login-url, el launcher redirige a ?redirect=<url-actual>.

Requisitos:

VITE_ALLOWED_HOST_ORIGINS (frontend) y CSP/iframe (backend) deben permitir tu dominio anfitrión.

El backend acepta Authorization: Bearer <token> en /api/chat.

4) Transporte (REST / WebSocket)
REST (default)
VITE_CHAT_TRANSPORT=rest
VITE_CHAT_REST_URL=/api/chat

WS
VITE_CHAT_TRANSPORT=ws
VITE_RASA_WS_URL=wss://tu-servidor-de-rasa/ws

El ChatUI y el launcher seleccionan transporte por VITE_CHAT_TRANSPORT.

5) Smoke test (rápido)
Dev: npm run dev → abre http://localhost:5173/chat (envía un mensaje).

Embed: http://localhost:5173/chat-embed.html?src=/chat%3Fembed%3D1.

Launcher externo: pega el snippet del punto 1 en una página simple y verifica:

Botón visible.

Al clic: se abre panel con iframe.

data-badge="auto" muestra no leídos.

6) Problemas comunes
El editor muestra errores JSX/TSX: usa estos snippets con entidades HTML, no como código fuente.

No carga el iframe: revisa CSP (FRAME_ANCESTORS, EMBED_ALLOWED_ORIGINS).

401/403 al enviar mensajes: el host debe pasar auth:token o permitir modo anónimo.

No aparece badge: usa data-badge="auto" y revisa postMessage y orígenes (allowed-origins correctos).

7) Tabla de atributos del launcher (chat-widget.js)
Atributo	Tipo	Default	Descripción
data-chat-url	string	/chat-embed.html?src=%2Fchat%3Fembed%3D1	URL del embed a cargar en el panel. Incluye src (URL-encoded).
data-avatar	string	/bot-avatar.png	Imagen del botón flotante.
data-title	string	Abrir chat	Texto accesible/tooltip del botón.
data-position	string	bottom-right	bottom-right o bottom-left.
data-size	number	64	Tamaño (px) del botón.
data-offset	number	24	Separación al borde (px).
data-z-index	number	2147483600	Z-index del launcher.
data-panel-width	string	380px	Ancho del panel.
data-panel-height	string	560px	Alto del panel.
data-overlay	boolean	true	Fondo semitransparente al abrir.
data-close-on-esc	boolean	true	Cerrar con tecla Escape.
data-iframe-title	string	Chat	Atributo title del iframe.
data-allow	string	clipboard-write	allow del iframe.
data-sandbox	string	allow-scripts allow-forms allow-same-origin allow-popups	Sandbox del iframe.
data-allowed-origins	csv	[] (usa origin del iframe si vacío)	Orígenes autorizados para postMessage.
data-login-url	string	""	URL de login (SSO) si falta token.
data-badge	string/num	""	"" (off), "auto" (no leídos) o número fijo.
data-autoinit	boolean	true	Monta automáticamente al cargar el script.

8) Checklist producción
CSP FRAME_ANCESTORS / EMBED_ALLOWED_ORIGINS actualizados con dominios externos.

CORS ALLOWED_ORIGINS permite llamadas desde panel/launcher.

FRONTEND_SITE_URL apunta al panel que sirve /chat-embed.html y assets.

.env frontend: transporte (rest/ws) y URLs correctas.

Handshake de login probado (auth:token → backend).

Tests E2E / screenshots pasando en local y/o CI.

9) Capturas de ejemplo (opcional)
Coloca en docs/embed/:

launcher-closed.png

launcher-open.png

embed-standalone.png

mobile.png

badge.png

sso-redirect.png

Tip: con Playwright ya configurado, puedes guardar PNG con
page.screenshot({ path: "docs/embed/launcher-open.png" }).

10) Parámetros de chat-embed.html (query)
chat-embed.html acepta estos parámetros; algunos se reenvían al iframe interno.

Parámetro	Tipo	Default	Ejemplo	¿Se reenvía al iframe?	Descripción
src	string	/chat?embed=1	/chat%3Fembed%3D1	✅	Origen del chat interno (absoluto o relativo). Obligatorio para ver el chat real.
w	string	380px	92vw	❌	Ancho visual del wrapper externo.
h	string	560px	70vh	❌	Alto visual del wrapper externo.
api	string	—	https://backend.tuapp.com/api	✅	Base de API/Proxy si tu chat lo soporta.
user_id	string	—	alumno-123	✅	Identificador de usuario (tracking/sesión).
avatar	string	—	/bot-avatar.png	✅	Avatar del bot si el iframe interno lo soporta.

Ejemplos (entidades HTML):

Embed básico:

html
Copiar
Editar
&lt;iframe
  src="/chat-embed.html?src=%2Fchat%3Fembed%3D1&amp;w=380px&amp;h=560px"
  title="Chatbot"
  allow="clipboard-write"
  referrerpolicy="no-referrer"
  sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
  style="width:380px;height:560px;border:0;border-radius:16px;overflow:hidden"&gt;
&lt;/iframe&gt;
Con api y user_id:

html
Copiar
Editar
&lt;iframe
  src="/chat-embed.html?src=%2Fchat%3Fembed%3D1&amp;api=https%3A%2F%2Fbackend.tuapp.com%2Fapi&amp;user_id=alumno-123"
  title="Chatbot"
  allow="clipboard-write"
  referrerpolicy="no-referrer"
  sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
  style="width:380px;height:560px;border:0;border-radius:16px;overflow:hidden"&gt;
&lt;/iframe&gt;
Ancho/alto en viewport:

html
Copiar
Editar
&lt;iframe
  src="/chat-embed.html?src=%2Fchat%3Fembed%3D1&amp;w=92vw&amp;h=70vh"
  title="Chatbot"
  allow="clipboard-write"
  referrerpolicy="no-referrer"
  sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
  style="width:92vw;height:70vh;border:0;border-radius:16px;overflow:hidden"&gt;
&lt;/iframe&gt;
11) Telemetría (opcional)

Si quieres enviar eventos (p.ej. widget_opened, widget_closed, unread_count) a un endpoint propio:

a) Opción sin tocar el launcher: añade public/chat-telemetry.sample.js (ver más abajo) y cárgalo después del snippet del launcher. Ese script escucha postMessage y cambios de visibilidad.

b) Opción con mínima línea en el launcher (recomendada): dentro de public/chat-widget.js, emite eventos del DOM:

// dentro de open()
window.dispatchEvent(new CustomEvent("ctv:widget-opened"));
// dentro de close()
window.dispatchEvent(new CustomEvent("ctv:widget-closed"));
// cuando recibes chat:badge
window.dispatchEvent(new CustomEvent("ctv:badge", { detail: { count: data.count } }));


Luego, desde cualquier script del host:

window.addEventListener("ctv:widget-opened", () => navigator.sendBeacon("/telemetry", JSON.stringify({ e: "widget_opened" })));


Si prefieres, usa fetch o integra tu analytics favorito.


---

# ✅ 2) (Opcional) `public/zajuna-widget.js`

**Ruta:** `admin_panel_react/public/zajuna-widget.js`

```js
(() => {
  const s = document.currentScript?.dataset || {};
  const origin = (s.origin || window.location.origin).replace(/\/$/, "");
  const pathEmbed = s.pathEmbed || "/chat-embed.html";
  const chatSrc = s.chatSrc || "/chat?embed=1";
  const width = s.width || "380px";
  const height = s.height || "560px";
  const position = s.position === "left" ? "left" : "right";
  const title = s.title || "Chatbot Tutor Virtual";
  const allow = s.allow || "clipboard-write";
  const sandbox = s.sandbox || "allow-scripts allow-forms allow-same-origin allow-popups";
  const z = Number.isFinite(Number(s.zIndex)) ? Number(s.zIndex) : 9999;

  const url = `${origin}${pathEmbed}?src=${encodeURIComponent(chatSrc)}&w=${encodeURIComponent(width)}&h=${encodeURIComponent(height)}&title=${encodeURIComponent(title)}&avatar=${encodeURIComponent(s.avatar || "/bot-avatar.png")}`;

  const style = document.createElement("style");
  style.textContent = `
    .zj-launcher {
      position:fixed; ${position}:20px; bottom:20px; width:56px; height:56px;
      border-radius:999px; border:0; cursor:pointer; background:#2563eb; color:#fff;
      box-shadow:0 10px 20px rgba(0,0,0,.25); font-weight:600; z-index:${z+1};
    }
    .zj-frame {
      position:fixed; ${position}:20px; bottom:90px; width:${width}; height:${height};
      border:0; border-radius:16px; box-shadow:0 20px 40px rgba(0,0,0,.25);
      display:none; z-index:${z};
    }
    .zj-frame.open { display:block; }
    @media (max-width: 480px){
      .zj-frame { width:94vw; height:70vh; ${position}:3vw; }
    }
  `;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.className = "zj-launcher"; btn.type = "button";
  btn.setAttribute("aria-label", title); btn.textContent = "Chat";

  const iframe = document.createElement("iframe");
  iframe.className = "zj-frame"; iframe.title = title;
  iframe.src = url; iframe.allow = allow; iframe.sandbox = sandbox;

  btn.addEventListener("click", () => {
    const open = iframe.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.body.appendChild(btn);
  document.body.appendChild(iframe);
})();


Uso (en Zajuna):

<script
  src="https://TU-DOMINIO/zajuna-widget.js"
  data-origin="https://TU-DOMINIO"
  data-path-embed="/chat-embed.html"
  data-chat-src="/chat?embed=1"
  data-width="380px"
  data-height="560px"
  data-position="right"
  data-title="Chatbot Tutor Virtual SENA"
  data-avatar="/bot-avatar.png"
  defer
></script>

✅ 3) (Opcional) public/zajuna-widget.webc.js (Web Component)

Ruta: admin_panel_react/public/zajuna-widget.webc.js

class ChatbotTutorSena extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });

    const origin = (this.getAttribute("origin") || window.location.origin).replace(/\/$/, "");
    const pathEmbed = this.getAttribute("path-embed") || "/chat-embed.html";
    const chatSrc = this.getAttribute("chat-src") || "/chat?embed=1";
    const width = this.getAttribute("width") || "380px";
    const height = this.getAttribute("height") || "560px";
    const title = this.getAttribute("title") || "Chatbot Tutor Virtual";
    const allow = this.getAttribute("allow") || "clipboard-write";
    const sandbox = this.getAttribute("sandbox") || "allow-scripts allow-forms allow-same-origin allow-popups";
    const position = this.getAttribute("position") === "left" ? "left" : "right";

    const url = `${origin}${pathEmbed}?src=${encodeURIComponent(chatSrc)}&w=${encodeURIComponent(width)}&h=${encodeURIComponent(height)}&title=${encodeURIComponent(title)}&avatar=${encodeURIComponent(this.getAttribute("avatar") || "/bot-avatar.png")}`;

    const style = document.createElement("style");
    style.textContent = `
      :host { position:fixed; ${position}:20px; bottom:20px; z-index:9999; }
      .wrap { position:relative; }
      .launcher {
        position:absolute; ${position}:0; bottom:0; width:56px; height:56px;
        border-radius:999px; border:0; background:#2563eb; color:#fff; font-weight:600; cursor:pointer;
        box-shadow:0 10px 20px rgba(0,0,0,.25);
      }
      .frame {
        position:absolute; ${position}:0; bottom:70px; width:${width}; height:${height};
        border:0; border-radius:16px; display:none; background:#fff; box-shadow:0 20px 40px rgba(0,0,0,.25);
      }
      .frame.open { display:block; }
      @media (max-width: 480px){
        .frame { width:94vw; height:70vh; ${position}:0; }
      }
    `;

    const wrap = document.createElement("div"); wrap.className = "wrap";

    const btn = document.createElement("button");
    btn.className = "launcher"; btn.type = "button";
    btn.setAttribute("aria-label", title); btn.textContent = "Chat";

    const iframe = document.createElement("iframe");
    iframe.className = "frame"; iframe.title = title;
    iframe.src = url; iframe.allow = allow; iframe.sandbox = sandbox;

    btn.addEventListener("click", () => {
      const open = iframe.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    wrap.appendChild(btn);
    wrap.appendChild(iframe);
    root.appendChild(style);
    root.appendChild(wrap);
  }
}
customElements.define("chatbot-tutor-sena", ChatbotTutorSena);


Uso (en Zajuna):

<script src="https://TU-DOMINIO/zajuna-widget.webc.js" defer></script>
<chatbot-tutor-sena
  origin="https://TU-DOMINIO"
  path-embed="/chat-embed.html"
  chat-src="/chat?embed=1"
  width="380px"
  height="560px"
  title="Chatbot Tutor Virtual SENA"
  avatar="/bot-avatar.png"
></chatbot-tutor-sena>

✅ 4) (Opcional) Telemetría — public/chat-telemetry.sample.js

Ruta: admin_panel_react/public/chat-telemetry.sample.js

// Escucha eventos DOM (si añadiste los CustomEvent en chat-widget.js)
window.addEventListener("ctv:widget-opened", () => {
  try { navigator.sendBeacon("/telemetry", JSON.stringify({ e: "widget_opened", t: Date.now() })); } catch {}
});
window.addEventListener("ctv:widget-closed", () => {
  try { navigator.sendBeacon("/telemetry", JSON.stringify({ e: "widget_closed", t: Date.now() })); } catch {}
});
window.addEventListener("ctv:badge", (ev) => {
  try { navigator.sendBeacon("/telemetry", JSON.stringify({ e: "badge", count: ev.detail?.count ?? 0, t: Date.now() })); } catch {}
});

// Fallback: escucha postMessage desde el iframe (si no añadiste CustomEvent)
window.addEventListener("message", (ev) => {
  const d = ev.data || {};
  // Filtra por los tipos que usa tu launcher:
  if (d.type === "chat:visibility") {
    const e = d.open ? "widget_opened" : "widget_closed";
    try { navigator.sendBeacon("/telemetry", JSON.stringify({ e, t: Date.now() })); } catch {}
  }
  if (d.type === "chat:badge" && typeof d.count === "number") {
    try { navigator.sendBeacon("/telemetry", JSON.stringify({ e: "badge", count: d.count, t: Date.now() })); } catch {}
  }
});


Cómo usarlo (en Zajuna o en tu site):

<!-- tu launcher primero -->
<script src="/chat-widget.js" data-chat-url="/chat-embed.html?src=%2Fchat%3Fembed%3D1" defer></script>
<!-- luego telemetría -->
<script src="/chat-telemetry.sample.js" defer></script>


(Opcional) Mini patch dentro de public/chat-widget.js
Coloca estas líneas sin borrar nada:

// dentro de open():
window.dispatchEvent(new CustomEvent("ctv:widget-opened"));
// dentro de close():
window.dispatchEvent(new CustomEvent("ctv:widget-closed"));
// donde procesas chat:badge:
window.dispatchEvent(new CustomEvent("ctv:badge", { detail: { count: data.count } }));

📸 ¿Qué script corre “todas” las capturas?

Harness completo (si ya agregaste el script que te propuse):
npm run screenshots:harness

Solo chat kiosko desde PowerShell:
$env:SCREENSHOTS_ROUTES="/harness/chat-kiosk"; npm run screenshots

Suite normal (tus rutas por defecto):
npm run screenshots

(Ya eliminamos la duplicidad de screenshots:harness previamente.)