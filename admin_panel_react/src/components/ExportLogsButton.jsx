import React from "react";
import axiosClient from "../services/axiosClient"; // Asegúrate de tener tu cliente Axios con token

function ExportLogsButton() {
    const exportarLogs = async () => {
        try {
            const res = await axiosClient.get("/admin/logs/export", {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = "logs_exportados.csv";
            a.click();
        } catch (error) {
            alert("❌ Error al exportar logs");
            console.error("Error al exportar logs:", error);
        }
    };

    return (
        <button
            onClick={exportarLogs}
            className="bg-purple-600 text-white px-3 py-1 rounded mb-4"
        >
            📥 Exportar Logs a CSV
        </button>
    );
}

export default ExportLogsButton;