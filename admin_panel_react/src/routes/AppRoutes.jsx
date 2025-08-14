// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";

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

import ChatPage from "@/pages/ChatPage"; // Página contenedora de ChatUI

// ✅ Páginas nuevas de intents (activadas)
import IntentEdit from "@/pages/IntentEdit";
import IntentDetail from "@/pages/IntentDetail";

import ProtectedRoute from "@/routes/ProtectedRoute";
import RequireRole from "@/components/RequireRole";
import ListIntents from "@/pages/ListIntents";
const AppRoutes = () => {
    return (
        <Routes>
            {/* 🌐 Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ✅ Rutas de chat públicas (compat y embebido) */}
            {/* Alias clásico */}
            <Route path="/chat" element={<ChatPage />} />
            {/* Embebido SPA directa (iframe moderno) */}
            <Route path="/iframe/chat" element={<ChatPage forceEmbed />} />
            {/* Alias histórico */}
            <Route path="/chat-embed" element={<ChatPage forceEmbed />} />
            {/* Compat extra: /chat-embed.html?embed=1 → redirige */}
            <Route path="/chat-embed.html" element={<Navigate to="/chat-embed" replace />} />

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

            {/* 🆕 Intents: crear / editar / detalle */}
            <Route
                path="/intents/new"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin"]}>
                            <IntentEdit />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/intents/:id/edit"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin"]}>
                            <IntentEdit />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/intents/:id"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <IntentDetail />
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

            {/* ✅ Estadísticas correctas */}
            <Route
                path="/stadisticas-logs"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <StadisticasLogsPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />

            {/* (Opcional) Exportar logs explícito */}
            <Route
                path="/exportar-logs"
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

            {/* Catch-all protegido */}
            <Route
                path="*"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <LoginPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default AppRoutes;