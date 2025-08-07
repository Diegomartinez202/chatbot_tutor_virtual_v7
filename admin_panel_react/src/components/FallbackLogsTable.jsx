import { useEffect, useState } from "react";
import { getFallbackLogs } from "@/services/api";
import { format } from "date-fns";
import {
    Calendar,
    User,
    MessageCircle,
    AlertTriangle,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

const FallbackLogsTable = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        getFallbackLogs().then(setLogs).catch(console.error);
    }, []);

    if (logs.length === 0)
        return <p className="text-gray-500">❗No hay intentos fallidos registrados.</p>;

    return (
        <div className="overflow-x-auto mt-6 border rounded shadow">
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
                                        Fecha y hora del intento fallido
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
                                        ID del usuario o anónimo
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </th>
                        <th className="px-4 py-2">
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle size={16} />
                                        <span>Mensaje</span>
                                    </div>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="tooltip" side="top">
                                        Texto enviado por el usuario
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </th>
                        <th className="px-4 py-2">
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <div className="flex items-center gap-1">
                                        <AlertTriangle size={16} className="text-red-600" />
                                        <span>Intent</span>
                                    </div>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="tooltip" side="top">
                                        Intento no reconocido por el bot
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, i) => (
                        <tr key={i} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2">
                                {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm")}
                            </td>
                            <td className="px-4 py-2">{log.user_id || "—"}</td>
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