// src/services/axiosClient.js
import axios from "axios";
import { STORAGE_KEYS } from "@/lib/constants";
import { apiUrl } from "@/lib/apiUrl";

const axiosClient = axios.create({
    baseURL: apiUrl(),     // base normalizada desde constants/env
    timeout: 10000,
    withCredentials: true, // para refresh_token httpOnly
});

// Aceptar JSON por defecto
axiosClient.defaults.headers.common.Accept = "application/json";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
    failedQueue = [];
};

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.accessToken);
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
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
        const refreshUrl = apiUrl("/auth/refresh");

        const isAuthRefreshCall =
            originalRequest?.url?.includes("/auth/refresh") ||
            ((originalRequest?.baseURL || "") + originalRequest?.url === refreshUrl);

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
            // refresh sin interceptores para evitar loop
            const res = await axios.post(refreshUrl, {}, { withCredentials: true });
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