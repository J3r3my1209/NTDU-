/**
 * useAuth — Hook de acceso al AuthContext
 * Re-exportado desde context/AuthContext para conveniencia.
 * 
 * Uso:
 *   import { useAuth } from '../hooks/useAuth';
 *   const { user, token, role, isAuthenticated, login, logout } = useAuth();
 */
export { useAuth } from '../context/AuthContext.jsx';
