// admin-panel-react/src/components/StatsChart.jsx
import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    LineChart, Line, CartesianGrid, Cell, PieChart, Pie, Legend
} from "recharts";
import { getStats, getExportStats } from "@/services/api";
import { toast } from "react-hot-toast";

const COLORS = ["#4F46E5", "#10B981", "#FBBF24", "#EF4444", "#6366F1"];

function StatsChart() {
    const [stats, setStats] = useState(null);
    const [exportData, setExportData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await getStats();
                const exportsRes = await getExportStats();
                setStats(statsRes);
                setExportData(exportsRes);
            } catch (err) {
                console.error("❌ Error al cargar estadísticas:", err);
                toast.error("Error al cargar estadísticas");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p className="text-gray-600">Cargando estadísticas...</p>;
    if (!stats) return <p className="text-red-600">❌ No se pudieron cargar las estadísticas</p>;

    return (
        <div className="grid gap-8 md:grid-cols-2">
            {/* 📦 Resumen general */}
            <div>
                <h2 className="font-semibold text-lg mb-2">Resumen general</h2>
                <ul className="list-disc list-inside text-sm">
                    <li><strong>Conversaciones:</strong> {stats.total_logs}</li>
                    <li><strong>Usuarios registrados:</strong> {stats.total_usuarios}</li>
                    <li><strong>Exportaciones CSV:</strong> {stats.total_exportaciones_csv}</li>
                </ul>
            </div>

            {/* 🧠 Intents más usados */}
            <div>
                <h2 className="font-semibold text-lg mb-2">Top Intents más usados</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.intents_mas_usados}>
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total">
                            {stats.intents_mas_usados.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 🧩 Usuarios por rol */}
            <div>
                <h2 className="font-semibold text-lg mb-2">Usuarios por Rol</h2>
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
            </div>

            {/* 📈 Logs por Día */}
            <div>
                <h2 className="font-semibold text-lg mb-2">📅 Logs por Día</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.logs_por_dia}>
                        <XAxis dataKey="fecha" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="total" stroke="#6366F1" name="Logs" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 📤 Exportaciones por Día */}
            <div>
                <h2 className="font-semibold text-lg mb-2">📤 Exportaciones CSV por Día</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={exportData}>
                        <XAxis dataKey="_id" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="total" stroke="#10B981" name="Exportaciones" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 👥 Últimos usuarios */}
            <div className="col-span-2">
                <h2 className="font-semibold text-lg mb-2">Últimos usuarios registrados</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 rounded text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 text-left">Correo</th>
                                <th className="p-2 text-left">Rol</th>
                                <th className="p-2 text-left">ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.ultimos_usuarios.map((user, index) => (
                                <tr key={index} className="border-t">
                                    <td className="p-2">{user.email}</td>
                                    <td className="p-2">{user.rol}</td>
                                    <td className="p-2 text-xs text-gray-500">{user._id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default StatsChart;