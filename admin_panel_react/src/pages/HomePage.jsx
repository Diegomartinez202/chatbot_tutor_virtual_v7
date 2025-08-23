// src/pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui"; // si tienes barrel de ui, si no usa un <button> simple

export default function HomePage() {
    const navigate = useNavigate();

    const goGuest = () => {
        // Chat público sin login
        navigate("/chat");
    };

    const goZajuna = () => {
        // Si tienes SSO/ OAuth externo de Zajuna, define esta ENV:
        // VITE_ZAJUNA_SSO_URL = "https://zajuna.example.com/oauth/authorize?client_id=...&redirect_uri=..."
        const sso = import.meta.env.VITE_ZAJUNA_SSO_URL;
        if (sso) {
            window.location.href = sso; // va al proveedor SSO
        } else {
            // fallback: usa tu LoginPage local
            navigate("/login");
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                <img
                    src="/bot-avatar.png"
                    alt="Avatar del Chatbot"
                    className="mx-auto mb-6 w-40 h-40 object-contain"
                    loading="eager"
                />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    ¡Bienvenido al <span className="text-indigo-600">Chatbot Tutor Virtual</span>!
                </h1>
                <p className="text-gray-600 mb-8">
                    Elige cómo deseas entrar:
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {/* Entrar sin login */}
                    <button
                        type="button"
                        onClick={goGuest}
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-5 py-3 text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        Entrar sin login
                    </button>

                    {/* Entrar con autenticación (Zajuna / Login local) */}
                    <button
                        type="button"
                        onClick={goZajuna}
                        className="inline-flex items-center justify-center rounded-lg bg-white text-gray-900 px-5 py-3 text-sm font-medium border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        Entrar con autenticación
                    </button>
                </div>

                <p className="text-xs text-gray-400 mt-6">
                    Consejo: si tienes SSO Zajuna, define <code>VITE_ZAJUNA_SSO_URL</code> en tu <code>.env</code>.
                </p>
            </div>
        </main>
    );
}