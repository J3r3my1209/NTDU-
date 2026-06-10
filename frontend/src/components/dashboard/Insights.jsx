import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, Sparkles, Info } from 'lucide-react';

const TONOS = {
    positivo: { icon: Sparkles, ring: 'ring-emerald-200', bg: 'bg-emerald-50', ic: 'text-emerald-600' },
    alerta:   { icon: AlertTriangle, ring: 'ring-amber-200', bg: 'bg-amber-50', ic: 'text-amber-600' },
    neutro:   { icon: Info, ring: 'ring-blue-200', bg: 'bg-blue-50', ic: 'text-blue-600' },
};

/**
 * Insights — recomendaciones automáticas con estilo de "IA financiera".
 */
export default function Insights({ insights = [] }) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-ink-800 text-white p-6 shadow-float">
            <div className="absolute -left-10 -bottom-10 w-52 h-52 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative">
                <div className="flex items-center gap-2.5 mb-5">
                    <span className="w-9 h-9 rounded-xl bg-brand-500 text-black flex items-center justify-center">
                        <Lightbulb size={18} />
                    </span>
                    <div>
                        <h2 className="text-base font-bold">Insights inteligentes</h2>
                        <p className="text-xs text-white/50">Recomendaciones según tus hábitos</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {insights.map((ins, i) => {
                        const t = TONOS[ins.tono] || TONOS.neutro;
                        const Icon = t.icon;
                        return (
                            <motion.div key={ins.id}
                                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="flex gap-3 rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur">
                                <span className={`w-8 h-8 shrink-0 rounded-lg ${t.bg} ${t.ic} flex items-center justify-center`}>
                                    <Icon size={16} />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">{ins.titulo}</p>
                                    <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{ins.texto}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
