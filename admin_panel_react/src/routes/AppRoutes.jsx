// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import LogsPage from "../pages/LogsPage";
import IntentsPage from "../pages/IntentsPage"; // si lo sigues usando en otra ruta
import UserManagement from "../pages/UserManagement";
import TestPage from "../pages/TestPage";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import ListIntents from "../components/ListIntents";
import CrearIntentPage from "../pages/CrearIntentPage";
import BuscarIntentPage from "../pages/BuscarIntentPage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
                path="/intents/list"
                element={
                    <ProtectedRoute allowedRoles={["admin", "soporte"]}>
                        <ListIntents />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["admin", "soporte"]}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/logs"
                element={
                    <ProtectedRoute allowedRoles={["admin", "soporte"]}>
                        <LogsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/intents"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <CrearIntentPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/intents/buscar"
                element={
                    <ProtectedRoute allowedRoles={["admin", "soporte"]}>
                        <BuscarIntentPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/user-management"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <UserManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/test"
                element={
                    <ProtectedRoute allowedRoles={["admin", "soporte"]}>
                        <TestPage />
                    </ProtectedRoute>
                }
            />
            <Route path="/intents-page" element={
                <ProtectedRoute allowedRoles={["admin", "soporte"]}>
                    <IntentsPage />
                </ProtectedRoute>
            }
            />
            </Routes>
    );
}
export default AppRoutes;