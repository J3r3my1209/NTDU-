import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PasswordInput from '../ui/PasswordInput.jsx';
import GoogleButton from '../ui/GoogleButton.jsx';
import AuthShowcase from '../components/AuthShowcase.jsx';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const usuario = await login(email, password);
            navigate(usuario.role === 'admin' ? '/admin' : from, { replace: true });
        } catch (err) {
            const msg = err.message || 'Error al iniciar sesión. Verifica tus datos.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            <AuthShowcase />

            {/* Panel derecho — formulario */}
            <div className="flex-1 flex items-center justify-center px-6 py-10 safe-x safe-bottom">
                <div className="w-full max-w-md">
                    {/* Marca compacta (solo móvil) */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="text-5xl mb-2">💸</div>
                        <h2 className="text-2xl font-black text-gray-900">No Tan De Una</h2>
                        <p className="text-gray-500 text-sm mt-1">Tus finanzas, claras y bajo control.</p>
                    </div>

                    <div className="mb-7">
                        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6 transition-colors">
                            ← Volver al inicio
                        </Link>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bienvenido de vuelta</h1>
                        <p className="text-gray-500 mt-2">Ingresa tus datos para continuar.</p>
                    </div>

                    <GoogleButton />

                    <div className="flex items-center gap-3 my-5">
                        <span className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium">o con tu correo</span>
                        <span className="h-px flex-1 bg-gray-200" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#00E56A] focus:ring-2 focus:ring-[#00E56A]/20 focus:bg-white transition text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                            <PasswordInput
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <div className="text-right">
                            <Link to="/forgot-password" className="text-xs text-[#00E56A] hover:underline font-medium">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Ingresando...
                                </span>
                            ) : 'Entrar de una →'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="font-bold text-[#00E56A] hover:underline">
                            Regístrate gratis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
