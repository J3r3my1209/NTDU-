import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * AdminRoute: Protege rutas exclusivas para administradores.
 * Si no hay sesión → /login
 * Si hay sesión pero no es admin → /dashboard
 */
const AdminRoute = ({ children }) => {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-[#00E56A] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-gray-500 font-medium text-sm">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminRoute;
