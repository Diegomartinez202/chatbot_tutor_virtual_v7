// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";

import Dashboard from "@/pages/Dashboard";
import LogsPage from "@/pages/LogsPage";
import IntentsPage from "@/pages/IntentsPage";
import UserManagement from "@/pages/UserManagement";
import TestPage from "@/pages/TestPage";
import LoginPage from "@/pages/LoginPage";
import Unauthorized from "@/pages/Unauthorized";

import ListIntents from "@/components/ListIntents";
import CrearIntentPage from "@/pages/CrearIntentPage";
import BuscarIntentPage from "@/pages/BuscarIntentPage";
import StadisticasLogsPage from "@/pages/StadisticasLogsPage";
import IntentosFallidosPage from "@/pages/IntentosFallidosPage";
import ExportarLogsPage from "@/pages/ExportarLogsPage";
import ExportacionesPage from "@/pages/ExportacionesPage";
import TrainBotPage from "@/pages/TrainBotPage";
import DiagnosticoPage from "@/pages/TestPage";

import ChatPage from "@/pages/ChatPage"; // ✅ NUEVO: página de chat

import ProtectedRoute from "@/routes/ProtectedRoute";
import RequireRole from "@/components/RequireRole";

const AppRoutes = () => {
    return (
        <Routes>
            {/* 🌐 Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ✅ NUEVAS RUTAS DE CHAT (públicas) */}
            {/* /chat → pública; ChatPage internamente redirige a /login si no trae embed=1 */}
            <Route path="/chat" element={<ChatPage />} />
            {/* /chat-embed → pública y forzada a embed (ideal para iframes antiguos) */}
            <Route path="/chat-embed" element={<ChatPage forceEmbed />} />

            {/* Si mantienes una versión protegida de /chat, deja la anterior y usa solo /chat-embed como alias público. */}

            {/* 🔐 Rutas protegidas con roles */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <Dashboard />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/logs"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <LogsPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/intents"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin"]}>
                            <CrearIntentPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/intents/buscar"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <BuscarIntentPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/intents/list"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <ListIntents />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/intents-page"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <IntentsPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user-management"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin"]}>
                            <UserManagement />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/test"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <TestPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/intentos-fallidos"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <IntentosFallidosPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/stadisticas-logs"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <ExportarLogsPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/exportaciones"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <ExportacionesPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/entrenar-bot"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <TrainBotPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/diagnostico"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <DiagnosticoPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />

            {/* Catch-all: mantengo como estaba */}
            <Route path="*" element={<LoginPage />} />
        </Routes>
    );
};

export default AppRoutes;