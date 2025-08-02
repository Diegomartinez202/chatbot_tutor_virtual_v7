// src/pages/StadisticasLogsPage.jsx

import { useEffect, useState } from "react";
import { getExportStats } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const StadisticasLogsPage = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const result = await getExportStats();
                const formatted = Object.entries(result).map(([date, count]) => ({
                    fecha: date,
                    exportaciones: count,
                }));
                setData(formatted);
            } catch (error) {
                console.error("Error al cargar estadísticas:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">📊 Estadísticas de Exportaciones de Logs</h1>
            {data.length === 0 ? (
                <p className="text-gray-600">No hay exportaciones registradas aún.</p>
            ) : (
                <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="exportaciones" fill="#4F46E5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default StadisticasLogsPage;