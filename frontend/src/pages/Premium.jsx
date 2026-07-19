import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Crown, Check, Sparkles, ShieldCheck, Zap, TrendingUp, FileDown, Brain, ArrowRight,
} from 'lucide-react';
import { Navbar } from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import PremiumBadge from '../ui/PremiumBadge.jsx';

const GRATIS = [
    'Registro de ingresos y gastos',
    'Categorías básicas',
    'Historial de movimientos',
    'Dashboard y gráficos básicos',
];
const PREMIUM = [
    { icon: TrendingUp, t: 'Analíticas avanzadas', d: 'Comparación mensual y anual, tendencias y evolución.' },
    { icon: Brain, t: 'Inteligencia financiera', d: 'Consejos de ahorro, recomendaciones y detección de excesos.' },
    { icon: Zap, t: 'Predicciones', d: 'Gasto y ahorro estimados, riesgo financiero.' },
    { icon: FileDown, t: 'Exportaciones', d: 'Descarga tus reportes en PDF y Excel.' },
];

export default function Premium() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { esPremium, iniciarCheckoutPremium, refrescarUsuario } = useAuth();
    const [procesando, setProcesando] = useState(false);
    const [confirmando, setConfirmando] = useState(false);
    const [exito, setExito] = useState(false);
    const [error, setError] = useState(null);
    const intentosRef = useRef(0);

    // Al volver desde Stripe con éxito, Stripe ya confirmó el pago pero el
    // webhook que activa Premium en la base de datos puede tardar uno o dos
    // segundos. Refrescamos el perfil unas cuantas veces hasta ver es_premium.
    useEffect(() => {
        if (searchParams.get('canceled') === 'true') {
            setError('Pago cancelado. No se realizó ningún cargo.');
            setSearchParams({}, { replace: true });
            return;
        }

        if (searchParams.get('success') === 'true') {
            setConfirmando(true);
            intentosRef.current = 0;

            const revisar = async () => {
                intentosRef.current += 1;
                const u = await refrescarUsuario();
                if (u?.esPremium) {
                    setExito(true);
                    setConfirmando(false);
                    setSearchParams({}, { replace: true });
                } else if (intentosRef.current < 8) {
                    setTimeout(revisar, 1500);
                } else {
                    setConfirmando(false);
                    setError('El pago se está confirmando. Si tarda más de un minuto, recarga esta página.');
                    setSearchParams({}, { replace: true });
                }
            };
            revisar();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const comprar = async () => {
        setError(null);
        setProcesando(true);
        try {
            const url = await iniciarCheckoutPremium();
            window.location.href = url; // redirige a la página de pago de Stripe
        } catch (e) {
            setError(e.message || 'No se pudo iniciar el pago.');
            setProcesando(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f8fa]">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 safe-x py-8 sm:py-12">
                {/* Encabezado */}
                <div className="text-center max-w-2xl mx-auto">
                    <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 14 }}
                        className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 items-center justify-center shadow-glow mb-5">
                        <Crown size={30} className="text-amber-950" fill="currentColor" />
                    </motion.span>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                        No Tan De Una <span className="text-gradient">Premium</span>
                    </h1>
                    <p className="text-gray-500 mt-3 text-base sm:text-lg">
                        Desbloquea todas las herramientas avanzadas de análisis financiero con un único pago.
                    </p>
                </div>

                {confirmando ? (
                    <ConfirmandoPago />
                ) : esPremium || exito ? (
                    <YaEresPremium onIr={() => navigate('/dashboard')} recienActivado={exito} />
                ) : (
                    <div className="mt-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
                        {/* Funciones premium */}
                        <div className="space-y-3">
                            {PREMIUM.map((f, i) => (
                                <motion.div key={f.t}
                                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                    className="card p-5 flex gap-4">
                                    <span className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 flex items-center justify-center">
                                        <f.icon size={20} />
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{f.t}</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">{f.d}</p>
                                    </div>
                                </motion.div>
                            ))}
                            <p className="text-xs text-gray-400 px-1 pt-1">
                                Lo gratuito sigue gratis: {GRATIS.join(' · ')}.
                            </p>
                        </div>

                        {/* Tarjeta de precio */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-3xl bg-ink text-white p-7 shadow-float sticky top-24">
                            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl" />
                            <div className="relative">
                                <PremiumBadge size="lg" />
                                <div className="mt-5 flex items-end gap-2">
                                    <span className="text-5xl font-black">$3</span>
                                    <span className="text-white/50 mb-1.5 font-semibold">USD</span>
                                </div>
                                <p className="text-brand-300 font-bold text-sm mt-1 flex items-center gap-1.5">
                                    <Sparkles size={15} /> Pago único • Acceso para siempre
                                </p>
                                <p className="text-white/50 text-xs mt-1">No hay pagos mensuales ni renovaciones.</p>

                                <ul className="mt-6 space-y-2.5">
                                    {['Todas las analíticas avanzadas', 'Inteligencia y predicciones', 'Exportar PDF y Excel', 'Insignia 👑 Premium'].map((t) => (
                                        <li key={t} className="flex items-center gap-2.5 text-sm text-white/85">
                                            <Check size={16} className="text-brand-400 shrink-0" /> {t}
                                        </li>
                                    ))}
                                </ul>

                                {error && <p className="mt-4 text-sm text-rose-300 bg-rose-500/10 rounded-xl px-3 py-2">{error}</p>}

                                <button onClick={comprar} disabled={procesando}
                                    className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-black font-bold py-3.5 rounded-xl transition disabled:opacity-60 shadow-glow">
                                    {procesando ? (
                                        <><span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Redirigiendo a Stripe...</>
                                    ) : (
                                        <><Crown size={18} fill="currentColor" /> Obtener Premium por $3</>
                                    )}
                                </button>
                                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
                                    <ShieldCheck size={13} /> Pago seguro procesado por Stripe (modo prueba)
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}

function ConfirmandoPago() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-10 max-w-lg mx-auto card p-8 text-center">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-gray-100 items-center justify-center mb-4">
                <span className="w-7 h-7 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
            </span>
            <h2 className="text-xl font-black text-gray-900">Confirmando tu pago…</h2>
            <p className="text-gray-500 mt-2 text-sm">
                Stripe ya recibió el pago, solo estamos activando Premium en tu cuenta. Esto toma unos segundos.
            </p>
        </motion.div>
    );
}

function YaEresPremium({ onIr, recienActivado }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-10 max-w-lg mx-auto card p-8 text-center">
            <motion.span
                initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 12 }}
                className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 items-center justify-center shadow-glow mb-4">
                <Crown size={30} className="text-amber-950" fill="currentColor" />
            </motion.span>
            <h2 className="text-2xl font-black text-gray-900">
                {recienActivado ? '¡Bienvenido a Premium! 🎉' : 'Ya eres Premium'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
                {recienActivado
                    ? 'Tu pago se procesó y desbloqueamos todas las funciones avanzadas para siempre.'
                    : 'Tienes acceso permanente a todas las herramientas avanzadas. ¡Gracias!'}
            </p>
            <button onClick={onIr}
                className="mt-6 inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-5 py-3 rounded-xl transition">
                Ir al dashboard <ArrowRight size={17} />
            </button>
        </motion.div>
    );
}
