import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import BotonesAdmin from "@/components/BotonesAdmin";
import StatsChart from "@/components/StatsChart";
import { getStats } from "@/services/api";
import { toast } from "react-hot-toast";

function StatsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getStats();
                setStats(data);
            } catch (err) {
                toast.error("Error al cargar estadísticas");
            }
        };
        fetchData();
    }, []);

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold mb-4">📊 Estadísticas del Chatbot</h1>

            {(user?.rol === "admin" || user?.rol === "soporte") && (
                <>
                    <BotonesAdmin />

                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div className="bg-white shadow rounded-md p-4">
                            <p className="text-gray-500">Total de logs</p>
                            <p className="text-lg font-bold">{stats?.total_logs ?? "..."}</p>
                        </div>

                        <div className="bg-white shadow rounded-md p-4">
                            <p className="text-gray-500">Exportaciones CSV</p>
                            <p className="text-lg font-bold">{stats?.total_exportaciones_csv ?? "..."}</p>
                        </div>

                        <div className="bg-white shadow rounded-md p-4">
                            <p className="text-gray-500">Total usuarios</p>
                            <p className="text-lg font-bold">{stats?.total_usuarios ?? "..."}</p>
                        </div>

                        <div className="bg-white shadow rounded-md p-4">
                            <p className="text-gray-500">Últimos usuarios</p>
                            <ul className="list-disc ml-5 text-xs">
                                {stats?.ultimos_usuarios?.map((u, i) => (
                                    <li key={i}>{u.email}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white shadow rounded-md p-4">
                            <p className="text-gray-500">Usuarios por rol</p>
                            <ul className="list-disc ml-5 text-xs">
                                {stats?.usuarios_por_rol?.map((item, i) => (
                                    <li key={i}>
                                        {item.rol}: {item.total}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white shadow rounded-md p-4 col-span-2">
                            <p className="text-gray-500">Intents más usados</p>
                            <ul className="list-disc ml-5 text-xs">
                                {stats?.intents_mas_usados?.map((i, idx) => (
                                    <li key={idx}>{i.intent} ({i.total})</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </>
            )}

            {(user?.rol !== "admin" && user?.rol !== "soporte") && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md">
                    🔒 Algunas funciones administrativas están restringidas para tu rol (<strong>{user?.rol}</strong>).
                </div>
            )}

            <StatsChart />
        </div>
    );
}

export default StatsPage;