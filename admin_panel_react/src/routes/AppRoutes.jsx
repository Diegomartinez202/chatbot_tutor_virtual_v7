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

import ProtectedRoute from "@/routes/ProtectedRoute";
import RequireRole from "@/components/RequireRole";
import IntentosFallidosPage from "@/pages/IntentosFallidosPage";
import ExportarLogsPage from "@/pages/ExportarLogsPage";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<LoginPage />} />

            {/* Rutas protegidas con roles */}
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
                path="/stadisticas-logs"
                element={
                    <ProtectedRoute>
                        <RequireRole allowedRoles={["admin", "soporte"]}>
                            <StadisticasLogsPage />
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
                            <ExportarLogsPage />
                        </RequireRole>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default AppRoutes;
