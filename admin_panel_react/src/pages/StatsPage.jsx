import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import BotonesAdmin from "@/components/BotonesAdmin";
import StatsChart from "@/components/StatsChart";
import { getStats } from "@/services/api";
import { toast } from "react-hot-toast";
import {
    BarChart2,
    Lock,
    FileText,
    Users,
    Download,
    Brain
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import DateRangeFilter from "@/components/DateRangeFilter";

function StatsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getStats({ desde, hasta });
                setStats(data);
            } catch (err) {
                toast.error("Error al cargar estadísticas");
            }
        };
        fetchData();
    }, [desde, hasta]);

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BarChart2 size={22} /> Estadísticas del Chatbot
            </h1>

            {(user?.rol === "admin" || user?.rol === "soporte") && (
                <>
                    <BotonesAdmin />

                    <DateRangeFilter
                        desde={desde}
                        hasta={hasta}
                        setDesde={setDesde}
                        setHasta={setHasta}
                    />

                    <Tooltip.Provider>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            {/* Total de logs */}
                            <div className="bg-white shadow rounded-md p-4 dark:bg-gray-800 dark:text-white">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <p className="text-gray-500 dark:text-gray-300 flex items-center gap-2 cursor-help">
                                            <FileText size={16} /> Total de logs
                                        </p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content className="tooltip" side="top">
                                            Registros almacenados por el chatbot
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <p className="text-lg font-bold">{stats?.total_logs ?? "..."}</p>
                            </div>

                            {/* Exportaciones CSV */}
                            <div className="bg-white shadow rounded-md p-4 dark:bg-gray-800 dark:text-white">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <p className="text-gray-500 dark:text-gray-300 flex items-center gap-2 cursor-help">
                                            <Download size={16} /> Exportaciones CSV
                                        </p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content className="tooltip" side="top">
                                            Cantidad de archivos descargados
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <p className="text-lg font-bold">{stats?.total_exportaciones_csv ?? "..."}</p>
                            </div>

                            {/* Total usuarios */}
                            <div className="bg-white shadow rounded-md p-4 dark:bg-gray-800 dark:text-white">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <p className="text-gray-500 dark:text-gray-300 flex items-center gap-2 cursor-help">
                                            <Users size={16} /> Total usuarios
                                        </p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content className="tooltip" side="top">
                                            Número total de usuarios en el sistema
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <p className="text-lg font-bold">{stats?.total_usuarios ?? "..."}</p>
                            </div>

                            {/* Últimos usuarios */}
                            <div className="bg-white shadow rounded-md p-4 dark:bg-gray-800 dark:text-white">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <p className="text-gray-500 dark:text-gray-300 cursor-help">Últimos usuarios</p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content className="tooltip" side="top">
                                            Últimos usuarios registrados en el sistema
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <ul className="list-disc ml-5 text-xs">
                                    {stats?.ultimos_usuarios?.map((u, i) => (
                                        <li key={i}>{u.email}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Usuarios por rol */}
                            <div className="bg-white shadow rounded-md p-4 dark:bg-gray-800 dark:text-white">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <p className="text-gray-500 dark:text-gray-300 cursor-help">Usuarios por rol</p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content className="tooltip" side="top">
                                            Distribución de usuarios según sus roles
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <ul className="list-disc ml-5 text-xs">
                                    {stats?.usuarios_por_rol?.map((item, i) => (
                                        <li key={i}>{item.rol}: {item.total}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Intents más usados */}
                            <div className="bg-white shadow rounded-md p-4 col-span-2 dark:bg-gray-800 dark:text-white">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <p className="text-gray-500 dark:text-gray-300 flex items-center gap-2 cursor-help">
                                            <Brain size={16} /> Intents más usados
                                        </p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content className="tooltip" side="top">
                                            Intents que han sido más invocados por los usuarios
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <ul className="list-disc ml-5 text-xs">
                                    {stats?.intents_mas_usados?.map((i, idx) => (
                                        <li key={idx}>{i.intent} ({i.total})</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Tooltip.Provider>
                </>
            )}

            {(user?.rol !== "admin" && user?.rol !== "soporte") && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md flex items-center gap-2">
                    <Lock size={16} /> Algunas funciones administrativas están restringidas para tu rol (<strong>{user?.rol}</strong>).
                </div>
            )}

            {/* 📊 Gráficos y visualizaciones */}
            <StatsChart desde={desde} hasta={hasta} />
        </div>
    );
}

export default StatsPage;