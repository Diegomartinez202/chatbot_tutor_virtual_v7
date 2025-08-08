import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    LineChart, Line, CartesianGrid, Cell, PieChart, Pie, Legend
} from "recharts";
import { getStats, getExportStats } from "@/services/api";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
import { exportToCSV } from "@/utils/exportCsvHelper";

const handleExport = () => {
    exportToCSV(exportData, "estadisticas.csv");
};
const COLORS = ["#4F46E5", "#10B981", "#FBBF24", "#EF4444", "#6366F1"];

function StatsChart({ desde, hasta }) {
    const [stats, setStats] = useState(null);
    const [exportData, setExportData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const statsRes = await getStats({ desde, hasta });
            const exportsRes = await getExportStats({ desde, hasta });
            setStats(statsRes);
            setExportData(exportsRes);
        } catch (err) {
            console.error("❌ Error al cargar estadísticas:", err);
            toast.error("Error al cargar estadísticas");
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!exportData.length) return toast.error("No hay datos para exportar");
        const headers = Object.keys(exportData[0]);
        const rows = exportData.map(row => headers.map(h => row[h]).join(",")).join("\n");
        const csvContent = [headers.join(","), rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "exportaciones.csv";
        link.click();
    };

    useEffect(() => {
        fetchData();
    }, [desde, hasta]);

    if (loading) return <p className="text-gray-600 dark:text-gray-300">Cargando estadísticas...</p>;
    if (!stats) return <p className="text-red-600">❌ No se pudieron cargar las estadísticas</p>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid gap-8 md:grid-cols-2"
        >
            {/* 🔘 Botones superiores */}
            <div className="col-span-2 flex justify-end gap-4 mb-2">
                <button
                    onClick={fetchData}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                >
                    <RefreshCw size={16} /> Recargar
                </button>
                <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                >
                    <Download size={16} /> Exportar CSV
                </button>
            </div>

            {/* 📦 Resumen general */}
            <motion.div whileHover={{ scale: 1.02 }}>
                <h2 className="font-semibold text-lg mb-2 dark:text-white">Resumen general</h2>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                    <li><strong>Conversaciones:</strong> {stats.total_logs}</li>
                    <li><strong>Usuarios registrados:</strong> {stats.total_usuarios}</li>
                    <li><strong>Exportaciones CSV:</strong> {stats.total_exportaciones_csv}</li>
                </ul>
            </motion.div>

            {/* 🧠 Intents más usados */}
            <motion.div whileHover={{ scale: 1.02 }}>
                <h2 className="font-semibold text-lg mb-2 dark:text-white">Top Intents más usados</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.intents_mas_usados}>
                        <XAxis dataKey="_id" stroke="#8884d8" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total">
                            {stats.intents_mas_usados.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* 🧩 Usuarios por rol */}
            <motion.div whileHover={{ scale: 1.02 }}>
                <h2 className="font-semibold text-lg mb-2 dark:text-white">Usuarios por Rol</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={stats.usuarios_por_rol}
                            dataKey="total"
                            nameKey="rol"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                        >
                            {stats.usuarios_por_rol.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </motion.div>

            {/* 📈 Logs por Día */}
            <motion.div whileHover={{ scale: 1.02 }}>
                <h2 className="font-semibold text-lg mb-2 dark:text-white">📅 Logs por Día</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.logs_por_dia}>
                        <XAxis dataKey="fecha" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="total" stroke="#6366F1" name="Logs" />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            {/* 📤 Exportaciones por Día */}
            <motion.div whileHover={{ scale: 1.02 }}>
                <h2 className="font-semibold text-lg mb-2 dark:text-white">📤 Exportaciones CSV por Día</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={exportData}>
                        <XAxis dataKey="_id" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="total" stroke="#10B981" name="Exportaciones" />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            {/* 👥 Últimos usuarios */}
            <motion.div className="col-span-2" whileHover={{ scale: 1.01 }}>
                <h2 className="font-semibold text-lg mb-2 dark:text-white">Últimos usuarios registrados</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 dark:border-gray-600 rounded text-sm">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800">
                                <th className="p-2 text-left">Correo</th>
                                <th className="p-2 text-left">Rol</th>
                                <th className="p-2 text-left">ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.ultimos_usuarios.map((user, index) => (
                                <tr key={index} className="border-t dark:border-gray-700">
                                    <td className="p-2 text-gray-700 dark:text-gray-200">{user.email}</td>
                                    <td className="p-2 text-gray-700 dark:text-gray-200">{user.rol}</td>
                                    <td className="p-2 text-xs text-gray-500 dark:text-gray-400">{user._id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default StatsChart;