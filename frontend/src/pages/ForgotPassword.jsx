import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

/**
 * ForgotPassword — usa Supabase Auth para enviar el correo de recuperación.
 */
export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login`
            });
            if (error) throw error;
            setEnviado(true);
        } catch (err) {
            setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (enviado) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <span className="text-5xl">🔑</span>
                    <h2 className="text-2xl font-black mt-4 mb-2 text-gray-900">¡Correo enviado!</h2>
                    <p className="text-gray-500 mb-2 text-sm">
                        Te mandamos las instrucciones para restablecer tu contraseña a:
                    </p>
                    <p className="font-bold text-gray-900 mb-6">{email}</p>
                    <p className="text-xs text-gray-400 mb-8">
                        Revisa tu bandeja de entrada (y el spam, por si las moscas 😅).
                    </p>
                    <Link
                        to="/login"
                        className="block w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors text-sm"
                    >
                        Volver a iniciar sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <span className="text-4xl">🔐</span>
                    <h2 className="text-2xl font-black mt-4 text-gray-900">¿Olvidaste tu contraseña?</h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        Ingresa tu correo y te enviamos un link para restablecerla.
                    </p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#00E56A] focus:ring-2 focus:ring-[#00E56A]/20 focus:bg-white transition text-sm"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                    >
                        {loading
                            ? <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Enviando...
                              </span>
                            : 'Enviar link de recuperación'
                        }
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-500">
                    <Link to="/login" className="text-[#00E56A] font-bold hover:underline">
                        ← Volver al inicio de sesión
                    </Link>
                </p>
            </div>
        </div>
    );
};
