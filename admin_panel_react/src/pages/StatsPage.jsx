// src/pages/StatsPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import BotonesAdmin from "@/components/BotonesAdmin";
import DateRangeFilter from "@/components/DateRangeFilter";
import StatsChart from "@/components/StatsChart";
import { BarChart2, Lock, FileText, Users, Download, Brain } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { toast } from "react-hot-toast";
import axiosClient from "@/services/axiosClient";
import Badge from "@/components/ui/Badge"; // ✅ IMPORTADO

function StatsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axiosClient.get("/admin/stats", {
                    params: { desde, hasta },
                });
                setStats(res.data);
            } catch (err) {
                console.error("Error cargando estadísticas", err);
                toast.error("❌ Error al obtener estadísticas");
            }
        };
        fetchStats();
    }, [desde, hasta]);

    const handleExportTest = async () => {
        try {
            const res = await axiosClient.get("/admin/exportaciones/tests", {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "resultados_test.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("✅ Archivo descargado correctamente");
        } catch (err) {
            console.error(err);
            toast.error("❌ Error al exportar resultados de test_all.sh");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart2 size={22} /> Estadísticas del Chatbot
            </h1>

            {(user?.rol === "admin" || user?.rol === "soporte") ? (
                <>
                    <BotonesAdmin />
                    <DateRangeFilter desde={desde} hasta={hasta} setDesde={setDesde} setHasta={setHasta} />

                    <div className="mt-4 flex justify-end">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={handleExportTest}
                                        className="flex items-center gap-2 text-sm px-4 py-2 border rounded bg-white hover:bg-gray-100 shadow"
                                    >
                                        <Download size={16} /> Exportar test_all.sh
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        className="tooltip bg-black text-white px-2 py-1 rounded text-sm"
                                        side="bottom"
                                    >
                                        Descargar resultados del script test_all.sh
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <Tooltip.Provider>
                            <div className="bg-white shadow rounded-md p-4">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <p className="text-gray-500 flex items-center gap-2 cursor-help">
                                            <FileText size={16} /> Total de logs
                                        </p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content side="top">
                                            Registros almacenados por el chatbot
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <p className="text-lg font-bold">{stats?.total_logs ?? "..."}</p>
                            </div>

                            <div className="bg-white shadow rounded-md p-4">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <p className="text-gray-500 flex items-center gap-2 cursor-help">
                                            <Download size={16} /> Exportaciones CSV
                                        </p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content side="top">
                                            Cantidad de archivos descargados
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <p className="text-lg font-bold">{stats?.total_exportaciones_csv ?? "..."}</p>
                            </div>

                            <div className="bg-white shadow rounded-md p-4">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <p className="text-gray-500 flex items-center gap-2 cursor-help">
                                            <Users size={16} /> Total usuarios
                                        </p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content side="top">
                                            Número total de usuarios en el sistema
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <p className="text-lg font-bold">{stats?.total_usuarios ?? "..."}</p>
                            </div>

                            <div className="bg-white shadow rounded-md p-4">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <p className="text-gray-500 cursor-help">Últimos usuarios</p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content side="top">
                                            Últimos usuarios registrados
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <ul className="list-disc ml-5 text-xs">
                                    {stats?.ultimos_usuarios?.map((u, i) => (
                                        <li key={i}>{u.email}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white shadow rounded-md p-4">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <p className="text-gray-500 cursor-help">Usuarios por rol</p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content side="top">
                                            Distribución de roles en el sistema
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <ul className="list-disc ml-5 text-xs">
                                    {stats?.usuarios_por_rol?.map((r, i) => (
                                        <li key={i}>
                                            <Badge variant={r.rol}>{r.rol}</Badge>: {r.total}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white shadow rounded-md p-4 col-span-2">
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <p className="text-gray-500 flex items-center gap-2 cursor-help">
                                            <Brain size={16} /> Intents más usados
                                        </p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content side="top">
                                            Intents con mayor frecuencia de uso
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                                <ul className="list-disc ml-5 text-xs">
                                    {stats?.intents_mas_usados?.map((item, i) => (
                                        <li key={i}>
                                            <Badge variant="info">{item.intent}</Badge> ({item.total})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Tooltip.Provider>
                    </div>

                    <StatsChart desde={desde} hasta={hasta} />
                </>
            ) : (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md flex items-center gap-2">
                    <Lock size={16} /> Acceso restringido para tu rol (<strong>{user?.rol}</strong>)
                </div>
            )}
        </div>
    );
}

export default StatsPage;