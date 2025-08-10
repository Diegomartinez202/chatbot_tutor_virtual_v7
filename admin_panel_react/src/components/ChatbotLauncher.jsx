// src/components/ChatbotLauncher.jsx
import React from "react";

/**
 * Botón flotante para abrir/cerrar el chat.
 * Props:
 * - onClick: () => void
 * - avatarSrc: string (por defecto "/bot-avatar.png")
 * - size: number (px) tamaño del botón
 * - ariaLabel: string
 */
export default function ChatbotLauncher({
    onClick,
    avatarSrc = "/bot-avatar.png",
    size = 64,
    ariaLabel = "Abrir chat",
    title = "Abrir chat",
}) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            style={{ width: size, height: size }}
            aria-label={ariaLabel}
            title={title}
            type="button"
        >
            <img
                src={avatarSrc}
                alt="Chatbot"
                className="rounded-full object-cover"
                style={{ width: size, height: size }}
            />
        </button>
    );
}
