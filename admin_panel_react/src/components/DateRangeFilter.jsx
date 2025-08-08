// src/components/DateRangeFilter.jsx
import React from "react";

function DateRangeFilter({ desde, hasta, setDesde, setHasta }) {
    return (
        <div className="flex flex-wrap gap-4 items-end mb-4">
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Desde
                </label>
                <input
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="border px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                />
            </div>

            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hasta
                </label>
                <input
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="border px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                />
            </div>
        </div>
    );
}

export default DateRangeFilter;