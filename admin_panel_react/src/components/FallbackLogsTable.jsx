// src/components/FallbackLogsTable.jsx
import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getFailedLogs, exportFailedIntentsCSV } from "@/services/api";
import { formatDate } from "@/utils/formatDate";
import { Download, ChevronLeft, ChevronRight, Calendar, User, MessageCircle, AlertTriangle } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { toast } from "react-hot-toast";

/**
 * Props:
 * - desde: string "YYYY-MM-DD"
 * - hasta: string "YYYY-MM-DD"
 * - intents: [{ intent, count }] (opcional, para poblar dropdown)
 * - initialIntent: string (opcional)
 * - pageSize: number (opcional, default 20)
 * - onIntentChange: (value: string) => void (opcional)  ← NUEVO
 */
const FallbackLogsTable = ({
    desde = "",
    hasta = "",
    intents = [],
    initialIntent = "",
    pageSize = 20,
    onIntentChange, // ← NUEVO
}) => {
    const [intent, setIntent] = useState(initialIntent);
    const [page, setPage] = useState(1);

    const queryKey = useMemo(
        () => ["failedLogs", { desde, hasta, intent, page, page_size: pageSize }],
        [desde, hasta, intent, page, pageSize]
    );

    const { data, isFetching } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await getFailedLogs({ desde, hasta, intent: intent || undefined, page, page_size: pageSize });
            // Soporta dos formas:
            // 1) { items, total, page, page_size }
            // 2) [ ...rows ] simple
            if (Array.isArray(res)) {
                return { items: res, total: res.length, page, page_size: pageSize };
            }
            return {
                items: Array.isArray(res?.items) ? res.items : [],
                total: Number(res?.total ?? 0),
                page: Number(res?.page ?? page),
                page_size: Number(res?.page_size ?? pageSize),
            };
        },
        keepPreviousData: true,
    });

    const rows = data?.items || [];
    const total = data?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const exportMutation = useMutation({
        mutationFn: () => exportFailedIntentsCSV({ desde, hasta, intent: intent || undefined }),
        onSuccess: () => toast.success("✅ CSV exportado"),
        onError: () => toast.error("❌ Error al exportar CSV"),
    });

    const intentsOptions = useMemo(() => {
        const base = intents?.map((i) => i?.intent).filter(Boolean) || [];
        const unique = Array.from(new Set(base));
        return unique;
    }, [intents]);

    const changeIntent = (value) => {
        setIntent(value);
        setPage(1); // reset de paginación al cambiar filtro
    };

    const prev = () => setPage((p) => Math.max(1, p - 1));
    const next = () => setPage((p) => Math.min(totalPages, p + 1));

    return (
        <div className="mt-6 space-y-3">
            {/* Filtros de tabla */}
            <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">Intent</label>
                    <select
                        className="border px-3 py-2 rounded-md min-w-[220px]"
                        value={intent}
                        onChange={(e) => {
                            const v = e.target.value;
                            changeIntent(v);
                            onIntentChange?.(v); // ← notifica al padre para sincronizar el botón de export “arriba”
                        }}
                    >
                        <option value="">Todos</option>
                        {intentsOptions.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => exportMutation.mutate()}
                    disabled={exportMutation.isLoading}
                    className="flex items-center gap-2 text-sm px-3 py-2 border rounded bg-white hover:bg-gray-100 shadow ml-auto"
                >
                    <Download size={16} />
                    {exportMutation.isLoading ? "Exportando..." : "Exportar CSV (filtros)"}
                </button>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto border rounded-md shadow bg-white">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="px-4 py-2">
                                <span className="inline-flex items-center gap-1">
                                    <Calendar size={16} /> Fecha
                                </span>
                            </th>
                            <th className="px-4 py-2">
                                <span className="inline-flex items-center gap-1">
                                    <User size={16} /> Usuario/Email
                                </span>
                            </th>
                            <th className="px-4 py-2">
                                <span className="inline-flex items-center gap-1">
                                    <MessageCircle size={16} /> Mensaje
                                </span>
                            </th>
                            <th className="px-4 py-2">
                                <span className="inline-flex items-center gap-1">
                                    <AlertTriangle size={16} /> Intent
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isFetching ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                    Cargando…
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                    No hay registros.
                                </td>
                            </tr>
                        ) : (
                            rows.map((log, i) => (
                                <tr key={log._id || i} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {formatDate(log.timestamp, { withTime: true }) || "—"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {log.email || log.user_email || log.user_id || "—"}
                                    </td>
                                    <td className="px-4 py-2 max-w-[420px]">
                                        <Tooltip.Root>
                                            <Tooltip.Trigger asChild>
                                                <span className="block truncate cursor-help">
                                                    {log.message || log.text || "—"}
                                                </span>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content
                                                    className="rounded-md bg-black text-white px-2 py-1 text-xs max-w-[560px]"
                                                    side="top"
                                                >
                                                    {log.message || log.text || "—"}
                                                </Tooltip.Content>
                                            </Tooltip.Portal>
                                        </Tooltip.Root>
                                    </td>
                                    <td className="px-4 py-2 text-red-600">
                                        {log.intent || log.predicted_intent || "—"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="flex justify-center items-center gap-3">
                <button
                    onClick={prev}
                    disabled={page <= 1}
                    className="px-3 py-1.5 bg-gray-200 rounded disabled:opacity-50 inline-flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <span className="px-2 py-1 text-sm">
                    Página <strong>{total ? page : 0}</strong> de <strong>{total ? totalPages : 0}</strong>
                </span>
                <button
                    onClick={next}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 bg-gray-200 rounded disabled:opacity-50 inline-flex items-center gap-1"
                >
                    Siguiente <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default FallbackLogsTable;