// src/components/chat/ChatUI.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, Loader2, AlertCircle, Image as ImgIcon, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { sendRasaMessage } from "@/services/chat/connectRasaRest";
import IconTooltip from "@/components/ui/IconTooltip";

export default function ChatUI({ embed = false, placeholder = "Escribe un mensaje…" }) {
    const { user } = useAuth();

    const [messages, setMessages] = useState([
        { id: "welcome", role: "bot", text: "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte?" },
    ]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [disabledActionGroups, setDisabledActionGroups] = useState(() => new Set());

    const listRef = useRef(null);
    const unreadRef = useRef(0);

    const userId = useMemo(() => user?.email || user?._id || null, [user]);

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            const el = listRef.current;
            if (!el) return;
            el.scrollTop = el.scrollHeight + 256;
        });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, sending, scrollToBottom]);

    // 🔔 avisar al host (launcher) del conteo de no leídos
    const postBadge = useCallback((count) => {
        try {
            if (typeof window !== "undefined" && window.parent && window.parent !== window) {
                window.parent.postMessage({ type: "chat:badge", count }, "*");
            }
        } catch { }
    }, []);

    useEffect(() => { unreadRef.current = 0; postBadge(0); }, [postBadge]);

    // Resetear a 0 cuando el host abre el panel
    useEffect(() => {
        const onMsg = (ev) => {
            const data = ev.data || {};
            if (data.type === "chat:visibility" && data.open === true) {
                unreadRef.current = 0;
                postBadge(0);
            }
        };
        window.addEventListener("message", onMsg);
        return () => window.removeEventListener("message", onMsg);
    }, [postBadge]);

    // Normalizar Rasa → UI
    const normalizeRasaItems = (rsp) => {
        const out = [];
        (rsp || []).forEach((item, idx) => {
            const baseId = `b-${Date.now()}-${idx}`;

            if (item.text) {
                out.push({ id: `${baseId}-t`, role: "bot", text: item.text });
            }
            if (item.image) {
                out.push({ id: `${baseId}-img`, role: "bot", image: item.image });
            }
            if (Array.isArray(item.buttons) && item.buttons.length) {
                out.push({
                    id: `${baseId}-btns`,
                    role: "bot",
                    buttons: item.buttons.map((b, i) => ({
                        id: `${baseId}-btn-${i}`,
                        title: b.title || b.payload || "Opción",
                        payload: b.payload || b.title || "",
                    })),
                });
            }
            if (Array.isArray(item.quick_replies) && item.quick_replies.length) {
                out.push({
                    id: `${baseId}-qr`,
                    role: "bot",
                    quickReplies: item.quick_replies.map((q, i) => ({
                        id: `${baseId}-qr-${i}`,
                        title: q.title || q.payload || "Opción",
                        payload: q.payload || q.title || "",
                    })),
                });
            }

            const c = item.custom;
            if (c && typeof c === "object") {
                // 1 card
                if (c.type === "card" || c.card) {
                    const card = c.card || c;
                    out.push({
                        id: `${baseId}-card`,
                        role: "bot",
                        card: {
                            title: card.title || "Tarjeta",
                            subtitle: card.subtitle || card.subtitle_text || "",
                            image: card.image || card.image_url || "",
                            buttons: (card.buttons || []).map((b, i) => ({
                                id: `${baseId}-card-btn-${i}`,
                                title: b.title || b.payload || "Abrir",
                                payload: b.payload || b.title || "",
                                url: b.url || b.link || "",
                            })),
                        },
                    });
                }
                // varias cards
                if (Array.isArray(c.cards)) {
                    c.cards.forEach((card, ci) => {
                        out.push({
                            id: `${baseId}-card-${ci}`,
                            role: "bot",
                            card: {
                                title: card.title || "Tarjeta",
                                subtitle: card.subtitle || "",
                                image: card.image || "",
                                buttons: (card.buttons || []).map((b, i) => ({
                                    id: `${baseId}-card-${ci}-btn-${i}`,
                                    title: b.title || b.payload || "Abrir",
                                    payload: b.payload || b.title || "",
                                    url: b.url || "",
                                })),
                            },
                        });
                    });
                }
            }
        });

        if (!out.length) {
            out.push({
                id: `b-${Date.now()}-empty`,
                role: "bot",
                text: "Hmm… no tengo una respuesta para eso. ¿Puedes reformular?",
            });
        }
        return out;
    };

    const sendToRasa = async ({ text, displayAs }) => {
        setError("");
        setSending(true);

        const userMsg = { id: `u-${Date.now()}`, role: "user", text: displayAs || text };
        setMessages((m) => [...m, userMsg]);
        setInput("");

        try {
            const rsp = await sendRasaMessage({
                text,
                sender: userId || undefined,
                metadata: { url: typeof location !== "undefined" ? location.href : undefined },
            });
            const botMsgs = normalizeRasaItems(rsp);
            setMessages((m) => [...m, ...botMsgs]);

            // 🔔 incrementar no leídos (si el panel no está “abierto” a ojos del host, lo verá en el badge)
            const inc = botMsgs.length || 1;
            unreadRef.current = Math.max(0, unreadRef.current + inc);
            postBadge(unreadRef.current);
        } catch (e) {
            console.error(e);
            setError(e?.message || "Error al enviar el mensaje");
            setMessages((m) => [
                ...m,
                { id: `b-${Date.now()}-err`, role: "bot", text: "Ocurrió un error al contactar al asistente. Intenta nuevamente." },
            ]);
        } finally {
            setSending(false);
        }
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text || sending) return;
        await sendToRasa({ text });
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleActionClick = async (groupId, { title, payload, url }) => {
        if (url) window.open(url, "_blank", "noopener,noreferrer");
        if (!payload) return;
        setDisabledActionGroups((prev) => new Set(prev).add(groupId));
        await sendToRasa({ text: payload, displayAs: title });
    };

    return (
        <div className={embed ? "h-full flex flex-col" : "h-full flex flex-col bg-white"}>
            {/* Mensajes */}
            <div ref={listRef} className={"flex-1 overflow-auto px-3 " + (embed ? "py-2" : "py-4 bg-white")}>
                <div className="max-w-3xl mx-auto space-y-3">
                    {messages.map((m) => {
                        const isUser = m.role === "user";
                        const bubbleCls = isUser ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800";
                        const commonCls = "rounded-2xl px-3 py-2 max-w-[75%] text-sm";

                        // Card
                        if (m.card) {
                            const gId = m.id;
                            const isDisabled = disabledActionGroups.has(gId);
                            return (
                                <div key={m.id} className="flex justify-start">
                                    <div className="rounded-xl border bg-white text-gray-800 max-w-[75%] overflow-hidden">
                                        {m.card.image ? (
                                            <img src={m.card.image} alt={m.card.title || "card"} className="w-full h-40 object-cover" loading="lazy" />
                                        ) : null}
                                        <div className="p-3">
                                            <div className="font-semibold">{m.card.title}</div>
                                            {m.card.subtitle ? <div className="text-xs text-gray-500 mt-0.5">{m.card.subtitle}</div> : null}
                                            {!!(m.card.buttons || []).length && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {m.card.buttons.map((b) => (
                                                        <button
                                                            key={b.id}
                                                            type="button"
                                                            onClick={() => handleActionClick(gId, b)}
                                                            disabled={isDisabled}
                                                            className={
                                                                "px-3 py-1.5 rounded-md text-sm border hover:bg-gray-50 inline-flex items-center gap-1 " +
                                                                (isDisabled ? "opacity-60 cursor-not-allowed" : "")
                                                            }
                                                            title={b.payload || b.url || ""}
                                                        >
                                                            {b.url ? <ExternalLink className="w-3.5 h-3.5" /> : null}
                                                            {b.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Buttons set
                        if (m.buttons) {
                            const gId = m.id;
                            const isDisabled = disabledActionGroups.has(gId);
                            return (
                                <div key={m.id} className="flex justify-start">
                                    <div className="rounded-2xl px-3 py-2 bg-gray-100 text-gray-800 max-w-[75%]">
                                        <div className="text-xs text-gray-500 mb-2">Elige una opción:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {m.buttons.map((b) => (
                                                <button
                                                    key={b.id}
                                                    type="button"
                                                    onClick={() => handleActionClick(gId, b)}
                                                    disabled={isDisabled}
                                                    className={
                                                        "px-3 py-1.5 rounded-md text-sm border hover:bg-gray-50 " +
                                                        (isDisabled ? "opacity-60 cursor-not-allowed" : "")
                                                    }
                                                    title={b.payload}
                                                >
                                                    {b.title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Quick replies
                        if (m.quickReplies) {
                            const gId = m.id;
                            const isDisabled = disabledActionGroups.has(gId);
                            return (
                                <div key={m.id} className="flex justify-start">
                                    <div className="rounded-2xl px-2 py-2 bg-gray-100 text-gray-800 max-w-[90%]">
                                        <div className="text-xs text-gray-500 mb-2">Sugerencias:</div>
                                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                            {m.quickReplies.map((q) => (
                                                <button
                                                    key={q.id}
                                                    type="button"
                                                    onClick={() => handleActionClick(gId, q)}
                                                    disabled={isDisabled}
                                                    className={
                                                        "px-3 py-1.5 rounded-full text-sm border whitespace-nowrap hover:bg-gray-50 " +
                                                        (isDisabled ? "opacity-60 cursor-not-allowed" : "")
                                                    }
                                                    title={q.payload}
                                                >
                                                    {q.title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Text / Image
                        return (
                            <div key={m.id} className={"flex " + (isUser ? "justify-end" : "justify-start")}>
                                <div className={`${commonCls} ${bubbleCls}`}>
                                    {m.text ? (
                                        <p className="whitespace-pre-wrap">{m.text}</p>
                                    ) : m.image ? (
                                        <div className="flex items-center gap-2">
                                            <ImgIcon className="w-4 h-4 opacity-70" />
                                            <a href={m.image} target="_blank" rel="noreferrer" className="underline">Ver imagen</a>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}

                    {sending && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl px-3 py-2 bg-gray-100 text-gray-600 text-sm inline-flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Escribiendo…
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error inline */}
            {error ? (
                <div className="px-3">
                    <div className="max-w-3xl mx-auto my-2 text-xs text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </div>
                </div>
            ) : null}

            {/* Input */}
            <div className={"border-t " + (embed ? "p-2" : "p-3 bg-white")}>
                <div className="max-w-3xl mx-auto flex items-end gap-2">
                    <textarea
                        className="w-full resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder={placeholder}
                        rows={2}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        disabled={sending}
                    />
                    <IconTooltip content="Enviar (Enter)">
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={sending || !input.trim()}
                            className="inline-flex items-center justify-center rounded-md bg-indigo-600 text-white px-3 py-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Enviar"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </IconTooltip>
                </div>
            </div>
        </div>
    );
}