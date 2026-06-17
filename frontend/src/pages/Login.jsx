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
        <div className="relative min-h-dvh flex bg-ink lg:bg-gray-50">
            {/* Fondo oscuro premium (solo móvil), al estilo del panel del escritorio */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 lg:hidden bg-[radial-gradient(120%_90%_at_50%_-10%,rgba(0,229,106,.22),transparent_55%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 lg:hidden bg-[radial-gradient(90%_70%_at_100%_100%,rgba(16,185,129,.16),transparent_55%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 lg:hidden bg-grid-faint [background-size:40px_40px] opacity-[0.12]" />

            <AuthShowcase />

            {/* Panel derecho — formulario. safe-top/x/bottom respetan notch y barras. */}
            <main className="relative flex-1 flex flex-col items-center justify-center px-5 sm:px-6 py-8 sm:py-10 safe-top safe-x safe-bottom">
                {/* Marca compacta (solo móvil), sobre el fondo oscuro */}
                <div className="lg:hidden text-center mb-6">
                    <div className="text-5xl mb-2" aria-hidden="true">💸</div>
                    <h2 className="text-2xl font-black text-white">No Tan De Una</h2>
                    <p className="text-white/55 text-sm mt-1">Tus finanzas, claras y bajo control.</p>
                </div>

                {/* Tarjeta: blanca y elevada en móvil; transparente junto al showcase en escritorio */}
                <div className="w-full max-w-md bg-white rounded-3xl shadow-float p-6 sm:p-8 lg:p-0 lg:bg-transparent lg:shadow-none lg:rounded-none">
                    <div className="mb-7">
                        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                            <span aria-hidden="true">←</span> Volver al inicio
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Bienvenido de vuelta</h1>
                        <p className="text-gray-500 mt-2">Ingresa tus datos para continuar.</p>
                    </div>

                    <GoogleButton />

                    <div className="flex items-center gap-3 my-5">
                        <span className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium">o con tu correo</span>
                        <span className="h-px flex-1 bg-gray-200" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                                autoComplete="email"
                                inputMode="email"
                                enterKeyHint="next"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck="false"
                                aria-invalid={!!error}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition text-base sm:text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                            <PasswordInput
                                id="login-password"
                                name="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                                enterKeyHint="go"
                                aria-invalid={!!error}
                                required
                            />
                        </div>

                        <div className="text-right">
                            <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline font-medium rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {error && (
                            <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                                <span aria-hidden="true">⚠️</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            aria-busy={loading}
                            className="w-full bg-black hover:bg-gray-800 text-white font-bold min-h-[48px] py-3.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span aria-hidden="true" className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Ingresando...
                                </span>
                            ) : 'Entrar de una →'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="font-bold text-brand-600 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                            Regístrate gratis
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
