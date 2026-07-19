import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Crown, X, Sparkles, Check } from 'lucide-react';

/**
 * PremiumModal — modal elegante que aparece cuando un usuario gratuito intenta
 * usar una función Premium.
 */
export default function PremiumModal({ open, feature, onClose }) {
    const navigate = useNavigate();
    const ir = () => { onClose(); navigate('/premium'); };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />

                    <motion.div
                        initial={{ y: 40, opacity: 0, scale: 0.97 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 40, opacity: 0, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-float overflow-hidden pb-safe sm:pb-0">
                        {/* Cabecera dorada */}
                        <div className="relative bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 px-6 pt-7 pb-9 text-center">
                            <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-lg text-amber-900/70 hover:bg-black/10"><X size={18} /></button>
                            <motion.span
                                initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
                                className="inline-flex w-16 h-16 rounded-2xl bg-white/90 items-center justify-center shadow-lg">
                                <Crown size={32} className="text-amber-500" fill="currentColor" />
                            </motion.span>
                            <h3 className="mt-4 text-xl font-black text-amber-950">Función Premium</h3>
                        </div>

                        <div className="p-6 -mt-4 bg-white rounded-t-3xl relative">
                            {feature && (
                                <p className="text-center text-sm font-bold text-gray-900 mb-2">{feature}</p>
                            )}
                            <p className="text-center text-sm text-gray-500 leading-relaxed">
                                Esta herramienta está disponible únicamente para usuarios Premium.
                                Desbloquéala con un <b className="text-gray-900">único pago de $3 USD</b> y obtén
                                acceso permanente a todas las funciones avanzadas.
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                {['Analíticas avanzadas', 'Inteligencia financiera', 'Predicciones', 'Exportar PDF y Excel'].map((f) => (
                                    <span key={f} className="flex items-center gap-1.5 text-gray-600">
                                        <Check size={14} className="text-emerald-500 shrink-0" /> {f}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-6 space-y-2">
                                <button onClick={ir}
                                    className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition">
                                    <Sparkles size={17} /> Obtener Premium
                                </button>
                                <button onClick={ir}
                                    className="w-full text-sm font-semibold text-gray-500 hover:text-gray-700 py-2 rounded-xl transition">
                                    Más información
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
