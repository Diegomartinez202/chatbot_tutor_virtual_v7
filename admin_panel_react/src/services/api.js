import apiClient from "@/services/axiosClient";

// -----------------------------
// 📁 INTENTS
// -----------------------------

export const fetchIntents = () => apiClient.get("/admin/intents");

export const fetchIntentsByFilters = ({ intent, example, response }) => {
    const query = new URLSearchParams();
    if (intent) query.append("intent", intent);
    if (example) query.append("example", example);
    if (response) query.append("response", response);
    return apiClient.get(`/admin/intents?${query.toString()}`);
};

export const addIntent = (intentData) => apiClient.post("/admin/intents", intentData);
export const removeIntent = (intentName) => apiClient.delete(`/admin/intents/${intentName}`);
export const uploadIntentJSON = (data) => apiClient.post("/admin/intents/upload-json", data);

export const uploadIntentsCSV = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/admin/intents/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const exportIntentsCSV = () =>
    apiClient.get("/admin/intents/export", {
        responseType: "blob",
    });

// -----------------------------
// 📁 ENTRENAMIENTO
// -----------------------------

export const trainBot = () => apiClient.post("/admin/train");

// -----------------------------
// 📁 USUARIOS
// -----------------------------

export const fetchUsers = () => apiClient.get("/admin/users");
export const deleteUser = (userId) => apiClient.delete(`/admin/users/${userId}`);
export const updateUser = (userId, userData) => apiClient.put(`/admin/users/${userId}`, userData);
export const createUser = (userData) => apiClient.post("/admin/users", userData); // opcional

export const exportUsersCSV = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/export`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    if (!response.ok) throw new Error("Error al exportar usuarios");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `usuarios_exportados_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
};

// -----------------------------
// 📁 AUTENTICACIÓN
// -----------------------------

export const login = (credentials) => apiClient.post("/auth/login", credentials);
export const refreshToken = () => apiClient.post("/auth/refresh");
export const register = (userData) => apiClient.post("/auth/register", userData); // opcional

// -----------------------------
// 📁 DIAGNÓSTICO / TEST
// -----------------------------

export const ping = () => apiClient.get("/ping");
export const testIntents = () => apiClient.get("/admin/intents/test");

// -----------------------------
// 📁 LOGS
// -----------------------------

export const getLogsList = () =>
    apiClient.get("/admin/logs").then(res => res.data);

export const downloadLogFile = (filename) =>
    apiClient.get(`/admin/logs/${filename}`, {
        responseType: "blob"
    }).then(res => res.data);

export const exportLogsCSV = () =>
    apiClient.get("/admin/logs/export", {
        responseType: "blob"
    }).then(res => res.data);

export const getSystemLogs = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/logs-file`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    const text = await res.text();
    return text;
};

// -----------------------------
// 📊 ESTADÍSTICAS
// -----------------------------

export const getStats = () =>
    apiClient.get("/admin/stats").then(res => res.data);

export const getExportStats = () =>
    apiClient.get("/admin/logs/exports").then(res => res.data);

// -----------------------------
// 🌐 Default export opcional
// -----------------------------

export { default as axios } from "@/services/axiosClient";
// 📉 Fallos de intents
export const getFallbackLogs = () =>
    apiClient.get("/admin/intents/failures").then(res => res.data);

export const getTopFailedIntents = () =>
    apiClient.get("/admin/intents/failures/top").then(res => res.data);