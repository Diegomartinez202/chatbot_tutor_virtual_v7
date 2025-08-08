import React, { useState } from "react";
import { FileText, Download, Search, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";

import FiltrosFecha from "@/components/FiltrosFecha";
import DateRangeFilter from "@/components/DateRangeFilter";
import { exportarCSV, fetchHistorialExportaciones } from "@/services/api";
import { exportToCSV } from "@/utils/exportCsvHelper";

function ExportacionesPage() {
    const [desde, setDesde] = useState(null);
    const [hasta, setHasta] = useState(null);
    const [usuario, setUsuario] = useState("");
    const [tipo, setTipo] = useState("");

    const { data: historial = [], refetch } = useQuery({
        queryKey: ["historialExportaciones", usuario, tipo],
        queryFn: () => fetchHistorialExportaciones({ usuario, tipo }),
    });

    const mutation = useMutation({
        mutationFn: () => exportarCSV(desde, hasta),
        onSuccess: (data) => {
            toast.success("Exportación generada");
            window.open(data.url, "_blank");
            refetch();
        },
        onError: () => toast.error("Error al exportar CSV"),
    });

    const handleDescargar = (url) => {
        if (!url) return toast.error("Archivo no disponible");
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("target", "_blank");
        link.setAttribute("download", url.split("/").pop());
        document.body.appendChild(link);
        link.click();
        link.remove();
    };
    const handleExport = () => {
        exportToCSV(exportData, "estadisticas.csv");
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText size={22} /> Exportaciones realizadas
            </h1>

            {/* 🎯 Filtros */}
            <div className="flex flex-wrap gap-2 items-end">
                <DateRangeFilter
                    desde={desde}
                    hasta={hasta}
                    setDesde={setDesde}
                    setHasta={setHasta}
                />

                <input
                    type="text"
                    placeholder="Filtrar por usuario"
                    className="border px-3 py-2 rounded-md"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Filtrar por tipo"
                    className="border px-3 py-2 rounded-md"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                />

                <Button onClick={refetch}>
                    <Search className="w-4 h-4 mr-1" />
                    Buscar
                </Button>

                <Button
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isLoading}
                    className="ml-auto flex gap-2"
                >
                    <Download className="w-4 h-4" />
                    {mutation.isLoading ? "Exportando..." : "Exportar CSV"}
                </Button>
            </div>

            {/* 📊 Tabla de resultados */}
            <h3 className="text-lg font-semibold mt-8 flex items-center gap-2">
                <History size={18} /> Historial de Exportaciones
            </h3>

            <div className="overflow-x-auto mt-2">
                <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800 dark:text-white">
                        <tr>
                            <th className="text-left px-4 py-2">📁 Archivo</th>
                            <th className="text-left px-4 py-2">📌 Tipo</th>
                            <th className="text-left px-4 py-2">🕒 Fecha</th>
                            <th className="text-left px-4 py-2">👤 Usuario</th>
                            <th className="text-left px-4 py-2">🔗 Descargar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historial.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-4 py-3 text-center text-gray-500">
                                    No se encontraron exportaciones.
                                </td>
                            </tr>
                        )}

                        {historial.map((exp, i) => (
                            <tr
                                key={i}
                                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <td className="px-4 py-2">{exp.nombre_archivo || "—"}</td>
                                <td className="px-4 py-2">{exp.tipo || "—"}</td>
                                <td className="px-4 py-2">
                                    {exp.timestamp
                                        ? format(new Date(exp.timestamp), "dd-MM-yyyy HH:mm")
                                        : "—"}
                                </td>
                                <td className="px-4 py-2">{exp.email || "Anónimo"}</td>
                                <td className="px-4 py-2">
                                    {exp.url || exp.endpoint ? (
                                        <button
                                            onClick={() => handleDescargar(exp.url || exp.endpoint)}
                                            className="flex items-center gap-1 text-blue-600 hover:underline"
                                        >
                                            <Download size={14} /> Descargar
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 italic">No disponible</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ExportacionesPage;