import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, User, ShieldCheck, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import PremiumBadge from '../ui/PremiumBadge.jsx';

export const Navbar = () => {
    const { user, isAuthenticated, role, esPremium, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [abierto, setAbierto] = useState(false);

    const handleLogout = async () => {
        setAbierto(false);
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const links = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/profile', label: 'Mi perfil', icon: User },
        ...(!esPremium ? [{ to: '/premium', label: 'Premium', icon: Crown, premium: true }] : []),
        ...(role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, admin: true }] : []),
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm safe-top">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-x h-16 flex items-center justify-between">
                <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 shrink-0">
                <img 
                src="/logo-no-tan-de-una.png"
                alt="Logo No Tan De Una" 
                className="h-9 w-9 object-contain" 
                />
                <span className="text-lg font-black tracking-tight text-gray-900 hidden sm:block">NTDU</span>
                </Link>

                {/* Navegación desktop */}
                {isAuthenticated && (
                    <div className="hidden md:flex items-center gap-1">
                        {links.map((l) => (
                            <NavItem key={l.to} {...l} active={l.admin ? location.pathname.startsWith('/admin') : isActive(l.to)} />
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 sm:gap-3">
                    {isAuthenticated ? (
                        <>
                            <div className="hidden sm:flex items-center gap-2.5">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900 leading-tight max-w-[140px] truncate">{user?.nombre || 'Usuario'}</p>
                                    {esPremium ? (
                                        <PremiumBadge size="sm" />
                                    ) : (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {role === 'admin' ? '⚡ Admin' : '👤 Usuario'}
                                        </span>
                                    )}
                                </div>
                                <Avatar user={user} />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="hidden sm:inline-flex text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                            >
                                Salir
                            </button>

                            <button
                                onClick={() => setAbierto((v) => !v)}
                                aria-label="Menú"
                                className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition"
                            >
                                {abierto ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-2">
                                Iniciar sesión
                            </Link>
                            <Link to="/register" className="bg-brand-500 hover:bg-brand-400 text-black font-bold text-sm py-2.5 px-4 rounded-full transition-all min-h-[44px] flex items-center">
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Menú móvil desplegable */}
            <AnimatePresence>
                {abierto && isAuthenticated && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
                    >
                        <div className="px-4 py-3 safe-x pb-safe space-y-1">
                            <div className="flex items-center gap-3 px-2 py-3 mb-1 border-b border-gray-100">
                                <Avatar user={user} size={40} />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate flex items-center gap-1.5">
                                        {user?.nombre || 'Usuario'} {esPremium && <PremiumBadge size="sm" />}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                </div>
                            </div>
                            {links.map((l) => {
                                const Icon = l.icon;
                                const active = l.admin ? location.pathname.startsWith('/admin') : isActive(l.to);
                                return (
                                    <Link key={l.to} to={l.to} onClick={() => setAbierto(false)}
                                        className={`flex items-center gap-3 px-3 min-h-[48px] rounded-xl text-sm font-semibold transition ${active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                                        <Icon size={18} /> {l.label}
                                    </Link>
                                );
                            })}
                            <button onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 min-h-[48px] rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition">
                                <LogOut size={18} /> Cerrar sesión
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

function Avatar({ user, size = 36 }) {
    const inicial = user?.nombre?.[0]?.toUpperCase() || 'U';
    if (user?.fotoPerfil) {
        return (
            <img src={user.fotoPerfil} alt={user?.nombre || 'avatar'} referrerPolicy="no-referrer"
                style={{ width: size, height: size }}
                className="rounded-full object-cover ring-2 ring-gray-100 shrink-0" />
        );
    }
    return (
        <span style={{ width: size, height: size }}
            className="rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {inicial}
        </span>
    );
}

const NavItem = ({ to, label, icon: Icon, active, admin, premium }) => {
    const cls = premium
        ? 'text-amber-600 hover:bg-amber-50'
        : active
            ? admin ? 'bg-purple-100 text-purple-700' : 'bg-emerald-50 text-emerald-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
    return (
        <Link to={to} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${cls}`}>
            {Icon && <Icon size={16} className={premium ? 'fill-amber-400' : ''} />} {label}
        </Link>
    );
};

export default Navbar;
