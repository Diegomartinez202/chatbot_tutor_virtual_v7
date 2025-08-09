// src/services/useAdminActions.js
import { useMutation } from "@tanstack/react-query";
import axiosClient from "./axiosClient";
import toast from "react-hot-toast";

// ✅ Entrenar bot
const trainBot = () => axiosClient.post("/admin/train");

// ✅ Subir intents
const uploadIntents = () => axiosClient.post("/admin/upload");

// ✅ Reiniciar servidor
const restartServer = () => axiosClient.post("/admin/restart");

// ✅ Exportar logs con filtros de fecha (CSV)
const exportLogsCsv = ({ desde, hasta }) =>
    axiosClient.get("/admin/exportaciones", {
        responseType: "blob",
        params: { desde, hasta },
    });

// (Opcional) Export específico de pruebas test_all.sh si lo usas en StatsPage
const exportTestsCsv = () =>
    axiosClient.get("/admin/exportaciones/tests", {
        responseType: "blob",
    });

// Util: tratar de obtener nombre de archivo del header
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

// Util: descargar blob con BOM opcional (para CSV UTF-8 en Excel)
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

export function useAdminActions() {
    const trainMutation = useMutation({ mutationFn: trainBot });
    const uploadMutation = useMutation({ mutationFn: uploadIntents });
    const restartMutation = useMutation({ mutationFn: restartServer });

    // ✅ Exportar logs (CSV) con fechas
    const exportMutation = useMutation({
        mutationFn: async ({ desde, hasta }) => {
            const res = await exportLogsCsv({ desde, hasta });

            // Si el servidor devolvió error JSON en vez de CSV, intenta leerlo
            const contentType = res.headers?.["content-type"] || "";
            if (contentType.includes("application/json")) {
                const text = await res.data.text?.();
                try {
                    const json = JSON.parse(text);
                    throw new Error(json?.detail || json?.message || "Error al exportar");
                } catch {
                    throw new Error("Error al exportar");
                }
            }

            const ts = new Date().toISOString().split("T")[0];
            const range =
                (desde ? `_${desde}` : "") + (hasta ? `_${hasta}` : "");
            const fallbackName = `exportacion_logs${range || `_${ts}`}.csv`;

            const filename = getFilenameFromCD(res.headers, fallbackName);
            const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
            downloadBlob(blob, filename, /* addBom */ true);
        },
        onSuccess: () => toast.success("✅ Exportación CSV completada"),
        onError: (err) => toast.error(err?.message || "❌ Error al exportar resultados"),
    });

    // (Opcional) Exportar CSV de tests (si lo usas)
    const exportTestsMutation = useMutation({
        mutationFn: async () => {
            const res = await exportTestsCsv();
            const filename = getFilenameFromCD(res.headers, "resultados_test.csv");
            const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
            downloadBlob(blob, filename, /* addBom */ true);
        },
        onSuccess: () => toast.success("✅ Export de tests listo"),
        onError: () => toast.error("❌ Error al exportar resultados de tests"),
    });

    return {
        trainMutation,
        uploadMutation,
        restartMutation,
        exportMutation,
        // expórtalo si lo necesitas en StatsPage
        exportTestsMutation,
    };
}