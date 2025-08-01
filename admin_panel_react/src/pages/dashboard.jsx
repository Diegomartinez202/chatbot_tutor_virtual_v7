import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell, LineChart, Line,
    ResponsiveContainer
} from "recharts";

import axiosClient from "@/services/axiosClient";
import Button from "@/components/Button";
import Header from "@/components/Header";
import { useAdminActions } from "@/services/useAdminActions";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f", "#ffbb28"];

function Dashboard() {
    const navigate = useNavigate();
    const { trainMutation, uploadMutation } = useAdminActions();
    const isLoading = trainMutation.isLoading || uploadMutation.isLoading;

    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axiosClient.get("/stats");
                setStats(res.data);
            } catch (err) {
                console.error("Error al obtener estadísticas:", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <Header title="Panel de Administración" />

            {/* 🔘 BOTONES DE ACCIÓN */}
            <div className="space-y-4 mt-6 max-w-xl">
                <Button onClick={() => navigate('/logs')}>📄 Ver Logs</Button>
                <Button onClick={() => navigate('/intents')}>🧠 Editar Intents</Button>

                {/* ✅ BOTÓN DE DIAGNÓSTICO */}
                <Link
                    to="/diagnostico"
                    className="inline-block bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded"
                >
                    🧪 Diagnóstico del sistema
                </Link>

                <hr className="my-4" />

                <Button
                    onClick={() => uploadMutation.mutate()}
                    className="bg-blue-600 disabled:bg-blue-400"
                    disabled={isLoading}
                    aria-busy={uploadMutation.isLoading}
                >
                    {uploadMutation.isLoading ? 'Cargando...' : '📤 Cargar Intents'}
                </Button>

                <Button
                    onClick={() => trainMutation.mutate()}
                    className="bg-purple-600 disabled:bg-purple-400"
                    disabled={isLoading}
                    aria-busy={trainMutation.isLoading}
                >
                    {trainMutation.isLoading ? 'Entrenando...' : '🤖 Reentrenar Bot'}
                </Button>

                {/* ℹ️ Mensajes de estado */}
                <div role="status" aria-live="polite" className="min-h-[1.5rem] mt-2">
                    {uploadMutation.isError && !uploadMutation.isLoading && (
                        <p className="text-red-500">❌ Error al cargar intents</p>
                    )}
                    {trainMutation.isError && !trainMutation.isLoading && (
                        <p className="text-red-500">❌ Error al entrenar el bot</p>
                    )}
                    {uploadMutation.isSuccess && !uploadMutation.isLoading && !uploadMutation.isError && (
                        <p className="text-green-600">✅ Intents cargados correctamente</p>
                    )}
                    {trainMutation.isSuccess && !trainMutation.isLoading && !trainMutation.isError && (
                        <p className="text-green-600">✅ Bot entrenado exitosamente</p>
                    )}
                </div>
            </div>

            {/* 📊 ESTADÍSTICAS VISUALES */}
            {stats ? (
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-100 p-4 rounded shadow col-span-full">
                        <p className="text-lg">🧠 Conversaciones totales: <strong>{stats.total_conversaciones}</strong></p>
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-xl font-semibold mb-2">🎯 Intents más usados</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.intents_mas_usados}>
                                <XAxis dataKey="intent" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="conteo" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-xl font-semibold mb-2">🧑‍💼 Distribución de Roles</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.usuarios_por_rol}
                                    dataKey="cantidad"
                                    nameKey="rol"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {stats.usuarios_por_rol.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-4 rounded shadow col-span-full">
                        <h3 className="text-xl font-semibold mb-2">📆 Actividad por Día</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.actividad_por_dia}>
                                <XAxis dataKey="fecha" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="conteo" stroke="#00c49f" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <p className="p-6 mt-6 text-gray-600">Cargando estadísticas...</p>
            )}
        </div>
    );
}

export default Dashboard;