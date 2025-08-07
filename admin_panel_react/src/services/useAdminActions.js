// src/services/useAdminActions.js
import { useMutation } from "@tanstack/react-query";
import axiosClient from "./axiosClient";

// 🧠 Entrenar bot
const trainBot = () => axiosClient.post("/admin/train");

// ⬆️ Subir intents
const uploadIntents = () => axiosClient.post("/admin/upload");

// 🔁 Reiniciar servidor (simulado)
const restartServer = () => axiosClient.post("/admin/restart");

// 📤 Exportar resultados como CSV
const exportTestResults = () =>
    axiosClient.get("/admin/export-tests", { responseType: "blob" });

export function useAdminActions() {
    const trainMutation = useMutation({
        mutationFn: trainBot,
    });

    const uploadMutation = useMutation({
        mutationFn: uploadIntents,
    });

    const restartMutation = useMutation({
        mutationFn: restartServer,
    });

    const exportMutation = useMutation({
        mutationFn: async () => {
            try {
                const res = await exportTestResults();
                const blob = new Blob([res.data], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "resultados_diagnostico.csv";
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error("❌ Error al exportar resultados:", error);
            }
        },
    });

    return {
        trainMutation,
        uploadMutation,
        restartMutation,
        exportMutation,
    };
}