import React, { useEffect, useState } from "react";
import { FileText, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import axiosClient from "@/services/axiosClient";
import DateRangeFilter from "@/components/DateRangeFilter";
import { format } from "date-fns";

function ExportacionesPage() {
    const [exportaciones, setExportaciones] = useState([]);
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [loading, setLoading] = useState(false);
    const [usuario, setUsuario] = useState("");
    const [tipo, setTipo] = useState("");

    const fetchExportaciones = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get("/admin/exportaciones", {
                params: {
                    desde,
                    hasta,
                    usuario,
                    tipo,
                },
            });
            setExportaciones(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Error al cargar exportaciones");
        } finally {
            setLoading(false);
        }
    };

    const descargarArchivo = (url) => {
        if (!url) return toast.error("Archivo no disponible");
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("target", "_blank");
        link.setAttribute("download", url.split("/").pop());
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    useEffect(() => {
        fetchExportaciones();
    }, [desde, hasta]);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText size={22} /> Exportaciones realizadas
            </h1>

            {/* 🎯 Filtros: fecha, usuario, tipo */}
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

                <Button onClick={fetchExportaciones} disabled={loading}>
                    <Search className="w-4 h-4 mr-1" />
                    Buscar
                </Button>
            </div>

            {/* 📊 Tabla de resultados */}
            <div className="overflow-x-auto mt-4">
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
                        {exportaciones.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-4 py-3 text-center text-gray-500">
                                    No se encontraron exportaciones para los filtros aplicados.
                                </td>
                            </tr>
                        )}

                        {exportaciones.map((exp, i) => (
                            <tr
                                key={i}
                                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <td className="px-4 py-2">{exp.nombre_archivo || "—"}</td>
                                <td className="px-4 py-2">{exp.tipo || "—"}</td>
                                <td className="px-4 py-2">
                                    {exp.fecha ? format(new Date(exp.fecha), "dd-MM-yyyy HH:mm") : "—"}
                                </td>
                                <td className="px-4 py-2">{exp.usuario || "Anónimo"}</td>
                                <td className="px-4 py-2">
                                    {exp.url ? (
                                        <button
                                            onClick={() => descargarArchivo(exp.url)}
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