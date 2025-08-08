// src/components/ResumenSistema.jsx
import { useEffect, useState } from "react";
import { getStats } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { toast } from "react-hot-toast";

function ResumenSistema() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getStats();
                setStats(data);
            } catch (err) {
                toast.error("❌ Error al cargar estadísticas");
            }
        }
        fetchStats();
    }, []);

    if (!stats) return <p>Cargando resumen...</p>;

    return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mt-6">
            <Card>
                <CardContent className="p-4">
                    📄 Total logs: <strong>{stats.total_logs}</strong>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    👥 Total usuarios: <strong>{stats.total_usuarios}</strong>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    💬 Intents definidos: <strong>{stats.total_intents}</strong>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 space-y-1">
                    <strong>🎯 Intents más usados</strong>
                    {stats.intents_mas_usados?.map((i, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <span>{i.intent}</span>
                            <Badge
                                variant={
                                    i.intent.includes("error")
                                        ? "destructive"
                                        : i.intent.includes("soporte")
                                            ? "warning"
                                            : "info"
                                }
                            >
                                {i.count}
                            </Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 space-y-1">
                    <strong>🛡️ Usuarios por rol</strong>
                    {Object.entries(stats.usuarios_por_rol).map(([rol, cantidad], idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <span>{rol}</span>
                            <Badge
                                variant={
                                    rol === "admin"
                                        ? "success"
                                        : rol === "soporte"
                                            ? "warning"
                                            : "secondary"
                                }
                            >
                                {cantidad}
                            </Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 space-y-1">
                    <strong>🕓 Últimos usuarios</strong>
                    {stats.ultimos_usuarios?.map((u, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <span>{u.nombre}</span>
                            {idx === 0 && <Badge variant="info">Nuevo</Badge>}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export default ResumenSistema;