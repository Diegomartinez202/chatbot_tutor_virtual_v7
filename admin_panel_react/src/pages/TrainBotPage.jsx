// src/pages/TrainBotPage.jsx
import React from "react";
import TrainBotButton from "@/components/TrainBotButton";
import { BrainCog } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

function TrainBotPage() {
    return (
        <div className="p-6 space-y-6">
            {/* Encabezado */}
            <div className="flex items-center gap-2 mb-4">
                <Tooltip.Provider>
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <BrainCog className="w-6 h-6 text-gray-700" />
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content className="tooltip" side="top">
                                Entrenamiento del modelo conversacional
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </Tooltip.Provider>
                <h1 className="text-2xl font-bold">Reentrenar Chatbot</h1>
            </div>

            {/* Explicaci�n */}
            <p className="text-gray-700 max-w-2xl">
                Este proceso reentrena el modelo Rasa con los intents actualizados. Aseg�rate de haber
                cargado correctamente todos los datos antes de continuar. Este proceso puede tardar unos segundos.
            </p>

            {/* Bot�n para reentrenar */}
            <TrainBotButton />
        </div>
    );
}

export default TrainBotPage;