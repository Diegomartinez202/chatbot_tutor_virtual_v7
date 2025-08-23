// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "@/App";

// Passthrough: monta <App /> y dentro sigues usando <Routes> como hoy
export const router = createBrowserRouter(
    [
        { path: "*", element: <App /> },
    ],
    {
        future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true,
        },
    }
);