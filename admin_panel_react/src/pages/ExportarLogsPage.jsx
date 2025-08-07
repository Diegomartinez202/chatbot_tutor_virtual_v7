import { useEffect, useState } from "react";
import { getExportStats } from "@/services/api";
import { format } from "date-fns";

function ExportarLogsPage() {
    const [exportaciones, setExportaciones] = useState([]);

    useEffect(() => {
        getExportStats()
            .then(setExportaciones)
            .catch(console.error);
    }, []);

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">📥 Exportaciones de Logs</h1>

            {exportaciones.length === 0 ? (
                <p className="text-gray-500">❗No hay exportaciones registradas.</p>
            ) : (
                <div className="overflow-x-auto border rounded shadow">
                    <table className="min-w-full text-sm bg-white">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="px-4 py-2">📅 Fecha</th>
                                <th className="px-4 py-2">👤 Usuario</th>
                                <th className="px-4 py-2">📄 Archivo</th>
                                <th className="px-4 py-2">⬇️ Acción</th>
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
                                            className="text-blue-600 hover:underline"
                                            download
                                        >
                                            Descargar
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