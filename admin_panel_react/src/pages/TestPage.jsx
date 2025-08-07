import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import axiosClient from "@/services/axiosClient";
import { useAdminActions } from "@/services/useAdminActions";
import FiltrosFecha from "@/components/FiltrosFecha";
import { toast } from "react-hot-toast";
import Badge from "@/components/Badge";
import {
    TestTube, Server, Bot, ListChecks, TimerReset,
    RefreshCw, Download
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

function TestPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { exportMutation } = useAdminActions();

    const [filtros, setFiltros] = useState({
        fechaInicio: null,
        fechaFin: null,
    });

    const tests = [
        {
            name: "Ejecutar test_all.sh",
            icon: <TestTube className="w-4 h-4 mr-2" />,
            fn: () => axiosClient.post("/admin/test-all"),
        },
        {
            name: "Backend conectado",
            icon: <Server className="w-4 h-4 mr-2" />,
            fn: () => axiosClient.get("/ping"),
        },
        {
            name: "Intents disponibles",
            icon: <ListChecks className="w-4 h-4 mr-2" />,
            fn: () => axiosClient.get("/admin/intents"),
        },
        {
            name: "Conexión a Rasa",
            icon: <Bot className="w-4 h-4 mr-2" />,
            fn: () => axiosClient.get("/admin/rasa/status"),
        },
        {
            name: "Estado de entrenamiento",
            icon: <TimerReset className="w-4 h-4 mr-2" />,
            fn: () => axiosClient.get("/admin/train?dry_run=true"),
        },
        {
            name: "Reiniciar servidor",
            icon: <RefreshCw className="w-4 h-4 mr-2" />,
            fn: () => axiosClient.post("/admin/restart"),
        },
        {
            name: "🔗 Conexión S3 (/admin/exportaciones/tests)",
            fn: () => axiosClient.get("/admin/exportaciones/tests"),
        },
    ];

    const runTest = async (name, fn) => {
        setLoading(true);
        setResults([]);
        try {
            const start = Date.now();
            const res = await fn();
            const latency = Date.now() - start;
            setResults([
                {
                    name,
                    status: res.status,
                    message: res.data?.message || JSON.stringify(res.data),
                    latency,
                },
            ]);
        } catch (err) {
            setResults([
                {
                    name,
                    status: err.response?.status || 500,
                    message: err.message,
                    latency: null,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const runAllTests = async () => {
        setResults([]);
        setLoading(true);
        for (let t of tests) {
            try {
                const start = Date.now();
                const res = await t.fn();
                const latency = Date.now() - start;
                setResults((prev) => [
                    ...prev,
                    {
                        name: t.name,
                        status: res.status,
                        message: res.data?.message || JSON.stringify(res.data),
                        latency,
                    },
                ]);
            } catch (err) {
                setResults((prev) => [
                    ...prev,
                    {
                        name: t.name,
                        status: err.response?.status || 500,
                        message: err.message,
                        latency: null,
                    },
                ]);
            }
        }
        setLoading(false);
    };

    const handleExport = () => {
        exportMutation.mutate(filtros);
    };

    const handleExportTestResults = async () => {
        try {
            const start = Date.now();
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
            toast.success("✅ Archivo descargado");

            const latency = Date.now() - start;
            setResults((prev) => [
                ...prev,
                {
                    name: "Exportar resultados test_all.sh",
                    status: 200,
                    message: "Archivo CSV exportado correctamente",
                    latency,
                },
            ]);
        } catch (err) {
            toast.error("❌ Error al exportar resultados");
            setResults((prev) => [
                ...prev,
                {
                    name: "Exportar resultados test_all.sh",
                    status: err.response?.status || 500,
                    message: err.message,
                    latency: null,
                },
            ]);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <Header title="🧪 Diagnóstico del Sistema" />
            {/* ✅ Tarjeta resumen del sistema */}
            <div className="bg-gray-100 p-4 rounded-lg shadow mb-6">
                <h2 className="text-md font-semibold mb-2">🔍 Estado General del Sistema</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded shadow flex items-center justify-between">
                        <span>Servidor Backend</span>
                        <Badge variant="success">✅ Activo</Badge>
                    </div>
                    <div className="p-4 bg-white rounded shadow flex items-center justify-between">
                        <span>Motor Rasa</span>
                        <Badge variant="success">✅ Conectado</Badge>
                    </div>
                    <div className="p-4 bg-white rounded shadow flex items-center justify-between">
                        <span>Base de datos</span>
                        <Badge variant="success">✅ MongoDB OK</Badge>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-end gap-4 flex-wrap">
                <FiltrosFecha filtros={filtros} setFiltros={setFiltros} />

                <div className="flex gap-2">
                    <Button onClick={handleExport} disabled={exportMutation.isLoading} variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Exportar CSV
                    </Button>
                    <Button onClick={handleExportTestResults} variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Exportar test_all.sh
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Button onClick={runAllTests} disabled={loading}>
                    {loading ? "⏳ Ejecutando todo..." : "🔍 Ejecutar todas las pruebas"}
                </Button>

                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 mt-4">
                    {tests.map((test, idx) => (
                        <Button
                            key={idx}
                            onClick={() => runTest(test.name, test.fn)}
                            disabled={loading}
                            variant="secondary"
                        >
                            <span className="flex items-center">{test.icon}{test.name}</span>
                        </Button>
                    ))}
                </div>

                {loading && (
                    <div className="mt-2 text-sm text-blue-500">
                        ⏱️ Ejecutando pruebas... por favor espera.
                    </div>
                )}
            </div>

            {results.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">📋 Resultados</h3>
                    <table className="min-w-full bg-white rounded shadow text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2">Prueba</th>
                                <th className="px-4 py-2">Estado</th>
                                <th className="px-4 py-2">Mensaje</th>
                                <th className="px-4 py-2">Latencia (ms)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => (
                                <tr key={i} className="border-t">
                                    <td className="px-4 py-2 font-medium">{r.name}</td>
                                    <td className="px-4 py-2">
                                        <Badge status={r.status} />
                                    </td>
                                    <td className="px-4 py-2 break-all max-w-[250px] text-gray-700">{r.message}</td>
                                    <td className="px-4 py-2 text-gray-500">{r.latency !== null ? `${r.latency} ms` : "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default TestPage;
