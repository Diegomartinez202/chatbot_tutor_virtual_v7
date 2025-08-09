// src/pages/IntentosFallidosPage.jsx
import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { BarChart3, Download, RefreshCw } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as ReTooltip,
    CartesianGrid,
} from "recharts";

import FiltrosFecha from "@/components/FiltrosFecha";
import { getTopFailedIntents, exportFailedIntentsCSV } from "@/services/api";
import FallbackLogsTable from "@/components/FallbackLogsTable";

const IntentosFallidosPage = () => {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [limit, setLimit] = useState(10);

    // 👇 Estado levantado desde la tabla para sincronizar export "arriba"
    const [selectedIntent, setSelectedIntent] = useState("");

    const queryKey = useMemo(
        () => ["topFailedIntents", { desde, hasta, limit }],
        [desde, hasta, limit]
    );

    const { data = [], isFetching, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            const list = await getTopFailedIntents({
                desde,
                hasta,
                limit: Number(limit) || 10,
            });
            return Array.isArray(list) ? list : [];
        },
    });

    const exportMutation = useMutation({
        mutationFn: () =>
            exportFailedIntentsCSV({
                desde,
                hasta,
                intent: selectedIntent || undefined, // 👈 incluye intent elegido
            }),
        onSuccess: () => toast.success("✅ CSV generado"),
        onError: () => toast.error("❌ Error al exportar CSV"),
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 size={22} /> Intentos Fallidos del Chatbot
                </h1>

                <div className="flex items-end gap-2">
                    <FiltrosFecha desde={desde} hasta={hasta} setDesde={setDesde} setHasta={setHasta} />

                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600 mb-1">Límite</label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className="border px-3 py-2 rounded-md w-[100px]"
                        />
                    </div>

                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="flex items-center gap-2 text-sm px-3 py-2 border rounded bg-white hover:bg-gray-100 shadow"
                    >
                        <RefreshCw className={isFetching ? "animate-spin" : ""} size={16} />
                        {isFetching ? "Actualizando..." : "Actualizar"}
                    </button>

                    <button
                        onClick={() => exportMutation.mutate()}
                        disabled={exportMutation.isLoading}
                        className="flex items-center gap-2 text-sm px-3 py-2 border rounded bg-white hover:bg-gray-100 shadow"
                        title={selectedIntent ? `Exportando intent: ${selectedIntent}` : "Exportar CSV"}
                    >
                        <Download size={16} />
                        {exportMutation.isLoading ? "Exportando..." : "Exportar CSV"}
                    </button>
                </div>
            </div>

            <div className="w-full h-[380px] bg-white rounded-md shadow border border-gray-200">
                {isFetching ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        Cargando…
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        No hay datos disponibles.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="intent" />
                            <YAxis allowDecimals={false} />
                            <ReTooltip />
                            <Bar dataKey="count" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* 📋 Logs de fallos con filtro por intent + export (controlado desde el padre) */}
            <FallbackLogsTable
                desde={desde}
                hasta={hasta}
                intents={data}               // para poblar el dropdown
                initialIntent={selectedIntent} // valor inicial
                // 👇 asegúrate de que el componente llame a este callback al cambiar el dropdown
                onIntentChange={setSelectedIntent}
            />
        </div>
    );
};

export default IntentosFallidosPage;