import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Plus, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import AnimatedNumber from '../../ui/AnimatedNumber.jsx';
import { TrendBadge } from '../../ui/Badges.jsx';
import { money } from '../../lib/format.js';

/**
 * HeroBalance — tarjeta principal oscura con el saldo total, su variación
 * mensual y la tendencia del patrimonio. Es el foco visual del dashboard.
 */
export default function HeroBalance({
    saldoTotal = 0,
    variacionPatrimonioPct = 0,
    ingresosMes = 0,
    gastosMes = 0,
    sparkAhorro = [],
    onAdd,
}) {
    const serie = sparkAhorro.map((v, i) => ({ i, v }));
    const positivo = variacionPatrimonioPct >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.21, 1.02, 0.73, 1] }}
            className="relative overflow-hidden rounded-3xl bg-ink text-white shadow-float"
        >
            {/* Capas decorativas */}
            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(0,229,106,.18),transparent_45%)]" />
            <div className="absolute inset-0 bg-grid-faint [background-size:32px_32px] opacity-40" />
            <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl" />

            <div className="relative p-7 sm:p-9">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider">
                            <Sparkles size={14} className="text-brand-400" />
                            Saldo total
                        </div>
                        <div className="mt-2 flex items-end gap-3 flex-wrap">
                            <AnimatedNumber
                                value={saldoTotal}
                                className="text-5xl sm:text-6xl font-black tracking-tight"
                            />
                            <div className="mb-2 flex items-center gap-1.5 text-sm text-white/70">
                                <TrendBadge value={variacionPatrimonioPct} light />
                                <span>vs. mes pasado</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onAdd}
                        className="hidden sm:inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-black font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-glow"
                    >
                        <Plus size={18} strokeWidth={2.5} /> Nueva transacción
                    </button>
                </div>

                {/* Tendencia */}
                <div className="mt-6 h-24 -mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={serie} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
                            <defs>
                                <linearGradient id="heroTrend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00E56A" stopOpacity={0.5} />
                                    <stop offset="100%" stopColor="#00E56A" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone" dataKey="v" stroke="#00E56A" strokeWidth={2.5}
                                fill="url(#heroTrend)" dot={false} isAnimationActive animationDuration={1100}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Mini resumen mes */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur">
                        <div className="flex items-center gap-1.5 text-white/60 text-xs font-semibold">
                            <TrendingUp size={14} className="text-brand-400" /> Ingresos del mes
                        </div>
                        <p className="mt-1 text-xl font-bold text-brand-300">{money(ingresosMes)}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur">
                        <div className="flex items-center gap-1.5 text-white/60 text-xs font-semibold">
                            <TrendingDown size={14} className="text-rose-400" /> Gastos del mes
                        </div>
                        <p className="mt-1 text-xl font-bold text-rose-300">{money(gastosMes)}</p>
                    </div>
                </div>

                <button
                    onClick={onAdd}
                    className="sm:hidden mt-5 w-full inline-flex items-center justify-center gap-2 bg-brand-500 text-black font-bold text-sm px-4 py-3 rounded-xl"
                >
                    <Plus size={18} strokeWidth={2.5} /> Nueva transacción
                </button>
            </div>
        </motion.div>
    );
}
