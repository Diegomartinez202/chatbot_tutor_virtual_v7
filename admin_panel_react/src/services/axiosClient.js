// src/services/axiosClient.js
import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "@/lib/constants";

const BASE_URL = API_BASE_URL; // soporta VITE_API_BASE_URL o VITE_API_URL
const REFRESH_URL = `${BASE_URL.replace(/\/$/, "")}/auth/refresh`;

const axiosClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: true // necesario para enviar refresh_token httpOnly
});

// Aceptar JSON por defecto
axiosClient.defaults.headers.common.Accept = "application/json";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.accessToken); // ✅ siempre accessToken
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`; // ✅ Bearer <accessToken>
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!error?.response) return Promise.reject(error);

        const { config: originalRequest, response } = error;

        const isAuthRefreshCall =
            originalRequest?.url?.includes("/auth/refresh") ||
            (originalRequest?.baseURL || "") + originalRequest?.url === REFRESH_URL;

        const shouldTryRefresh =
            (response.status === 401 || response.status === 403) &&
            !originalRequest?._retry &&
            !isAuthRefreshCall;

        if (!shouldTryRefresh) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosClient(originalRequest);
            });
        }

        isRefreshing = true;

        try {
            // Usamos axios sin interceptores para evitar bucle
            const res = await axios.post(REFRESH_URL, {}, { withCredentials: true });
            const newToken = res?.data?.access_token;

            if (!newToken) throw new Error("No se recibió access_token en el refresh.");

            localStorage.setItem(STORAGE_KEYS.accessToken, newToken);
            axiosClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
        } catch (err) {
            processQueue(err, null);
            localStorage.removeItem(STORAGE_KEYS.accessToken);
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosClient;