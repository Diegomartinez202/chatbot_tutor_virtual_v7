import { useEffect, useState } from "react";
import { getExportStats } from "@/services/api";
import { format } from "date-fns";
import {
    Download,
    Calendar,
    User,
    FileText,
    ArrowDownCircle
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

function ExportarLogsPage() {
    const [exportaciones, setExportaciones] = useState([]);

    useEffect(() => {
        getExportStats()
            .then(setExportaciones)
            .catch(console.error);
    }, []);

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* 🧾 Título con ícono */}
            <div className="flex items-center gap-2 mb-4">
                <Download className="w-6 h-6 text-gray-700" />
                <h1 className="text-2xl font-bold">Exportaciones de Logs</h1>
            </div>

            {exportaciones.length === 0 ? (
                <p className="text-gray-500">❗No hay exportaciones registradas.</p>
            ) : (
                <div className="overflow-x-auto border rounded shadow">
                    <table className="min-w-full text-sm bg-white">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="px-4 py-2">
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={16} />
                                                <span>Fecha</span>
                                            </div>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content className="tooltip" side="top">
                                                Fecha de la exportación
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </th>
                                <th className="px-4 py-2">
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <div className="flex items-center gap-1">
                                                <User size={16} />
                                                <span>Usuario</span>
                                            </div>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content className="tooltip" side="top">
                                                Usuario que exportó
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </th>
                                <th className="px-4 py-2">
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <div className="flex items-center gap-1">
                                                <FileText size={16} />
                                                <span>Archivo</span>
                                            </div>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content className="tooltip" side="top">
                                                Nombre del archivo generado
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </th>
                                <th className="px-4 py-2">
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <div className="flex items-center gap-1">
                                                <ArrowDownCircle size={16} />
                                                <span>Acción</span>
                                            </div>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content className="tooltip" side="top">
                                                Descargar archivo
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {exportaciones.map((exp, i) => (
                                <tr key={i} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">
                                        {format(new Date(exp.fecha), "yyyy-MM-dd HH:mm")}
                                    </td>
                                    <td className="px-4 py-2">{exp.usuario || "—"}</td>
                                    <td className="px-4 py-2">{exp.archivo}</td>
                                    <td className="px-4 py-2">
                                        <a
                                            href={`${import.meta.env.VITE_API_URL}/admin/logs/${exp.archivo}`}
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                            download
                                        >
                                            <Download size={16} /> Descargar
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ExportarLogsPage;