// src/pages/LogsPage.jsx
import { useEffect, useState } from "react";
import axiosClient from "../services/axiosClient";
import { toast } from "react-hot-toast";
import { Button } from "../components/ui/Button";
import {
    getLogsList,
    downloadLogFile
} from "../services/api";

const LogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [logFiles, setLogFiles] = useState([]);
    const [level, setLevel] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchLogs();
        fetchLogFiles();
    }, []);

    const fetchLogs = async () => {
        try {
            const params = {};
            if (level) params.level = level;
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;

            const res = await axiosClient.get("/admin/logs", { params });
            setLogs(res.data);
        } catch (err) {
            toast.error("❌ Error al obtener logs del sistema");
        }
    };

    const fetchLogFiles = async () => {
        try {
            const files = await getLogsList();
            setLogFiles(files);
        } catch (err) {
            toast.error("❌ Error al obtener archivos .log");
        }
    };

    const exportarCSV = () => {
        const headers = ["timestamp", "level", "intent", "message"];
        const rows = logs.map(log =>
            headers.map(field => log[field] || "").join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const now = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
        a.download = `logs_${now}.csv`;
        a.click();
    };

    const handleDownload = async (filename) => {
        try {
            const blob = await downloadLogFile(filename);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
        } catch (err) {
            toast.error("❌ Error al descargar el archivo .log");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">📂 Logs del Sistema</h1>

            <div className="flex flex-wrap gap-4 mb-6">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border p-2 rounded"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border p-2 rounded"
                />
                <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">Todos</option>
                    <option value="INFO">INFO</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                </select>
                <Button onClick={fetchLogs}>🔍 Aplicar Filtros</Button>
                <Button onClick={exportarCSV}>⬇️ Exportar CSV</Button>
            </div>

            <div className="overflow-x-auto text-sm mb-10">
                <h2 className="font-semibold mb-2">🧾 Resultados de búsqueda</h2>
                <table className="w-full border border-gray-300 rounded">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">🕒 Fecha</th>
                            <th className="p-2 text-left">⚠️ Nivel</th>
                            <th className="p-2 text-left">🧠 Intent</th>
                            <th className="p-2 text-left">📋 Mensaje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, i) => (
                            <tr key={i} className="border-t">
                                <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-2">{log.level}</td>
                                <td className="p-2">{log.intent}</td>
                                <td className="p-2">{log.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && <p className="text-gray-500 mt-4">No hay registros con esos filtros.</p>}
            </div>

            <div>
                <h2 className="font-semibold mb-2">🗂 Archivos .log disponibles</h2>
                {logFiles.length === 0 ? (
                    <p>No hay archivos .log disponibles.</p>
                ) : (
                    <ul className="list-disc pl-6">
                        {logFiles.map((log, idx) => (
                            <li key={idx} className="mb-2 flex justify-between items-center">
                                <span>{log}</span>
                                <button
                                    onClick={() => handleDownload(log)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    ⬇️ Descargar
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default LogsPage;