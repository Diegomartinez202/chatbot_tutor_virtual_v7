// src/pages/LogsPage.jsx
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import LogsTable from "@/components/LogsTable";
import { exportLogsCSV } from "@/services/api";
import { toast } from "react-hot-toast";
import { FileText, Lock, Download, Search } from "lucide-react";

function LogsPage() {
    const { user } = useAuth();
    const [filters, setFilters] = useState({ email: "", endpoint: "", rol: "" });

    const handleExport = async () => {
        try {
            const blob = await exportLogsCSV();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "logs_exportados.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Logs exportados correctamente 📥");
        } catch (error) {
            toast.error("❌ Error al exportar logs");
            console.error("Export error:", error);
        }
    };

    if (user?.rol !== "admin" && user?.rol !== "soporte") {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <FileText size={22} /> Logs
                </h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md flex items-center gap-2">
                    <Lock size={16} /> Acceso denegado. Esta sección es solo para personal autorizado.
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileText size={22} /> Logs del Chatbot
                </h1>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
                >
                    <Download size={16} /> Exportar CSV
                </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Filtrar por email"
                        className="border px-3 py-2 rounded-md pl-8"
                        value={filters.email}
                        onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    />
                    <Search size={16} className="absolute top-2.5 left-2 text-gray-400" />
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Filtrar por endpoint"
                        className="border px-3 py-2 rounded-md pl-8"
                        value={filters.endpoint}
                        onChange={(e) => setFilters({ ...filters, endpoint: e.target.value })}
                    />
                    <Search size={16} className="absolute top-2.5 left-2 text-gray-400" />
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Filtrar por rol"
                        className="border px-3 py-2 rounded-md pl-8"
                        value={filters.rol}
                        onChange={(e) => setFilters({ ...filters, rol: e.target.value })}
                    />
                    <Search size={16} className="absolute top-2.5 left-2 text-gray-400" />
                </div>
            </div>

            <LogsTable filters={filters} />
        </div>
    );
}

export default LogsPage;