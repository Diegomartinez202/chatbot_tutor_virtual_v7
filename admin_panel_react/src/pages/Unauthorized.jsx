function Unauthorized() {
    return (
        <div className="p-6 text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">🔒 Acceso Denegado</h1>
            <p className="text-gray-700 text-lg">
                No tienes permisos para acceder a esta sección del sistema.
            </p>
        </div>
    );
}

export default Unauthorized;