import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import LogsTable from "@/components/LogsTable";
import { useAdminActions } from "@/services/useAdminActions";
import toast from "react-hot-toast";
import { FileText, Lock, Download, Search } from "lucide-react";
import FiltrosFecha from "@/components/FiltrosFecha";
import { Button } from "@/components/ui/button";
import * as Tooltip from "@radix-ui/react-tooltip";
import Badge from "@/components/Badge";

function LogsPage() {
    const { user } = useAuth();
    const { exportMutation } = useAdminActions();

    const [filters, setFilters] = useState({
        email: "",
        endpoint: "",
        rol: "",
    });

    // ⬇️ usar strings (no null) para inputs controlados
    const [fechas, setFechas] = useState({
        fechaInicio: "",
        fechaFin: "",
    });

    const handleExport = () => {
        // ⬇️ normaliza a {desde, hasta} para exportMutation
        exportMutation.mutate(
            {
                desde: fechas.fechaInicio || "",
                hasta: fechas.fechaFin || "",
            },
            {
                onSuccess: () => toast.success("Exportación iniciada/exitosa."),
                onError: (err) => {
                    const msg = err?.response?.data?.detail || "No se pudo exportar.";
                    toast.error(msg);
                },
            }
        );
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
        <div className="p-6 space-y-6">
            {/* 🔹 Encabezado + botón exportar */}
            <div className="flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText size={22} /> Logs del Chatbot
                    </h1>
                </div>

                <div className="flex items-end gap-2">
                    <FiltrosFecha filtros={fechas} setFiltros={setFechas} />
                    <Tooltip.Provider>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <Button
                                    onClick={handleExport}
                                    disabled={exportMutation.isLoading}
                                    variant="secondary"
                                >
                                    <Download size={16} className="mr-2" />
                                    Exportar CSV
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content
                                    className="rounded-md bg-black text-white px-2 py-1 text-xs"
                                    side="top"
                                >
                                    Exportar registros con el rango de fechas aplicado
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                </div>
            </div>

            {/* 🔍 Filtros adicionales */}
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

            {/* 📋 Tabla de resultados */}
            <LogsTable filters={filters} fechas={fechas} Badge={Badge} />
        </div>
    );
}

export default LogsPage;