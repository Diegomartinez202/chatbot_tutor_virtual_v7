import { useEffect, useState } from "react";
import { getTestHistory } from "../services/api";
import { toast } from "react-hot-toast";

const TestHistoryPage = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getTestHistory();
                setLogs(data);
            } catch (err) {
                toast.error("Error al cargar historial");
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">📜 Historial de Pruebas</h2>
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-800 text-white">
                        <th className="p-2">Fecha</th>
                        <th className="p-2">Prueba</th>
                        <th className="p-2">Resultado</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, i) => (
                        <tr key={i} className="text-center border-t">
                            <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="p-2">{log.test_name}</td>
                            <td className="p-2">
                                {log.success ? "✅ Éxito" : "❌ Fallo"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TestHistoryPage;