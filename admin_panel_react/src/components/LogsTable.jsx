// src/components/LogsTable.jsx
import { useEffect, useState } from "react";
import { getLogsList } from "@/services/api";
import { format } from "date-fns";

const LogsTable = ({ filters }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getLogsList();
                setLogs(data);
            } catch (error) {
                console.error("Error al cargar logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const filteredLogs = logs.filter((log) => {
        const matchEmail = log.email?.toLowerCase().includes(filters.email.toLowerCase());
        const matchEndpoint = log.endpoint?.toLowerCase().includes(filters.endpoint.toLowerCase());
        const matchRol = log.rol?.toLowerCase().includes(filters.rol.toLowerCase());
        return matchEmail && matchEndpoint && matchRol;
    });

    if (loading) {
        return <p className="text-gray-600">🔄 Cargando logs...</p>;
    }

    if (filteredLogs.length === 0) {
        return <p className="text-gray-500">❗No hay registros coincidentes.</p>;
    }

    return (
        <div className="overflow-x-auto rounded-md shadow border border-gray-200">
            <table className="min-w-full table-auto bg-white text-sm">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="px-4 py-2 text-left">📅 Fecha</th>
                        <th className="px-4 py-2 text-left">👤 Usuario</th>
                        <th className="px-4 py-2 text-left">📨 Endpoint</th>
                        <th className="px-4 py-2 text-left">🔧 Método</th>
                        <th className="px-4 py-2 text-left">🔒 Rol</th>
                        <th className="px-4 py-2 text-left">🌐 IP</th>
                        <th className="px-4 py-2 text-left">🧭 User-Agent</th>
                        <th className="px-4 py-2 text-left">✅ Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLogs.map((log, index) => (
                        <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-2">
                                {log.timestamp
                                    ? format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")
                                    : "—"}
                            </td>
                            <td className="px-4 py-2">{log.email || "—"}</td>
                            <td className="px-4 py-2">{log.endpoint}</td>
                            <td className="px-4 py-2">{log.method}</td>
                            <td className="px-4 py-2">{log.rol}</td>
                            <td className="px-4 py-2">{log.ip}</td>
                            <td className="px-4 py-2 max-w-[200px] truncate">{log.user_agent}</td>
                            <td className="px-4 py-2">{log.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LogsTable;