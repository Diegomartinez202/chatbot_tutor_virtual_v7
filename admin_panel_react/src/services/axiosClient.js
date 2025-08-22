// src/services/axiosClient.js
import axios from "axios";
import { STORAGE_KEYS } from "@/lib/constants";
import { apiBase, apiUrl } from "@/lib/apiUrl";

/** Base URL segura (normalizada) */
const BASE_URL = apiBase();

const axiosClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: true, // necesario para refresh_token httpOnly
});

// Aceptar JSON por defecto
axiosClient.defaults.headers.common.Accept = "application/json";

/* ─────────────────────────────────────────────────────────────
 * Manejo de refresh con cola para evitar condiciones de carrera
 * ────────────────────────────────────────────────────────────*/
let isRefreshing = false;
/** @type {Array<{resolve: (t:string)=>void, reject: (err:any)=>void}>} */
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
    failedQueue = [];
};

/* ─────────────────────────────────────────────────────────────
 * Interceptor de REQUEST
 * - Inyecta Authorization si hay token
 * - Ajusta Content-Type sólo si no es FormData
 * ────────────────────────────────────────────────────────────*/
axiosClient.interceptors.request.use(
    (config) => {
        // Header Authorization (si no viene explícito)
        try {
            if (!config.headers?.Authorization) {
                const token = localStorage.getItem(STORAGE_KEYS.accessToken);
                if (token) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch {
            // localStorage no disponible (SSR, iframes restringidos, etc.)
        }

        // Asegura Content-Type si mandamos JSON plano (no tocar FormData)
        if (config.data && typeof FormData !== "undefined" && !(config.data instanceof FormData)) {
            config.headers = config.headers || {};
            if (!config.headers["Content-Type"]) {
                config.headers["Content-Type"] = "application/json";
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/* ─────────────────────────────────────────────────────────────
 * Interceptor de RESPONSE
 * - Si 401/403 y no es /auth/refresh, intenta refrescar token
 * - En paralelo, encola solicitudes hasta que termine el refresh
 * ────────────────────────────────────────────────────────────*/
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Si no hay respuesta (network, CORS duro, etc.)
        if (!error?.response) return Promise.reject(error);

        const { config: originalRequest, response } = error;

        // Construye URL absoluta del refresh para comparar
        const refreshAbsolute = apiUrl("/auth/refresh");

        // Detecta si la request fallida es el refresh
        const originalAbs =
            ((originalRequest?.baseURL || "").replace(/\/$/, "")) + (originalRequest?.url || "");
        const isAuthRefreshCall =
            originalRequest?.url?.includes("/auth/refresh") || originalAbs === refreshAbsolute;

        // ¿Aplicamos refresh?
        const shouldTryRefresh =
            (response.status === 401 || response.status === 403) &&
            !originalRequest?._retry &&
            !isAuthRefreshCall;

        if (!shouldTryRefresh) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        // Si ya hay un refresh en progreso, encolamos esta solicitud
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers = originalRequest.headers || {};
                if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosClient(originalRequest);
            });
        }

        isRefreshing = true;

        try {
            // Hacemos el refresh con axios "plano" para evitar bucles con el propio cliente
            const res = await axios.post(refreshAbsolute, {}, { withCredentials: true });
            const newToken = res?.data?.access_token;
            if (!newToken) throw new Error("No se recibió access_token en el refresh.");

            // Persistimos y seteamos el header por defecto
            try {
                localStorage.setItem(STORAGE_KEYS.accessToken, newToken);
            } catch { }
            axiosClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;

            // Despierta la cola
            processQueue(null, newToken);

            // Repite la request original con el nuevo token
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
        } catch (err) {
            // Falla el refresh: limpiamos token y rechazamos todo
            processQueue(err, null);
            try {
                localStorage.removeItem(STORAGE_KEYS.accessToken);
            } catch { }
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }
);

/* ─────────────────────────────────────────────────────────────
 * Utilidades opcionales (por si quieres usarlas en otros módulos)
 * ────────────────────────────────────────────────────────────*/

/** Fija el token manualmente en el cliente y en localStorage. */
export function setAuthToken(token) {
    try {
        if (token) {
            localStorage.setItem(STORAGE_KEYS.accessToken, token);
            axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            localStorage.removeItem(STORAGE_KEYS.accessToken);
            delete axiosClient.defaults.headers.common.Authorization;
        }
    } catch {
        // localStorage puede no estar disponible
        if (token) {
            axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            delete axiosClient.defaults.headers.common.Authorization;
        }
    }
}

/** Limpia el token (helper) */
export function clearAuthToken() {
    setAuthToken(null);
}

export default axiosClient;