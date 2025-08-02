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

/**
 * Obtiene la lista de logs almacenados (con filtros aplicables desde el backend).
 */
export const getLogsList = () =>
    apiClient.get("/admin/logs").then(res => res.data);

/**
 * Descarga un archivo .log específico en formato binario.
 * @param {string} filename - Nombre del archivo log a descargar.
 */
export const downloadLogFile = (filename) =>
    apiClient.get(`/admin/logs/${filename}`, {
        responseType: "blob"
    }).then(res => res.data);

/**
 * Exporta todos los logs del sistema como archivo CSV.
 */
export const exportLogsCSV = () =>
    apiClient.get("/admin/logs/export", {
        responseType: "blob"
    }).then(res => res.data);

// Exportar el cliente por defecto (opcional si lo necesitas en pruebas manuales)
export { default as axios } from "@/services/axiosClient";

/**
 * Obtiene el contenido del archivo logs del sistema completo.
 */
export const getSystemLogs = async () => {
    const res = await fetch("http://localhost:8000/api/admin/logs-file", {
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

/**
 * Obtiene todas las estadísticas del sistema para StatsChart.jsx
 */
export const getStats = () =>
    apiClient.get("/admin/stats").then(res => res.data);

/**
 * Obtiene estadísticas de exportaciones CSV por día.
 */
export const getExportStats = () =>
    apiClient.get("/admin/logs/exports").then(res => res.data);