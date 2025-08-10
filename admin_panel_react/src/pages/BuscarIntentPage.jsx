// src/pages/BuscarIntentPage.jsx
import { useState } from 'react';
import Input from "@/components/Input";                    // ✅ corregido
import { Button } from "@/components/ui/button";
import { fetchIntentsByFilters } from "@/services/api";   // ✅ corregido
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Plus } from "lucide-react";
import IconTooltip from "@/components/ui/IconTooltip";

function BuscarIntentPage() {
    const [filters, setFilters] = useState({ intent: '', example: '', response: '' });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await fetchIntentsByFilters(filters);
            setResults(data);
        } catch (error) {
            console.error("Error al buscar intents", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
                <IconTooltip label="Buscar Intents" side="top">
                    <SearchIcon className="w-6 h-6 text-gray-700" />
                </IconTooltip>
                <h2 className="text-xl font-semibold">Buscar Intents</h2>
            </div>

            <div className="flex gap-3 mb-4">
                <IconTooltip label="Crear nuevo Intent" side="top">
                    <Button type="button" variant="outline" onClick={() => navigate('/intents')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Nuevo Intent
                    </Button>
                </IconTooltip>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <Input
                    placeholder="Intent"
                    value={filters.intent}
                    onChange={(e) => setFilters({ ...filters, intent: e.target.value })}
                />
                <Input
                    placeholder="Ejemplo"
                    value={filters.example}
                    onChange={(e) => setFilters({ ...filters, example: e.target.value })}
                />
                <Input
                    placeholder="Respuesta"
                    value={filters.response}
                    onChange={(e) => setFilters({ ...filters, response: e.target.value })}
                />
            </div>

            <IconTooltip label="Ejecutar búsqueda" side="top">
                <Button onClick={handleSearch} disabled={loading} type="button">
                    <SearchIcon className="w-4 h-4 mr-2" />
                    {loading ? "Buscando..." : "Buscar"}
                </Button>
            </IconTooltip>

            <div className="mt-6">
                {results.length > 0 ? (
                    <table className="min-w-full bg-white rounded shadow">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2">Intent</th>
                                <th className="px-4 py-2">Ejemplos</th>
                                <th className="px-4 py-2">Respuestas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r) => (
                                <tr key={r.id}>
                                    <td className="border px-4 py-2 font-semibold">{r.intent}</td>
                                    <td className="border px-4 py-2">
                                        <ul className="list-disc list-inside text-sm">
                                            {r.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                                        </ul>
                                    </td>
                                    <td className="border px-4 py-2">
                                        <ul className="list-disc list-inside text-sm">
                                            {r.responses.map((res, i) => <li key={i}>{res}</li>)}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-600 mt-4">No hay resultados aún.</p>
                )}
            </div>
        </div>
    );
}

export default BuscarIntentPage;