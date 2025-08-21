// vite.config.ts (o vite.config.js)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    plugins: [react()],
    base: "./", // útil para despliegues en subdirectorios (GitHub Pages, etc.)
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    server: {
        port: Number(process.env.PORT) || 5173,
        host: "localhost",
        open: true,
        // Si quieres ocultar el overlay de errores de Vite:
        // hmr: { overlay: false },
    },
    define: {
        "process.env": {},
    },
});