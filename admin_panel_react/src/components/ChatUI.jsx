// src/components/chat/ChatUI.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SendHorizonal, RefreshCw } from "lucide-react";
import ChatbotLoading from "@/components/ChatbotLoading";
import ChatbotStatusMini from "@/components/ChatbotStatusMini";
import { connectChat, sendTextMessage } from "@/services/chatClient";
import { useAuth } from "@/context/AuthContext";

export default function ChatUI({
    embed = false,                 // si es iframe/embebido
    baseUrl,                       // opcional: override de VITE_RASA_BASE_URL
    avatarSrc = "/bot-avatar.png",
    className = "",
}) {
    const { user } = useAuth?.() || {};
    const senderId = useMemo(() => user?.email || user?._id || `anon-${Date.now()}`, [user]);

    const [status, setStatus] = useState("connecting"); // connecting | ready | error
    const [messages, setMessages] = useState([]);       // {from: "user"|"bot", text}
    const [text, setText] = useState("");
    const listRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setStatus("connecting");
                const ok = await connectChat({ baseUrl });
                if (mounted && ok) setStatus("ready");
            } catch (e) {
                if (mounted) setStatus("error");
            }
        })();
        return () => (mounted = false);
    }, [baseUrl]);

    useEffect(() => {
        // scroll al final
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    const send = async () => {
        const value = text.trim();
        if (!value || status !== "ready") return;
        setMessages((m) => [...m, { from: "user", text: value }]);
        setText("");
        try {
            const resp = await sendTextMessage({ baseUrl, sender: senderId, text: value });
            // Rasa suele devolver [{text}, {image}...]
            const bundle = Array.isArray(resp) ? resp : [];
            bundle.forEach((it) => {
                if (it?.text) {
                    setMessages((m) => [...m, { from: "bot", text: it.text }]);
                }
            });
        } catch (e) {
            setMessages((m) => [...m, { from: "bot", text: "Ups, hubo un error al enviar el mensaje." }]);
            setStatus("error");
        }
    };

    if (status === "connecting") {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <ChatbotLoading label="Conectando con el asistente…" />
                <div className="mt-3">
                    <ChatbotStatusMini status="connecting" />
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-3">
                <ChatbotStatusMini status="error" />
                <button
                    onClick={() => {
                        setStatus("connecting");
                        // relanza conexión
                        (async () => {
                            try {
                                const ok = await connectChat({ baseUrl });
                                if (ok) setStatus("ready");
                            } catch {
                                setStatus("error");
                            }
                        })();
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border rounded bg-white hover:bg-gray-100 shadow"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reintentar
                </button>
            </div>
        );
    }

    // ready
    return (
        <div className={["flex flex-col h-full", className].join(" ")}>
            {!embed && (
                <div className="px-3 py-2 border-b bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={avatarSrc} alt="bot" className="w-6 h-6 rounded-full" />
                        <span className="font-semibold text-sm">Asistente</span>
                    </div>
                    <ChatbotStatusMini status="ready" className="!gap-1" />
                </div>
            )}

            <div ref={listRef} className="flex-1 overflow-y-auto p-3 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="text-sm text-gray-500">Escribe un mensaje para comenzar…</div>
                ) : (
                    <ul className="space-y-2">
                        {messages.map((m, i) => (
                            <li
                                key={i}
                                className={m.from === "user" ? "text-right" : "text-left"}
                            >
                                <span
                                    className={[
                                        "inline-block px-3 py-2 rounded-lg",
                                        m.from === "user"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white border",
                                    ].join(" ")}
                                >
                                    {m.text}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="p-3 border-t bg-white flex items-center gap-2">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Escribe tu mensaje…"
                    className="flex-1 border rounded px-3 py-2"
                />
                <button
                    onClick={send}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
                    disabled={!text.trim()}
                >
                    <SendHorizonal className="w-4 h-4" />
                    Enviar
                </button>
            </div>
        </div>
    );
}