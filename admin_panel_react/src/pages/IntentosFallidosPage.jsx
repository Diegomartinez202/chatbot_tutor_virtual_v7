import { useEffect, useState } from "react";
import { getTopFailedIntents } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import FallbackLogsTable from "@/components/FallbackLogsTable";

const IntentosFallidosPage = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        getTopFailedIntents().then(setData).catch(console.error);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">📉 Intentos Fallidos del Chatbot</h1>

            <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="intent" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#EF4444" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <FallbackLogsTable />
        </div>
    );
};

export default IntentosFallidosPage;