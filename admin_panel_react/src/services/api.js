// src/services/api.js
import axiosClient from "./axiosClient";

/* =========================
   Utils de descarga (CSV/Blob)
   ========================= */
function getFilenameFromCD(headers, fallback) {
    const cd = headers?.["content-disposition"];
    if (!cd) return fallback;
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
    try {
        const raw = decodeURIComponent(m?.[1] || m?.[2] || "");
        return raw || fallback;
    } catch {
        return fallback;
    }
}

function downloadBlob(blob, filename, addBom = false) {
    const finalBlob =
        addBom && blob.type?.startsWith("text/csv")
            ? new Blob(["\uFEFF", blob], { type: blob.type })
            : blob;

    const url = window.URL.createObjectURL(finalBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

/* =========================
   📁 INTENTS
   ========================= */
export const fetchIntents = () =>
    axiosClient.get("/admin/intents").then((r) => r.data);

// Alias retro (si en algún sitio usan getIntents)
export const getIntents = fetchIntents;

export const fetchIntentsByFilters = ({ intent, example, response }) => {
    const query = new URLSearchParams();
    if (intent) query.append("intent", intent);
    if (example) query.append("example", example);
    if (response) query.append("response", response);
    return axiosClient.get(`/admin/intents?${query.toString()}`).then((r) => r.data);
};

export const addIntent = (intentData) => axiosClient.post("/admin/intents", intentData);
export const removeIntent = (intentName) =>
    axiosClient.delete(`/admin/intents/${encodeURIComponent(intentName)}`);
export const uploadIntentJSON = (data) => axiosClient.post("/admin/intents/upload-json", data);

export const uploadIntentsCSV = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/admin/intents/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const exportIntentsCSV = async () => {
    const res = await axiosClient.get("/admin/intents/export", { responseType: "blob" });
    const filename = getFilenameFromCD(res.headers, "intents.csv");
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, filename, /* addBom */ true);
};

/* =========================
   📁 ENTRENAMIENTO
   ========================= */
export const trainBot = () => axiosClient.post("/admin/train");

/* =========================
   📁 USUARIOS
   ========================= */
export const fetchUsers = () =>
    axiosClient.get("/admin/users").then((r) => r.data);

// Alias retro (tu UI usaba getUsers)
export const getUsers = fetchUsers;

export const deleteUser = (userId) => axiosClient.delete(`/admin/users/${userId}`);
export const updateUser = (userId, userData) => axiosClient.put(`/admin/users/${userId}`, userData);
export const createUser = (userData) => axiosClient.post("/admin/users", userData);

export const exportUsersCSV = async () => {
    const res = await axiosClient.get("/admin/users/export", { responseType: "blob" });
    const filename = getFilenameFromCD(
        res.headers,
        `usuarios_exportados_${new Date().toISOString().slice(0, 10)}.csv`
    );
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, filename, /* addBom */ true);
};

/* =========================
   📁 AUTENTICACIÓN
   ========================= */
export const login = (credentials) => axiosClient.post("/auth/login", credentials);
export const refreshToken = () => axiosClient.post("/auth/refresh");
export const register = (userData) => axiosClient.post("/auth/register", userData);

/* =========================
   📁 DIAGNÓSTICO / TEST
   ========================= */
export const ping = () => axiosClient.get("/ping");
export const testIntents = () => axiosClient.get("/admin/intents/test");

/* =========================
   📁 LOGS
   ========================= */
export const getLogsList = () =>
    axiosClient.get("/admin/logs").then((res) => res.data);

export const downloadLogFile = async (filename) => {
    const res = await axiosClient.get(`/admin/logs/${encodeURIComponent(filename)}`, {
        responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, filename || "log.txt", /* addBom */ false);
};

export const exportLogsCSV = async () => {
    const res = await axiosClient.get("/admin/logs/export", { responseType: "blob" });
    const filename = getFilenameFromCD(res.headers, "logs.csv");
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, filename, /* addBom */ true);
};

export const getSystemLogs = async () => {
    const res = await axiosClient.get("/admin/logs-file", { responseType: "text" });
    return res.data;
};

/* =========================
   📊 ESTADÍSTICAS
   ========================= */
export async function getStats(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await axiosClient.get(`/admin/stats${query ? "?" + query : ""}`);
    return res.data;
}

/* =========================
   📤 EXPORTACIONES CSV
   ========================= */
export const exportarCSV = async (desde, hasta) => {
    const params = {};
    const asStr = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v || undefined);
    const d = asStr(desde);
    const h = asStr(hasta);
    if (d) params.desde = d;
    if (h) params.hasta = h;

    const res = await axiosClient.get("/admin/exportaciones", {
        params,
        responseType: "blob",
    });
    const nameRange = (d ? `_${d}` : "") + (h ? `_${h}` : "");
    const fallbackName = `exportacion_logs${nameRange || `_${new Date().toISOString().slice(0, 10)}`
        }.csv`;
    const filename = getFilenameFromCD(res.headers, fallbackName);
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, filename, /* addBom */ true);
};

export const fetchHistorialExportaciones = ({ usuario, tipo } = {}) =>
    axiosClient
        .get("/admin/exportaciones/historial", { params: { usuario, tipo } })
        .then((res) => res.data);

export const exportTestResults = async () => {
    const res = await axiosClient.get("/admin/exportaciones/tests", {
        responseType: "blob",
    });
    const filename = getFilenameFromCD(res.headers, "resultados_test.csv");
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, filename, /* addBom */ true);
};

/* =========================
   🔁 UTILIDADES
   ========================= */
export const restartServer = () => axiosClient.post("/admin/restart");

// 🌐 Default export opcional
export { default as axios } from "@/services/axiosClient";