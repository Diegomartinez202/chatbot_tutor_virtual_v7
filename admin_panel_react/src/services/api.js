import axiosClient from "./axiosClient";

// -----------------------------
// 📁 INTENTS
// -----------------------------

export const fetchIntents = () => axiosClient.get("/admin/intents");

export const fetchIntentsByFilters = ({ intent, example, response }) => {
    const query = new URLSearchParams();
    if (intent) query.append("intent", intent);
    if (example) query.append("example", example);
    if (response) query.append("response", response);
    return axiosClient.get(`/admin/intents?${query.toString()}`);
};

export const addIntent = (intentData) => axiosClient.post("/admin/intents", intentData);

export const removeIntent = (intentName) =>
    axiosClient.delete(`/admin/intents/${intentName}`);

export const uploadIntentJSON = (data) =>
    axiosClient.post("/admin/intents/upload-json", data);

export const uploadIntentsCSV = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/admin/intents/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const exportIntentsCSV = () =>
    axiosClient.get("/admin/intents/export", { responseType: "blob" });

// -----------------------------
// 📁 ENTRENAMIENTO
// -----------------------------

export const trainBot = () => axiosClient.post("/admin/train");

// -----------------------------
// 📁 USUARIOS
// -----------------------------

export const fetchUsers = () => axiosClient.get("/admin/users");

export const deleteUser = (userId) =>
    axiosClient.delete(`/admin/users/${userId}`);

export const updateUser = (userId, userData) =>
    axiosClient.put(`/admin/users/${userId}`, userData);

export const createUser = (userData) =>
    axiosClient.post("/admin/users", userData);

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

export const login = (credentials) => axiosClient.post("/auth/login", credentials);
export const refreshToken = () => axiosClient.post("/auth/refresh");
export const register = (userData) => axiosClient.post("/auth/register", userData);

// -----------------------------
// 📁 DIAGNÓSTICO / TEST
// -----------------------------

export const ping = () => axiosClient.get("/ping");
export const testIntents = () => axiosClient.get("/admin/intents/test");

// -----------------------------
// 📁 LOGS
// -----------------------------

export const getLogsList = () =>
    axiosClient.get("/admin/logs").then(res => res.data);

export const downloadLogFile = (filename) =>
    axiosClient.get(`/admin/logs/${filename}`, { responseType: "blob" }).then(res => res.data);

export const exportLogsCSV = () =>
    axiosClient.get("/admin/logs/export", { responseType: "blob" }).then(res => res.data);

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

export async function getStats(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await axiosClient.get(`/admin/stats${query ? "?" + query : ""}`);
    return res.data;
}

// -----------------------------
// 📤 EXPORTACIONES CSV
// -----------------------------

// ✅ Exportar CSV con filtros
export const exportarCSV = (desde, hasta) => {
    const params = {};
    if (desde) params.desde = desde.toISOString();
    if (hasta) params.hasta = hasta.toISOString();
    return axiosClient.get("/admin/exportaciones", { params }).then((res) => res.data);
};

// ✅ Obtener historial con filtros (usuario / tipo)
export const fetchHistorialExportaciones = ({ usuario, tipo } = {}) =>
    axiosClient
        .get("/admin/exportaciones/historial", { params: { usuario, tipo } })
        .then((res) => res.data);

// -----------------------------
// 📉 INTENTS FALLIDOS
// -----------------------------

export const getFallbackLogs = () =>
    axiosClient.get("/admin/intents/failures").then(res => res.data);

export const getTopFailedIntents = () =>
    axiosClient.get("/admin/intents/failures/top").then(res => res.data);

// -----------------------------
// 🔁 UTILIDADES
// -----------------------------

export const restartServer = () => axiosClient.post("/admin/restart");

export const exportTestResults = async () => {
    const res = await axiosClient.get("/admin/export-tests", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "resultados_diagnostico.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
};

// 🌐 Default export opcional
export { default as axios } from "@/services/axiosClient";