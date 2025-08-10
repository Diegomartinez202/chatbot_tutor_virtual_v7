// src/components/SettingsPanel.jsx
import React, { useEffect, useState } from "react";
import { X, Moon, Sun, Languages, Accessibility, LogOut, DoorClosed } from "lucide-react";

const LS_KEY = "app:settings";

const readLS = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
};
const writeLS = (obj) => localStorage.setItem(LS_KEY, JSON.stringify(obj));

export default function SettingsPanel({
    open,
    onClose,
    isAuthenticated = false,
    onLogout,         // () => void
    onCloseChat,      // () => void (si usas launcher)
    onLanguageChange, // (lang) => void
}) {
    const initial = {
        language: "es",
        darkMode: false,
        fontScale: 1,
        highContrast: false,
        ...readLS(),
    };
    const [state, setState] = useState(initial);

    // Aplicar efectos de accesibilidad/tema
    useEffect(() => {
        document.documentElement.classList.toggle("dark", !!state.darkMode);
        document.documentElement.style.fontSize = `${16 * (state.fontScale || 1)}px`;
        document.documentElement.classList.toggle("high-contrast", !!state.highContrast);
        writeLS(state);
        if (onLanguageChange) onLanguageChange(state.language);
    }, [state.darkMode, state.fontScale, state.highContrast, state.language]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999]">
            {/* overlay */}
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onClose}
                aria-hidden="true"
            />
            {/* panel */}
            <div
                role="dialog"
                aria-modal="true"
                className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col"
            >
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold">Configuración</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        aria-label="Cerrar"
                        title="Cerrar"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 space-y-6 overflow-auto">
                    {/* Tema */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Moon size={16} /> Apariencia
                        </h3>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setState((s) => ({ ...s, darkMode: !s.darkMode }))}
                                className="px-3 py-1.5 text-sm rounded border hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                {state.darkMode ? <span className="inline-flex items-center gap-1"><Sun size={14} /> Claro</span>
                                    : <span className="inline-flex items-center gap-1"><Moon size={14} /> Oscuro</span>}
                            </button>

                            <label className="text-sm flex items-center gap-2">
                                Tamaño de fuente
                                <input
                                    type="range"
                                    min="0.85"
                                    max="1.3"
                                    step="0.05"
                                    value={state.fontScale}
                                    onChange={(e) => setState((s) => ({ ...s, fontScale: Number(e.target.value) }))}
                                />
                            </label>
                        </div>
                    </section>

                    {/* Accesibilidad */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Accessibility size={16} /> Accesibilidad
                        </h3>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={state.highContrast}
                                onChange={(e) => setState((s) => ({ ...s, highContrast: e.target.checked }))}
                            />
                            Alto contraste
                        </label>
                        <p className="text-xs text-zinc-500">
                            Consejo: puedes ajustar más estilos de alto contraste en tu CSS global usando la clase <code>html.high-contrast</code>.
                        </p>
                    </section>

                    {/* Idioma */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Languages size={16} /> Idioma
                        </h3>
                        <select
                            className="border rounded px-3 py-1.5 text-sm bg-white dark:bg-zinc-900"
                            value={state.language}
                            onChange={(e) => setState((s) => ({ ...s, language: e.target.value }))}
                        >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                        </select>
                    </section>

                    {/* Sesión / Chat */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-medium">Sesión / Chat</h3>
                        <div className="flex gap-2 flex-wrap">
                            {isAuthenticated ? (
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded border bg-white hover:bg-zinc-50"
                                >
                                    <LogOut size={14} /> Cerrar sesión
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onCloseChat}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded border bg-white hover:bg-zinc-50"
                                >
                                    <DoorClosed size={14} /> Cerrar chat
                                </button>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
