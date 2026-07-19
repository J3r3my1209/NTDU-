import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * GoogleButton — "Continuar con Google" reutilizable.
 * Dispara el flujo OAuth de Supabase (redirige a Google y vuelve al dashboard).
 */
export default function GoogleButton({ label = 'Continuar con Google' }) {
    const { loginConGoogle } = useAuth();
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const entrar = async () => {
        setError(null);
        setCargando(true);
        try {
            await loginConGoogle(); // redirige fuera de la app
        } catch (e) {
            setError(e.message || 'No se pudo conectar con Google.');
            setCargando(false);
        }
    };

    return (
        <div>
            <motion.button
                type="button"
                onClick={entrar}
                disabled={cargando}
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex items-center justify-center gap-3 min-h-[48px] px-4 rounded-xl
                           border border-gray-300 bg-white text-gray-700 font-semibold text-sm
                           hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
                {cargando ? (
                    <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                    <GoogleLogo />
                )}
                {cargando ? 'Conectando...' : label}
            </motion.button>
            {error && <p className="mt-2 text-xs text-rose-600 text-center">{error}</p>}
        </div>
    );
}

function GoogleLogo() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41 36.9 44 31 44 24c0-1.3-.1-2.3-.4-3.5z" />
        </svg>
    );
}
