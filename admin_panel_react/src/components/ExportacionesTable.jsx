// admin-panel-react/src/components/ExportacionesTable.jsx
import React, { useEffect, useState } from "react";
import { getExportLogs } from "@/services/api";
import { toast } from "react-hot-toast";

const ExportacionesTable = () => {
    const [exportaciones, setExportaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getExportLogs();
                setExportaciones(data);
            } catch (err) {
                toast.error("Error al obtener exportaciones");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-white p-4 mt-6 shadow rounded-md">
            <h2 className="text-lg font-bold mb-4">📤 Exportaciones realizadas</h2>

            {loading ? (
                <p className="text-gray-500">Cargando...</p>
            ) : exportaciones.length === 0 ? (
                <p className="text-gray-500">No se encontraron exportaciones.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">👤 Usuario</th>
                                <th className="px-4 py-2 text-left">📧 Email</th>
                                <th className="px-4 py-2 text-left">🌐 IP</th>
                                <th className="px-4 py-2 text-left">🧭 Navegador</th>
                                <th className="px-4 py-2 text-left">📅 Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {exportaciones.map((log, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2">{log.nombre || "N/A"}</td>
                                    <td className="px-4 py-2">{log.email}</td>
                                    <td className="px-4 py-2">{log.ip}</td>
                                    <td className="px-4 py-2">{log.user_agent?.slice(0, 50) || "..."}</td>
                                    <td className="px-4 py-2">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ExportacionesTable;