import { useEffect, useState } from "react";
import { getIntents } from "../services/api";
import BackButton from "../components/BackButton";
import RefreshButton from "../components/RefreshButton";

const ListIntents = () => {
    const [intents, setIntents] = useState([]);
    const [loading, setLoading] = useState(false);

    const cargarIntents = async () => {
        setLoading(true);
        try {
            const data = await getIntents();
            setIntents(data);
        } catch (error) {
            console.error("Error al cargar intents:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        cargarIntents();
    }, []);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">📋 Lista de Intents</h2>
                <div className="flex gap-2">
                    <BackButton to="/intents" label="Volver a crear Intent" />
                    <RefreshButton onClick={cargarIntents} loading={loading} />
                </div>
            </div>

            <div className="overflow-auto rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Intent</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ejemplos</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Respuestas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {intents.map((intent) => (
                            <tr key={intent.intent}>
                                <td className="px-4 py-2 font-semibold">{intent.intent}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                    <ul className="list-disc list-inside">
                                        {intent.examples.map((ex, idx) => (
                                            <li key={idx}>{ex}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                    <ul className="list-disc list-inside">
                                        {intent.responses.map((res, idx) => (
                                            <li key={idx}>{res}</li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                        {intents.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-4 py-4 text-center text-gray-500">
                                    No hay intents disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListIntents;