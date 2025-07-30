// src/services/axiosClient.js
import axios from "axios";
import { getAuthHelper } from "./authHelper"; // 🔁 Función auxiliar para logout (opcional)

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    timeout: 10000,
    withCredentials: true, // para que el refresh token via cookie funcione
});

let isRefreshing = false;
let failedQueue = [];

// ⏳ Reintentar solicitudes fallidas mientras se actualiza token
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// ✅ Interceptor de request: agrega token
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken"); // ⬅️ Consistente con login
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn("⚠️ No se encontró token en localStorage");
    }
    return config;
}, (error) => Promise.reject(error));

// ✅ Interceptor de respuesta: refresh automático si expira (401)
axiosClient.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                });
            }

            isRefreshing = true;
            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newToken = res.data.access_token;
                localStorage.setItem("accessToken", newToken);
                axiosClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);
                return axiosClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                console.error("🚫 Falló el refresh token:", err);

                // ⛔ Si tienes un helper de logout desde el contexto, lo ejecutas
                const { logout } = getAuthHelper?.() || {};
                if (logout) await logout();

                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        // 🧾 Log de errores generales
        console.error("❌ Error en respuesta de API:", error?.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default axiosClient;