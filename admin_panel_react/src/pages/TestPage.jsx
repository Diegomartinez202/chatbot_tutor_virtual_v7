import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import axiosClient from "@/services/axiosClient";

// ✅ Íconos SVG desde Lucide
import {
    TestTube, Server, Bot, ListChecks, TimerReset,
    RefreshCw, Download
} from "lucide-react";

function DiagnosticoPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

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
            name: "Exportar resultados",
            icon: <Download className="w-4 h-4 mr-2" />,
            fn: async () => {
                const res = await axiosClient.get("/admin/export-tests", { responseType: "blob" });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "resultados_diagnostico.csv");
                document.body.appendChild(link);
                link.click();
                link.remove();
                return { status: 200, data: { message: "Exportación completada" } };
            }
        }
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
                    latency: `${latency} ms`,
                },
            ]);
        } catch (err) {
            setResults([
                {
                    name,
                    status: err.response?.status || 500,
                    message: err.message,
                    latency: "-",
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
                        latency: `${latency} ms`,
                    },
                ]);
            } catch (err) {
                setResults((prev) => [
                    ...prev,
                    {
                        name: t.name,
                        status: err.response?.status || 500,
                        message: err.message,
                        latency: "-",
                    },
                ]);
            }
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Header title="🧪 Diagnóstico del Sistema" />

            <div className="mb-6 space-y-2">
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
                                <th className="px-4 py-2">Latencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => (
                                <tr key={i}>
                                    <td className="border px-4 py-2">{r.name}</td>
                                    <td className={`border px-4 py-2 font-bold ${r.status === 200 ? "text-green-600" : "text-red-600"}`}>
                                        {r.status === 200 ? "✅ 200 OK" : `❌ ${r.status}`}
                                    </td>
                                    <td className="border px-4 py-2 break-words">{r.message}</td>
                                    <td className="border px-4 py-2">{r.latency}</td>
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