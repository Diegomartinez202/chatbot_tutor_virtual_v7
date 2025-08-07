// src/components/IntentsTable.jsx
import React, { useEffect, useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

// Simulador
const mockIntents = [
    { intent: "saludo", example: "Hola, ¿cómo estás?", response: "¡Hola! ¿En qué puedo ayudarte?" },
    { intent: "despedida", example: "Adiós", response: "¡Hasta pronto!" },
];

const IntentsTable = () => {
    const [intents, setIntents] = useState([]);

    useEffect(() => {
        // Aquí deberías obtener desde la API real
        setIntents(mockIntents);
    }, []);

    return (
        <div className="mt-6">
            <table className="w-full text-sm border">
                <thead className="bg-gray-100 text-left">
                    <tr>
                        <th className="p-2 border">Intent</th>
                        <th className="p-2 border">Ejemplo</th>
                        <th className="p-2 border">Respuesta</th>
                        <th className="p-2 border">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {intents.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center p-4 text-gray-500">
                                No hay intents registrados
                            </td>
                        </tr>
                    ) : (
                        intents.map((item, index) => (
                            <tr key={index}>
                                <td className="p-2 border">{item.intent}</td>
                                <td className="p-2 border">{item.example}</td>
                                <td className="p-2 border">{item.response}</td>
                                <td className="p-2 border space-x-2">
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <button className="text-blue-600 hover:text-blue-800">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content className="bg-black text-white text-xs rounded px-2 py-1">
                                                Ver detalles
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>

                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <button className="text-red-600 hover:text-red-800">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content className="bg-black text-white text-xs rounded px-2 py-1">
                                                Eliminar intent
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default IntentsTable;