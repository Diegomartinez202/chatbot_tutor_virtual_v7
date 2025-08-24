// src/services/authApi.js
import axiosClient from "@/services/axiosClient";

/**
 * Endpoints por defecto. Ajusta nombres si tu backend usa otros paths.
 * Ejemplos comunes:
 *  - /auth/login
 *  - /auth/me
 *  - /auth/register
 *  - /auth/forgot-password
 *  - /auth/reset-password
 */
export const ENDPOINTS = {
    login: "/auth/login",
    me: "/auth/me",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
};

/** Persiste token en axios y localStorage (no interfiere con tu AuthContext). */
export function setAuthToken(token) {
    if (!token) return;
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    try {
        localStorage.setItem("auth_token", token);
    } catch { }
}

export function clearAuthToken() {
    delete axiosClient.defaults.headers.common.Authorization;
    try {
        localStorage.removeItem("auth_token");
    } catch { }
}

/** Login con credenciales. Devuelve { token, profile? } según backend. */
export async function login({ email, password }) {
    const { data } = await axiosClient.post(ENDPOINTS.login, { email, password });
    const token =
        data?.access_token ?? data?.token ?? data?.jwt ?? data?.data?.access_token ?? null;
    if (token) setAuthToken(token);
    return { token, raw: data };
}

/** SSO: ya tienes el token → set y valida con /auth/me. */
export async function loginWithToken(token) {
    if (!token) throw new Error("Token inválido");
    setAuthToken(token);
    const profile = await me();
    return { token, profile };
}

/** Perfil de usuario. Estructura flexible: rol puede ser 'rol' o 'role'. */
export async function me() {
    const { data } = await axiosClient.get(ENDPOINTS.me);
    return data; // { email, rol|role, ... }
}

/** Registro. Cambia payload según tu API. */
export async function register(payload) {
    // payload { name, email, password } u otros campos
    const { data } = await axiosClient.post(ENDPOINTS.register, payload);
    return data;
}

/** Enviar correo de recuperación. */
export async function forgotPassword({ email }) {
    const { data } = await axiosClient.post(ENDPOINTS.forgotPassword, { email });
    return data;
}

/** Resetear contraseña (si tu flujo lo usa). */
export async function resetPassword({ token, password }) {
    const { data } = await axiosClient.post(ENDPOINTS.resetPassword, { token, password });
    return data;
}

export default {
    ENDPOINTS,
    setAuthToken,
    clearAuthToken,
    login,
    loginWithToken,
    me,
    register,
    forgotPassword,
    resetPassword,
};