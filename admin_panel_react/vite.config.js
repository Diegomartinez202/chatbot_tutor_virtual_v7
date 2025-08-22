// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    plugins: [react()],

    // Útil para despliegues en subdirectorios (GitHub Pages, rutas relativas, etc.)
    base: "./",

    // Alias @ → src
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },

    server: {
        host: "localhost",
        port: Number(process.env.PORT) || 5173,
        // Si el puerto está ocupado, permite que Vite elija otro (como 5174/5175/5176)
        strictPort: false,
        open: true,
        // Si quieres ocultar el overlay de errores:
        // hmr: { overlay: false },
    },

    preview: {
        host: "localhost",
        port: 5173,
        strictPort: false,
    },

    // Evita "process is not defined" cuando algún código lee process.env
    define: {
        "process.env": {},
    },
});