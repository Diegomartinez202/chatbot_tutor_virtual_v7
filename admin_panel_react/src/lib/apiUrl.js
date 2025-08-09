// src/lib/apiUrl.js
import { API_BASE_URL } from "@/lib/constants";

/**
 * Une la base de la API con un path sin duplicar / ni romper si el path viene vacío.
 * - apiUrl() -> "https://api.tuapp.com"
 * - apiUrl("/auth/refresh") -> "https://api.tuapp.com/auth/refresh"
 * - apiUrl("auth/refresh")  -> "https://api.tuapp.com/auth/refresh"
 */
export function apiUrl(path = "") {
    const base = String(API_BASE_URL || "").replace(/\/+$/, "");
    const p = String(path || "").replace(/^\/+/, "");
    return p ? `${base}/${p}` : base;
}

/**
 * (Opcional) Une path + querystring desde un objeto de params.
 * Ej: buildUrl("/admin/logs", { page: 2, q: "hola" })
 * -> "https://api.tuapp.com/admin/logs?page=2&q=hola"
 */
export function buildUrl(path = "", params = {}) {
    const url = apiUrl(path);
    const qs = new URLSearchParams(
        Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
        )
    ).toString();
    return qs ? `${url}?${qs}` : url;
}