// src/components/LogsTable.jsx
import { useEffect, useState, useMemo } from "react";
import { getLogsList } from "@/services/api";
import IconTooltip from "@/components/ui/IconTooltip";
import {
    Calendar,
    User,
    Route,
    Wrench,
    Shield,
    Globe,
    Compass,
    CheckCircle,
    MessageSquare,
    Download,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { exportToCsv } from "@/utils/exportCsvHelper";
import Badge from "@/components/Badge";

const LogsTable = ({
    filters = { email: "", endpoint: "", rol: "" },
    fechas = { fechaInicio: "", fechaFin: "" },
}) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getLogsList();
                setLogs(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error al cargar logs:", error);
                setLogs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = useMemo(() => {
        const fi = fechas?.fechaInicio ? new Date(fechas.fechaInicio).getTime() : null;
        const ff = fechas?.fechaFin ? new Date(fechas.fechaFin).getTime() : null;

        return logs.filter((log) => {
            const email = (log.email || log.user_email || "").toLowerCase();
            const endpoint = (log.endpoint || "").toLowerCase();
            const rol = (log.rol || log.role || "").toLowerCase();
            const ts = log.timestamp ? new Date(log.timestamp).getTime() : null;

            const matchEmail = email.includes((filters.email || "").toLowerCase());
            const matchEndpoint = endpoint.includes((filters.endpoint || "").toLowerCase());
            const matchRol = rol.includes((filters.rol || "").toLowerCase());

            const matchFecha =
                (fi === null || (ts !== null && ts >= fi)) &&
                (ff === null || (ts !== null && ts <= ff));

            return matchEmail && matchEndpoint && matchRol && matchFecha;
        });
    }, [logs, filters, fechas]);

    const handleExport = () => {
        const rows = filteredLogs.map((l) => ({
            fecha: formatDate(l.timestamp, { withTime: true }),
            email: l.email || l.user_email || l.user_id || "",
            endpoint: l.endpoint || "",
            metodo: l.method || "",
            rol: l.rol || l.role || "",
            ip: l.ip || l.ip_address || "",
            user_agent: l.user_agent || "",
            status: l.status || "",
            intent: l.intent || "",
        }));

        exportToCsv(rows, `logs_${Date.now()}.csv`, [
            "fecha",
            "email",
            "endpoint",
            "metodo",
            "rol",
            "ip",
            "user_agent",
            "status",
            "intent",
        ]);
    };

    if (loading) return <p className="text-gray-600">Cargando logs…</p>;
    if (filteredLogs.length === 0) return <p className="text-gray-500">No hay registros coincidentes.</p>;

    return (
        <div className="overflow-x-auto rounded-md shadow border border-gray-200">
            <div className="flex justify-end p-3">
                <IconTooltip label="Exporta los registros filtrados actualmente" side="top">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 text-sm px-3 py-2 border rounded bg-white hover:bg-gray-100 shadow"
                    >
                        <Download className="w-4 h-4" />
                        Exportar CSV (vista)
                    </button>
                </IconTooltip>
            </div>

            <table className="min-w-full table-auto bg-white text-sm">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="px-4 py-2 text-left">
                            <span className="inline-flex items-center gap-2">
                                <Calendar size={16} /> Fecha
                            </span>
                        </th>
                        <th className="px-4 py-2 text-left">
                            <span className="inline-flex items-center gap-2">
                                <User size={16} /> Usuario
                            </span>
                        </th>
                        <th className="px-4 py-2 text-left">
                            <span className="inline-flex items-center gap-2">
                                <Route size={16} /> Endpoint
                            </span>
                        </th>
                        <th className="px-4 py-2 text-left">
                            <span className="inline-flex items-center gap-2">
                                <Wrench size={16} /> Método
                            </span>
                        </th>
                        <th className="px-4 py-2 text-left">
                            <span className="inline-flex items-center gap-2">
                                <Shield size={16} /> Rol
                            </span>
                        </th>
                        <th className="px-4 py-2 text-left">
                            <span className="inline-flex items-center gap-2">
                                <Globe size={16} /> IP
                            </span>
                        </th>
                        <th className="px-4 py-2 text-left">
                            <span className="inline-flex items-center gap-2">
                                <Compass size={16} /> User-Agent
                            </span>
                        </th>
                        <th className="px-4 py-2 text-left">
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle size={16} /> Status
                            </span>
                        </th>
                        <th className="px-4 py-2 text-left">
                            <span className="inline-flex items-center gap-2">
                                <MessageSquare size={16} /> Intent
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLogs.map((log, index) => {
                        const key = log._id || index;
                        const role = (log.rol || log.role || "usuario").toLowerCase();
                        const status = (log.status || "ok").toLowerCase();
                        const intent = (log.intent || "default").toLowerCase();

                        return (
                            <tr key={key} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap">
                                    {log.timestamp ? formatDate(log.timestamp, { withTime: true }) : "—"}
                                </td>
                                <td className="px-4 py-2">
                                    {log.email || log.user_email || log.user_id || "—"}
                                </td>
                                <td className="px-4 py-2">
                                    <Badge value={log.endpoint || "—"} />
                                </td>
                                <td className="px-4 py-2">{log.method || "—"}</td>
                                <td className="px-4 py-2">
                                    <Badge type="role" value={role} />
                                </td>
                                <td className="px-4 py-2">{log.ip || log.ip_address || "—"}</td>
                                <td className="px-4 py-2 max-w-[260px]">
                                    <IconTooltip label={log.user_agent || "—"} side="top">
                                        <span className="block truncate cursor-help">
                                            {log.user_agent || "—"}
                                        </span>
                                    </IconTooltip>
                                </td>
                                <td className="px-4 py-2">
                                    <Badge type="status" value={status} />
                                </td>
                                <td className="px-4 py-2">
                                    <Badge type="intent" value={intent} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default LogsTable;