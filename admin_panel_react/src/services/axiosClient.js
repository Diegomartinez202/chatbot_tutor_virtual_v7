// src/services/axiosClient.js

import axios from "axios";
import { getAuthHelper } from "@/services/authHelper";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    timeout: 10000,
    withCredentials: true, // ⬅️ necesario para enviar refresh_token httpOnly
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
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
                const { logout } = getAuthHelper?.() || {};
                if (logout) await logout();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;