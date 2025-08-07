import React from "react";

function FiltrosFecha({ desde, hasta, setDesde, setHasta }) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
            <label className="flex flex-col text-sm font-medium">
                Desde:
                <input
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="border p-2 rounded-md"
                />
            </label>
            <label className="flex flex-col text-sm font-medium">
                Hasta:
                <input
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="border p-2 rounded-md"
                />
            </label>
        </div>
    );
}

export default FiltrosFecha;