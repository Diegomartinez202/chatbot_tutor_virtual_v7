import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import { Button } from "@/components/ui/button";
import ExportIntentsButton from '../components/ExportIntentsButton';
import UploadIntentsCSV from "../components/UploadIntentsCSV";
import UploadIntentsJSON from "../components/UploadIntentsJSON";
import TrainBotButton from "../components/TrainBotButton";
import { addIntent, fetchIntentsByFilters } from '../services/api';

function IntentsPage() {
    const [intent, setIntent] = useState('');
    const [examples, setExamples] = useState('');
    const [response, setResponse] = useState('');
    const [results, setResults] = useState([]);
    const [filters, setFilters] = useState({ intent: '', example: '', response: '' });
    const [loadingSearch, setLoadingSearch] = useState(false);

    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: () =>
            addIntent({
                intent,
                examples: examples.split('\n').filter(Boolean),
                response,
            }),
        onSuccess: () => {
            setIntent('');
            setExamples('');
            setResponse('');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!intent.trim() || !examples.trim() || !response.trim()) return;
        mutation.mutate();
    };

    const handleSearch = async () => {
        setLoadingSearch(true);
        try {
            const data = await fetchIntentsByFilters(filters);
            setResults(data);
        } catch (error) {
            console.error("Error al buscar intents", error);
        }
        setLoadingSearch(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">✏️ Crear nuevo Intent</h2>

            {/* 📦 Botones de herramientas */}
            <div className="flex gap-3 mb-4">
                <ExportIntentsButton />
                <TrainBotButton /> {/* ✅ Reentrenar bot */}
                <Button variant="outline" type="button" onClick={() => navigate('/intents/list')}>
                    📄 Ver Intents existentes
                </Button>
            </div>

            {/* 📝 Formulario de creación */}
            <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="intent-status">
                <Input label="Nombre del Intent" value={intent} onChange={(e) => setIntent(e.target.value)} required />
                <Textarea label="Frases de ejemplo (una por línea)" rows={5} value={examples} onChange={(e) => setExamples(e.target.value)} required />
                <Textarea label="Respuesta del chatbot" rows={2} value={response} onChange={(e) => setResponse(e.target.value)} required />
                <Button type="submit" disabled={mutation.isLoading}>
                    {mutation.isLoading ? 'Creando...' : 'Crear Intent'}
                </Button>
            </form>

            {/* 🟢 Estado del envío */}
            <div id="intent-status" aria-live="polite" className="min-h-[1.5rem] mt-2">
                {!mutation.isLoading && mutation.isError && <p className="text-red-600">❌ Error al crear el intent</p>}
                {!mutation.isLoading && mutation.isSuccess && <p className="text-green-600">✅ Intent creado correctamente</p>}
            </div>

            {/* 📤 Subida de archivos */}
            <UploadIntentsCSV />
            <UploadIntentsJSON />

            <hr className="my-6" />
            <h3 className="text-lg font-semibold mb-2">🔍 Buscar intents</h3>

            {/* 🔎 Filtros de búsqueda */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <Input placeholder="Buscar por intent" value={filters.intent} onChange={(e) => setFilters({ ...filters, intent: e.target.value })} />
                <Input placeholder="Buscar por ejemplo" value={filters.example} onChange={(e) => setFilters({ ...filters, example: e.target.value })} />
                <Input placeholder="Buscar por respuesta" value={filters.response} onChange={(e) => setFilters({ ...filters, response: e.target.value })} />
            </div>

            <Button onClick={handleSearch} disabled={loadingSearch}>
                {loadingSearch ? "Buscando..." : "🔍 Buscar"}
            </Button>

            {/* 📋 Resultados */}
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

export default IntentsPage;