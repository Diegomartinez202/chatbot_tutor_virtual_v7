// src/services/chat/connectRasaRest.js

/**
 * URL base del REST proxy del backend (FastAPI) hacia Rasa.
 * - Por defecto usamos /api/chat (proxy recomendado).
 * - Puedes sobreescribir con VITE_CHAT_REST_URL (p.ej. https://backend.tuapp.com/api/chat)
 *   o pasando { baseUrl } a cada función.
 */
const DEFAULT_CHAT_URL =
    (import.meta?.env?.VITE_CHAT_REST_URL && String(import.meta.env.VITE_CHAT_REST_URL).trim()) ||
    "/api/chat";

/**
 * Healthcheck simple contra tu backend (alias a Rasa).
 * Intenta GET <baseUrl>/health y considera OK si responde 2xx.
 *
 * @param {Object} opts
 * @param {string} [opts.baseUrl]   - Base URL del chat (ej: "/api/chat" o "https://.../api/chat")
 * @param {string} [opts.token]     - Token Bearer para Authorization
 * @param {string} [opts.healthUrl] - URL absoluta para health, si no deriva de baseUrl
 * @returns {Promise<boolean>}
 */
export async function connectRasaRest(opts = {}) {
    const base = String(opts.baseUrl || DEFAULT_CHAT_URL).replace(/\/$/, "");
    const healthUrl =
        opts.healthUrl ||
        // si base termina en /chat → /chat/health, si no, añadimos /health igualmente
        `${base}${base.endsWith("/chat") ? "" : ""}/health`;

    const headers = {};
    const token =
        opts.token ||
        (typeof localStorage !== "undefined" ? localStorage.getItem("zajuna_token") : null);
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(healthUrl, { method: "GET", headers });
    if (!res.ok) throw new Error(`Healthcheck failed: ${res.status}`);

    // Aceptamos cualquier payload 2xx como "ready"
    return true;
}

/**
 * Envía un mensaje de usuario al backend (proxy REST) que a su vez reenvía a Rasa.
 * Por defecto POST a <baseUrl>, con body { sender, message, metadata }.
 * Adjunta Authorization: Bearer <token> si existe (zajuna_token).
 *
 * Rasa suele responder un array: [{ text?, image?, buttons?, quick_replies?, custom? }, ...]
 *
 * @param {Object} params
 * @param {string} params.text                  - Texto o payload ("/intent{...}")
 * @param {string} [params.sender]              - ID del usuario/sender
 * @param {Object} [params.metadata={}]         - Metadatos adicionales para tracker.latest_message.metadata
 * @param {string} [params.baseUrl]             - Override del endpoint (por defecto DEFAULT_CHAT_URL)
 * @param {string} [params.token]               - Override del token Bearer (si no, usa localStorage.zajuna_token)
 * @returns {Promise<Array>}                    - Array de mensajes Rasa
 */
export async function sendRasaMessage({ text, sender, metadata = {}, baseUrl, token } = {}) {
    if (!text || !String(text).trim()) {
        throw new Error("Mensaje vacío");
    }

    const host = String(baseUrl || DEFAULT_CHAT_URL).replace(/\/$/, "");
    const authToken =
        token ||
        (typeof localStorage !== "undefined" ? localStorage.getItem("zajuna_token") : null);

    const headers = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const body = {
        sender: sender || getOrCreateSenderId(),
        message: text,
        // Adjuntamos bandera de autenticación en metadata
        metadata: {
            ...metadata,
            auth: { hasToken: !!authToken },
        },
    };

    const res = await fetch(host, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`REST ${res.status}: ${msg || "error al enviar mensaje"}`);
    }

    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
}

// —— Helpers ——
const SENDER_KEY = "chat_sender_id";
function getOrCreateSenderId() {
    try {
        const existing = localStorage.getItem(SENDER_KEY);
        if (existing) return existing;
        const id = `web-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
        localStorage.setItem(SENDER_KEY, id);
        return id;
    } catch {
        // Fallback no persistente si localStorage no está disponible
        return `web-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    }
}