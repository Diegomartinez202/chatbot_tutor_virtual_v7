// src/components/FiltrosFecha.jsx
import React from "react";
import { CalendarRange, RotateCcw } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

/**
 * Uso flexible:
 * 1) Con estado separado:
 *    <FiltrosFecha desde={desde} hasta={hasta} setDesde={setDesde} setHasta={setHasta} />
 *
 * 2) Con objeto filtros:
 *    const [filtros, setFiltros] = useState({ fechaInicio: "", fechaFin: "" });
 *    <FiltrosFecha filtros={filtros} setFiltros={setFiltros} />
 */
export default function FiltrosFecha(props) {
    const isObjectMode = props.filtros && props.setFiltros;
    const desde = isObjectMode ? (props.filtros.fechaInicio ?? "") : (props.desde ?? "");
    const hasta = isObjectMode ? (props.filtros.fechaFin ?? "") : (props.hasta ?? "");

    const setDesde = (val) => {
        if (isObjectMode) props.setFiltros((prev) => ({ ...prev, fechaInicio: val }));
        else props.setDesde?.(val);
    };
    const setHasta = (val) => {
        if (isObjectMode) props.setFiltros((prev) => ({ ...prev, fechaFin: val }));
        else props.setHasta?.(val);
    };

    const invalid = Boolean(desde) && Boolean(hasta) && new Date(desde) > new Date(hasta);

    const clear = () => {
        setDesde("");
        setHasta("");
    };

    return (
        <div className="flex flex-wrap gap-4 items-end mb-4">
            {/* Desde */}
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <CalendarRange className="w-4 h-4" />
                    Desde
                </label>
                <input
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    max={hasta || undefined}
                    className={[
                        "border px-3 py-2 rounded-md text-sm",
                        "bg-white dark:bg-gray-800 dark:text-white",
                        "border-gray-300 dark:border-gray-600",
                        invalid ? "border-red-500 ring-1 ring-red-300" : "",
                    ].join(" ")}
                    aria-invalid={invalid ? "true" : "false"}
                    aria-describedby={invalid ? "ff-error" : undefined}
                />
            </div>

            {/* Hasta */}
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hasta
                </label>
                <input
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    min={desde || undefined}
                    className={[
                        "border px-3 py-2 rounded-md text-sm",
                        "bg-white dark:bg-gray-800 dark:text-white",
                        "border-gray-300 dark:border-gray-600",
                        invalid ? "border-red-500 ring-1 ring-red-300" : "",
                    ].join(" ")}
                    aria-invalid={invalid ? "true" : "false"}
                    aria-describedby={invalid ? "ff-error" : undefined}
                />
            </div>

            {/* Botón limpiar */}
            <Tooltip.Provider>
                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <button
                            type="button"
                            onClick={clear}
                            className="flex items-center gap-2 text-sm px-3 py-2 border rounded bg-white hover:bg-gray-100 shadow
                         dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Limpiar
                        </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                        <Tooltip.Content
                            className="rounded-md bg-black text-white px-2 py-1 text-xs"
                            side="top"
                        >
                            Limpiar rango de fechas
                        </Tooltip.Content>
                    </Tooltip.Portal>
                </Tooltip.Root>
            </Tooltip.Provider>

            {/* Error rango inválido */}
            {invalid && (
                <p id="ff-error" className="text-xs text-red-600 mt-2 basis-full">
                    Rango inválido: <strong>Desde</strong> no puede ser mayor que <strong>Hasta</strong>.
                </p>
            )}
        </div>
    );
}