import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/styles/index.css";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/react-query";

import { Toaster } from "react-hot-toast";

// Salvaguarda: si #root no existe, crea uno para evitar pantalla en blanco.
// (No altera tu lógica; solo previene errores de montaje en casos límite)
let rootEl = document.getElementById("root");
if (!rootEl) {
    rootEl = document.createElement("div");
    rootEl.id = "root";
    document.body.appendChild(rootEl);
}

ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <App />
                    <Toaster position="top-right" />
                </AuthProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
);