import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { actualizarPerfil } from '../services/usuarioService.js';
import { Navbar } from '../components/Navbar.jsx';
import PremiumBadge from '../ui/PremiumBadge.jsx';

export const Profile = () => {
    const { user, actualizarUsuario, esPremium } = useAuth();
    const [nombre, setNombre] = useState(user?.nombre || '');
    const [telefono, setTelefono] = useState(user?.telefono || '');
    const [ciudad, setCiudad] = useState(user?.ciudad || '');
    const [pais, setPais] = useState(user?.pais || '');
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setExito(false);
        setLoading(true);

        try {
            const usuario = await actualizarPerfil({ nombre, telefono, ciudad, pais });
            actualizarUsuario(usuario);
            setExito(true);
        } catch (err) {
            setError(err.message || 'Error al actualizar el perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-2xl mx-auto px-6 py-10">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-black px-8 py-10 text-center text-white">
                        <div className="w-20 h-20 rounded-full bg-[#00E56A] flex items-center justify-center text-3xl font-black mx-auto mb-4">
                            {user?.nombre?.[0]?.toUpperCase() || '?'}
                        </div>
                        <h2 className="text-2xl font-black">{user?.nombre}</h2>
                        <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
                        <div className="mt-2 flex items-center justify-center gap-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                user?.role === 'admin'
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : 'bg-[#00E56A]/20 text-[#00E56A]'
                            }`}>
                                {user?.role === 'admin' ? '⚡ Administrador' : '👤 Usuario'}
                            </span>
                            {esPremium && <PremiumBadge />}
                        </div>
                    </div>

                    <div className="p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Actualizar información</h3>

                        {exito && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
                                ✅ Perfil actualizado exitosamente.
                            </div>
                        )}

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre completo</label>
                                <input
                                    type="text" value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#00E56A] focus:ring-2 focus:ring-[#00E56A]/20 focus:bg-white transition text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Correo electrónico <span className="text-gray-400 font-normal">· no editable</span>
                                </label>
                                <input
                                    type="email" value={user?.email || ''} readOnly disabled
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                                        placeholder="+593 99 999 9999" inputMode="tel"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#00E56A] focus:ring-2 focus:ring-[#00E56A]/20 focus:bg-white transition text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ciudad</label>
                                    <input
                                        type="text" value={ciudad} onChange={e => setCiudad(e.target.value)}
                                        placeholder="Ej. Quito"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#00E56A] focus:ring-2 focus:ring-[#00E56A]/20 focus:bg-white transition text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">País</label>
                                <input
                                    type="text" value={pais} onChange={e => setPais(e.target.value)}
                                    placeholder="Ej. Ecuador"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#00E56A] focus:ring-2 focus:ring-[#00E56A]/20 focus:bg-white transition text-sm"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
                            >
                                {loading ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link to="/dashboard" className="text-sm text-[#00E56A] font-bold hover:underline">
                                ← Volver al dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
