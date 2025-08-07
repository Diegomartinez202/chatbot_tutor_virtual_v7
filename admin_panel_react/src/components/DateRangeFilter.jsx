// src/components/DateRangeFilter.jsx
import React from "react";

function DateRangeFilter({ desde, hasta, setDesde, setHasta }) {
    return (
        <div className="flex gap-4 mb-4 items-end">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Desde
                </label>
                <input
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hasta
                </label>
                <input
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
                />
            </div>
        </div>
    );
}

export default DateRangeFilter;