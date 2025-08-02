import { useEffect, useState } from "react";
import { getFallbackLogs } from "@/services/api";
import { format } from "date-fns";

const FallbackLogsTable = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        getFallbackLogs().then(setLogs).catch(console.error);
    }, []);

    if (logs.length === 0) return <p className="text-gray-500">❗No hay intentos fallidos registrados.</p>;

    return (
        <div className="overflow-x-auto mt-6 border rounded shadow">
            <table className="min-w-full text-sm bg-white">
                <thead className="bg-gray-100 text-left">
                    <tr>
                        <th className="px-4 py-2">📅 Fecha</th>
                        <th className="px-4 py-2">👤 Usuario</th>
                        <th className="px-4 py-2">💬 Mensaje</th>
                        <th className="px-4 py-2">📛 Intent</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, i) => (
                        <tr key={i} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2">{format(new Date(log.timestamp), "yyyy-MM-dd HH:mm")}</td>
                            <td className="px-4 py-2">{log.user_id}</td>
                            <td className="px-4 py-2 max-w-xs truncate">{log.message}</td>
                            <td className="px-4 py-2 text-red-600">{log.intent}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FallbackLogsTable;