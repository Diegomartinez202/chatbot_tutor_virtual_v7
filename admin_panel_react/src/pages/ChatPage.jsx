// src/pages/ChatPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Bot, RefreshCw } from "lucide-react";
import ChatUI from "@/components/chat/ChatUI";
import ChatbotLoading from "@/components/ChatbotLoading";
import ChatbotStatusMini from "@/components/ChatbotStatusMini";
import { useAuth } from "@/context/AuthContext";

/**
 * Página completa del chat.
 * - Mantiene compat con /chat
 * - Soporta modo embed (?embed=1) o prop forceEmbed (no exige login y recorta el chrome)
 * - Muestra estados: connecting / error / ready
 * - Cuando está lista, renderiza children o ChatUI por defecto
 */
export default function ChatPage({
    forceEmbed = false,
    avatarSrc = "/bot-avatar.png",
    title = "Asistente",
    connectFn,     // opcional: función de conexión real (health/socket)
    children,      // opcional: tu UI de chat; si no viene, usa <ChatUI />
}) {
    const [params] = useSearchParams();
    const isEmbed = forceEmbed || params.get("embed") === "1";

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [status, setStatus] = useState("connecting"); // connecting | ready | error

    const connect = useCallback(async () => {
        setStatus("connecting");
        try {
            if (connectFn) {
                await connectFn();
            } else {
                // Stub de conexión para no bloquear mientras se cablea la API real
                await new Promise((r) => setTimeout(r, 700));
            }
            setStatus("ready");
        } catch {
            setStatus("error");
        }
    }, [connectFn]);

    useEffect(() => {
        connect();
    }, [connect]);

    // Si NO es embed y NO está autenticado → redirige a /login
    useEffect(() => {
        if (!isEmbed && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isEmbed, isAuthenticated, navigate]);

    if (!isEmbed && !isAuthenticated) return null;

    return (
        <div className={isEmbed ? "p-0 h-[560px]" : "p-6 min-h-[70vh] flex flex-col"}>
            {/* Header (oculto en embed) */}
            {!isEmbed && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Bot className="w-6 h-6 text-indigo-600" />
                        <h1 className="text-2xl font-bold">{title}</h1>
                    </div>
                    <ChatbotStatusMini status={status} />
                </div>
            )}

            {/* Body */}
            <div className={isEmbed ? "h-full" : "flex-1 bg-white rounded border shadow overflow-hidden"}>
                {status === "connecting" && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
                        <ChatbotLoading avatarSrc={avatarSrc} label="Conectando…" />
                        <ChatbotStatusMini status="connecting" />
                    </div>
                )}

                {status === "error" && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                        <p className="text-gray-700">No pudimos conectar con el servicio de chat.</p>
                        <button
                            onClick={connect}
                            className="inline-flex items-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-100"
                            type="button"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reintentar
                        </button>
                    </div>
                )}

                {status === "ready" && (
                    <div className="w-full h-full">
                        {/* Tu widget real: Rasa, iframe, o UI propia; si no, ChatUI por defecto */}
                        {children ?? <ChatUI embed={isEmbed} />}
                    </div>
                )}
            </div>
        </div>
    );
}