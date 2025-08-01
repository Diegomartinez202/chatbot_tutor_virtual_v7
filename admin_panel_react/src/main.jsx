import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/styles/index.css";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/react-query";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
);
