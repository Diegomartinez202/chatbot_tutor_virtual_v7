// src/pages/StatsPageV2.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getStats } from "@/services/api";
import { BarChart3, Users, FileText, RefreshCw, Settings, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import StatsChart from "@/components/StatsChart";
import IconTooltip from "@/components/ui/IconTooltip"; // ✅ tooltips reutilizables
import Badge from "@/components/Badge";                // ✅ badges unificados

function StatsPageV2() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const data = await getStats();
            setStats(data);
        } catch (err) {
            console.error("Error al cargar estadísticas:", err);
            toast.error("Error al cargar estadísticas", { icon: <XCircle className="w-4 h-4" /> });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return <p className="text-gray-600 dark:text-gray-300">Cargando estadísticas...</p>;
    if (!stats)
        return (
            <p className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                No se pudieron cargar las estadísticas
            </p>
        );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <BarChart3 className="text-indigo-600" />
                    Estadísticas del Chatbot
                </h1>
                <IconTooltip label="Configuración de estadísticas" side="left">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                        <Settings size={18} />
                        Administración
                    </Button>
                </IconTooltip>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-5 transition duration-300">
                    <h3 className="text-gray-600 dark:text-gray-300">Total de logs</h3>
                    <p className="text-3xl font-bold text-indigo-600">
                        {stats.total_logs?.toLocaleString?.() ?? stats.total_logs}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-5 transition duration-300">
                    <h3 className="text-gray-600 dark:text-gray-300">Exportaciones CSV</h3>
                    <p className="text-3xl font-bold text-green-500">{stats.total_exportaciones_csv}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-5 transition duration-300">
                    <h3 className="text-gray-600 dark:text-gray-300">Total usuarios</h3>
                    <p className="text-3xl font-bold text-blue-500">{stats.total_usuarios}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-5">
                    <h3 className="text-gray-600 dark:text-gray-300 mb-2">Últimos usuarios</h3>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                        {(stats.ultimos_usuarios ?? []).slice(0, 4).map((u, i) => (
                            <li key={i}>{u.email}</li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-5">
                    <h3 className="text-gray-600 dark:text-gray-300 mb-2">Usuarios por rol</h3>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {(stats.usuarios_por_rol ?? []).map((u, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <Badge type="role" value={u.rol} />
                                <strong>{u.total}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-5">
                    <h3 className="text-gray-600 dark:text-gray-300 mb-2">Intents más usados</h3>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {(stats.intents_mas_usados ?? []).slice(0, 3).map((intent, i) => {
                            const name = intent._id || intent.intent;
                            return (
                                <li key={i} className="flex items-center gap-2">
                                    <Badge type="intent" value={name} />
                                    <strong>{intent.total?.toLocaleString?.() ?? intent.total}</strong>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                <IconTooltip label="Recargar métricas" side="left">
                    <Button onClick={fetchStats} variant="secondary" className="flex items-center gap-2">
                        <RefreshCw size={16} />
                        Recargar datos
                    </Button>
                </IconTooltip>
            </div>

            <StatsChart />
        </div>
    );
}

export default StatsPageV2;