import { useAuth } from "@/context/AuthContext";

// ⚠️ Esta función solo se puede usar dentro de componentes
let logoutFn = null;

export const registerLogout = (fn) => {
    logoutFn = fn;
};

export const getAuthHelper = () => {
    return {
        logout: logoutFn
    };
};