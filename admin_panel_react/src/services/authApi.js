// src/services/authApi.js
import axiosClient from "./axiosClient";
import { setToken, clearToken, setRefreshToken } from "./tokenStorage";

// Ajusta aquí si tu backend usa endpoints distintos
const PATHS = {
    login: ["/auth/login", "/login"],
    me: ["/auth/me", "/me"],
    refresh: [
        // Prioridad: cookie httpOnly (GET)
        { method: "GET", url: "/auth/refresh" },
        // Alternativas POST (con refresh_token)
        { method: "POST", url: "/auth/refresh" },
        { method: "POST", url: "/auth/token/refresh" },
    ],
    logout: ["/auth/logout", "/logout"],
};

function pickFirst(arr) {
    return Array.isArray(arr) ? arr[0] : arr;
}

// ————————————————————————————————
// Token helpers
// ————————————————————————————————
export function setAuthToken(token) {
    if (!token) return;
    setToken(token);
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}
export function clearAuthToken() {
    clearToken();
    delete axiosClient.defaults.headers.common.Authorization;
}

// ————————————————————————————————
// Auth API
// ————————————————————————————————
export async function login({ email, password }) {
    const url = pickFirst(PATHS.login);
    const { data } = await axiosClient.post(url, { email, password });
    const token =
        data?.access_token || data?.token || data?.jwt || null;
    const refresh = data?.refresh_token || null;

    if (token) setAuthToken(token);
    if (refresh) setRefreshToken(refresh);

    return { token, refresh_token: refresh, raw: data };
}

export async function loginWithToken(token) {
    setAuthToken(token);
    // Si quieres validar el token inmediatamente:
    // await me();
    return { ok: true };
}

export async function me() {
    for (const u of PATHS.me) {
        try {
            const { data } = await axiosClient.get(u);
            return data;
        } catch { }
    }
    throw new Error("No se pudo obtener el perfil.");
}

export async function refresh(refreshTokenMaybe) {
    // 1) Cookie httpOnly (GET /auth/refresh)
    try {
        const { data } = await axiosClient.get(PATHS.refresh[0].url);
        const newTk =
            data?.access_token || data?.token || null;
        if (newTk) {
            setAuthToken(newTk);
            return { token: newTk, raw: data };
        }
    } catch { }

    // 2) POST con refresh_token si lo tienes
    const candidates = PATHS.refresh.slice(1);
    for (const cand of candidates) {
        try {
            const body = refreshTokenMaybe
                ? { refresh_token: refreshTokenMaybe }
                : {}; // si el backend también acepta cookie aquí
            const { data } = await axiosClient.post(cand.url, body);
            const newTk =
                data?.access_token || data?.token || null;
            const newRefresh = data?.refresh_token || null;

            if (newTk) {
                setAuthToken(newTk);
                if (newRefresh) setRefreshToken(newRefresh);
                return { token: newTk, raw: data };
            }
        } catch { }
    }

    // Si llegamos aquí, no hubo refresh
    clearAuthToken();
    throw new Error("Refresh inválido");
}

export async function logout() {
    try {
        const url = pickFirst(PATHS.logout);
        await axiosClient.post(url);
    } catch { }
    clearAuthToken();
    return { ok: true };
}

// Alias por compatibilidad con tu código actual
export const apiLogin = login;
export const apiMe = me;
