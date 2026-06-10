import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * PrivateRoute: Protege rutas que requieren autenticación.
 * Si no hay sesión → redirige a /login
 */
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading, bloqueado, logout } = useAuth();
    const location = useLocation();

    if (!loading && isAuthenticated && bloqueado) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] px-6">
                <div className="max-w-sm w-full bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
                    <div className="text-5xl mb-3">🚫</div>
                    <h1 className="text-xl font-black text-gray-900">Cuenta bloqueada</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Un administrador ha bloqueado tu cuenta. Si crees que es un error, contacta al soporte.
                    </p>
                    <button onClick={logout}
                        className="mt-6 w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition">
                        Cerrar sesión
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-[#00E56A] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-gray-500 font-medium text-sm">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;
