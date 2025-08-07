// src/services/useAdminActions.js
import { useMutation } from "@tanstack/react-query";
import axiosClient from "./axiosClient";

// ✅ Entrenar bot
const trainBot = () => axiosClient.post("/admin/train");

// ✅ Subir intents
const uploadIntents = () => axiosClient.post("/admin/upload");

// ✅ Reiniciar servidor
const restartServer = () => axiosClient.post("/admin/restart");

// ✅ Exportar logs con filtros de fecha
const exportTestResults = (desde, hasta) =>
    axiosClient.get("/admin/exportaciones", {
        responseType: "blob",
        params: { desde, hasta },
    });

export function useAdminActions() {
    const trainMutation = useMutation({ mutationFn: trainBot });
    const uploadMutation = useMutation({ mutationFn: uploadIntents });
    const restartMutation = useMutation({ mutationFn: restartServer });

    const exportMutation = useMutation({
        mutationFn: async () => {
            try {
                const desde = "2025-07-01";
                const hasta = "2025-08-31";
                const res = await exportTestResults(desde, hasta);
                const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;

                const timestamp = new Date().toISOString().split("T")[0];
                link.setAttribute("download", `exportacion_logs_${timestamp}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
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