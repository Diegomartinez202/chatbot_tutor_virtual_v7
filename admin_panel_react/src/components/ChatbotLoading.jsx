// src/components/ChatbotLoading.jsx
import React from "react";

/**
 * Loader del chatbot con avatar.
 * Props:
 * - avatarSrc: string (ruta pública, ej: "/bot-loading.png" o "/bot-avatar.png")
 * - label: string
 * - useSpinner: boolean (muestra spinner superpuesto)
 */
export default function ChatbotLoading({
    avatarSrc = "/bot-loading.png",
    label = "Cargando…",
    useSpinner = true,
}) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="relative">
                <img
                    src={avatarSrc}
                    alt="Avatar del chatbot"
                    className="w-20 h-20 rounded-full object-cover shadow-lg"
                    loading="eager"
                />
                {useSpinner && (
                    <span
                        aria-hidden="true"
                        className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white animate-spin"
                        style={{
                            borderTopColor: "transparent",
                            borderRightColor: "currentColor",
                            borderBottomColor: "currentColor",
                            borderLeftColor: "currentColor",
                        }}
                    />
                )}
            </div>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    );
}
