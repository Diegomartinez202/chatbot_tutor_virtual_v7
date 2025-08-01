import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import { Button } from "@/components/ui/button";
import ExportIntentsButton from '@/components/ExportIntentsButton';
import { addIntent } from '@/services/api';

function CrearIntentPage() {
    const [intent, setIntent] = useState('');
    const [examples, setExamples] = useState('');
    const [response, setResponse] = useState('');
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

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">✏️ Crear nuevo Intent</h2>

            <div className="flex gap-3 mb-4">
                <ExportIntentsButton />
                <Button variant="outline" type="button" onClick={() => navigate('/intents/buscar')}>
                    🔍 Buscar Intents
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="intent-status">
                <Input label="Nombre del Intent" value={intent} onChange={(e) => setIntent(e.target.value)} required />
                <Textarea label="Frases de ejemplo (una por línea)" rows={5} value={examples} onChange={(e) => setExamples(e.target.value)} required />
                <Textarea label="Respuesta del chatbot" rows={2} value={response} onChange={(e) => setResponse(e.target.value)} required />
                <Button type="submit" disabled={mutation.isLoading}>
                    {mutation.isLoading ? 'Creando...' : 'Crear Intent'}
                </Button>
            </form>

            <div id="intent-status" aria-live="polite" className="min-h-[1.5rem] mt-2">
                {!mutation.isLoading && mutation.isError && <p className="text-red-600">❌ Error al crear el intent</p>}
                {!mutation.isLoading && mutation.isSuccess && <p className="text-green-600">✅ Intent creado correctamente</p>}
            </div>
        </div>
    );
}

export default CrearIntentPage;