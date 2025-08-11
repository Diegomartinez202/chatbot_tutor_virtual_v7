// src/services/chat/connectRasaRest.js
import { API_BASE_URL, STORAGE_KEYS } from "@/lib/constants";

/**
 * Healthcheck simple contra tu backend (alias a Rasa).
 * GET {API_BASE_URL}/chat/health  → { status: "ok" } esperado.
 *
 * Opcional: puedes pasar { baseUrl, token } para overrides.
 */
export async function connectRasaRest(opts = {}) {
    const base = (opts.baseUrl || API_BASE_URL || "").replace(/\/$/, "");
    const url = `${base}/chat/health`;

    const headers = {};
    const token =
        opts.token ||
        (typeof localStorage !== "undefined"
            ? localStorage.getItem(STORAGE_KEYS?.accessToken || "accessToken")
            : null);
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers,
    });

    if (!res.ok) {
        throw new Error(`Healthcheck failed: ${res.status}`);
    }

    // Esperamos { status: "ok" } pero toleramos otros formatos
    const data = await res.json().catch(() => ({}));
    if (data && data.status && String(data.status).toLowerCase() === "ok") {
        return true;
    }
    // si el endpoint no devuelve "ok" exacto, igualmente consideramos "ready"
    return true;
}

/**
 * Envía un mensaje de usuario a Rasa vía backend.
 * POST {API_BASE_URL}/chat
 * body: { sender, message, metadata? }
 *
 * Rasa suele responder un array: [{ text?, image?, buttons?, custom? }, ...]
 * Devolvemos ese array tal cual, para que la UI decida cómo renderizar.
 */
export async function sendRasaMessage({ text, sender, metadata, baseUrl, token } = {}) {
    if (!text || !String(text).trim()) {
        throw new Error("Mensaje vacío");
    }
    const base = (baseUrl || API_BASE_URL || "").replace(/\/$/, "");
    const url = `${base}/chat`;

    const headers = { "Content-Type": "application/json" };
    const authToken =
        token ||
        (typeof localStorage !== "undefined"
            ? localStorage.getItem(STORAGE_KEYS?.accessToken || "accessToken")
            : null);
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const body = {
        sender: sender || getOrCreateSenderId(),
        message: text,
        ...(metadata ? { metadata } : {}),
    };

    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`Error ${res.status}: ${msg || "al enviar mensaje"}`);
    }

    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
}

// ——— Helpers ———
const SENDER_KEY = "chat_sender_id";
function getOrCreateSenderId() {
    try {
        const existing = localStorage.getItem(SENDER_KEY);
        if (existing) return existing;
        const id = `web-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
        localStorage.setItem(SENDER_KEY, id);
        return id;
    } catch {
        // Fallback no persistente
        return `web-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    }
}