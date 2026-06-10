import { Navbar } from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import PremiumBadge from '../ui/PremiumBadge.jsx';

export default function Settings() {
    const { user, logout, esPremium } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-2xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-black text-gray-900 mb-6">⚙️ Configuración</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                    <SettingRow
                        icon="👑"
                        title="Plan"
                        desc={esPremium ? 'Premium · acceso para siempre' : 'Estás en el plan gratuito'}
                        action={esPremium
                            ? <PremiumBadge />
                            : <Link to="/premium" className="text-sm font-bold text-amber-600 hover:underline">Hazte Premium</Link>}
                    />
                    <SettingRow
                        icon="👤"
                        title="Información personal"
                        desc="Actualiza tu nombre y correo"
                        action={<Link to="/profile" className="text-sm font-bold text-[#00E56A] hover:underline">Editar</Link>}
                    />
                    <SettingRow
                        icon="🔐"
                        title="Seguridad"
                        desc="Cambia tu contraseña"
                        action={<span className="text-xs text-gray-400">Próximamente</span>}
                    />
                    <SettingRow
                        icon="📊"
                        title="Exportar datos"
                        desc="Descarga tus transacciones en Excel"
                        action={<Link to="/dashboard" className="text-sm font-bold text-[#00E56A] hover:underline">Ir al dashboard</Link>}
                    />
                    <SettingRow
                        icon="🚪"
                        title="Cerrar sesión"
                        desc="Salir de tu cuenta de manera segura"
                        action={
                            <button onClick={logout} className="text-sm font-bold text-red-500 hover:underline">
                                Salir
                            </button>
                        }
                    />
                </div>

                <div className="mt-6 bg-gray-100 rounded-2xl p-4 text-xs text-gray-500 text-center">
                    Sesión activa como <span className="font-bold">{user?.email}</span> · Rol: <span className="font-bold capitalize">{user?.role}</span>
                </div>
            </div>
        </div>
    );
}

const SettingRow = ({ icon, title, desc, action }) => (
    <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <div>
                <p className="font-semibold text-gray-800 text-sm">{title}</p>
                <p className="text-gray-400 text-xs">{desc}</p>
            </div>
        </div>
        <div>{action}</div>
    </div>
);
