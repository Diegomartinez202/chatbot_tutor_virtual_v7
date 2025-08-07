// src/components/IntentsForm.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const IntentsForm = () => {
    const [intent, setIntent] = useState("");
    const [example, setExample] = useState("");
    const [response, setResponse] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!intent || !example || !response) {
            toast.error("❌ Todos los campos son obligatorios");
            return;
        }

        // Aquí puedes usar tu servicio real
        toast.success("✅ Intent enviado correctamente (simulado)");
        setIntent("");
        setExample("");
        setResponse("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded shadow-md">
            <div>
                <label className="block font-semibold mb-1">Intent:</label>
                <input
                    type="text"
                    className="w-full border px-3 py-2"
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    placeholder="ej: saludo"
                />
            </div>
            <div>
                <label className="block font-semibold mb-1">Ejemplo:</label>
                <input
                    type="text"
                    className="w-full border px-3 py-2"
                    value={example}
                    onChange={(e) => setExample(e.target.value)}
                    placeholder="ej: Hola, ¿cómo estás?"
                />
            </div>
            <div>
                <label className="block font-semibold mb-1">Respuesta:</label>
                <input
                    type="text"
                    className="w-full border px-3 py-2"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="ej: ¡Hola! Estoy aquí para ayudarte."
                />
            </div>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                ➕ Agregar Intent
            </Button>
        </form>
    );
};

export default IntentsForm;