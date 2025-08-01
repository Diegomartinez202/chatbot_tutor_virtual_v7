import React, { useEffect, useState } from "react";
import axios from "@/services/api";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line,
    CartesianGrid,
    Legend,
} from "recharts";

const COLORS = ["#4F46E5", "#10B981", "#FBBF24", "#EF4444", "#6366F1"];

function StatsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get("/admin/stats")
            .then((res) => setStats(res.data))
            .catch((err) => console.error("❌ Error al cargar estadísticas:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">📊 Estadísticas del Chatbot</h1>

            {loading && <p className="text-gray-600">Cargando estadísticas...</p>}

            {!loading && stats && (
                <div className="grid gap-8 md:grid-cols-2">
                    {/* 📦 Resumen general */}
                    <div>
                        <h2 className="font-semibold text-lg mb-2">Resumen general</h2>
                        <ul className="list-disc list-inside text-sm">
                            <li><strong>Conversaciones:</strong> {stats.total_logs}</li>
                            <li><strong>Usuarios registrados:</strong> {stats.total_usuarios}</li>
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

                    {/* 🧩 Distribución por Rol */}
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

                    {/* 📈 Logs por día */}
                    {stats.logs_por_dia && (
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Logs por Día</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.logs_por_dia}>
                                    <XAxis dataKey="_id" />
                                    <YAxis />
                                    <CartesianGrid stroke="#ccc" />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" stroke="#6366F1" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* 👤 Últimos usuarios */}
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
            )}

            {!loading && !stats && (
                <p className="text-red-600">❌ No se pudieron cargar las estadísticas</p>
            )}
        </div>
    );
}

export default StatsPage;