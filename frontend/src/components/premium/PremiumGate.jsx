import { motion } from 'framer-motion';
import { Lock, Crown } from 'lucide-react';
import { usePremium } from '../../context/PremiumContext.jsx';

/**
 * PremiumGate — envuelve contenido Premium.
 * - Si el usuario es Premium: muestra el contenido normal.
 * - Si es gratuito: muestra una vista previa difuminada con un candado y CTA.
 */
export default function PremiumGate({ titulo = 'Función Premium', children }) {
    const { esPremium, abrirModalPremium } = usePremium();

    if (esPremium) return children;

    return (
        <div className="relative overflow-hidden rounded-2xl">
            {/* Vista previa difuminada (no interactiva) */}
            <div className="pointer-events-none select-none blur-[6px] opacity-50 max-h-[420px] overflow-hidden">
                {children}
            </div>

            {/* Capa de bloqueo */}
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
                <motion.div
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="text-center px-6">
                    <span className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 items-center justify-center shadow-glow mb-3">
                        <Lock size={20} className="text-amber-950" />
                    </span>
                    <h3 className="text-base font-black text-gray-900">{titulo}</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                        Disponible con Premium. Pago único de $3 USD, acceso para siempre.
                    </p>
                    <button onClick={() => abrirModalPremium(titulo)}
                        className="mt-4 inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition">
                        <Crown size={16} className="text-amber-400" fill="currentColor" /> Desbloquear
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
