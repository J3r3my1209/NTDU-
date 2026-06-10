import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PiggyBank, CalendarClock } from 'lucide-react';
import Sparkline from '../../ui/Sparkline.jsx';
import AnimatedNumber from '../../ui/AnimatedNumber.jsx';
import { TrendBadge } from '../../ui/Badges.jsx';

/**
 * SmartCards — 4 tarjetas con icono, gradiente, sparkline y variación.
 */
function SmartCard({ icon: Icon, label, value, color, gradient, spark, trend, invert, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.21, 1.02, 0.73, 1] }}
            whileHover={{ y: -3 }}
            className="card p-5 relative overflow-hidden group"
        >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
            <div className="flex items-center justify-between">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} text-white shadow-soft`}>
                    <Icon size={18} />
                </span>
                {trend !== undefined && <TrendBadge value={trend} invert={invert} />}
            </div>

            <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <AnimatedNumber value={value} className="block mt-1 text-2xl font-black text-gray-900" />

            <div className="mt-2 -mx-1 opacity-90 group-hover:opacity-100 transition">
                <Sparkline data={spark} color={color} height={38} />
            </div>
        </motion.div>
    );
}

export default function SmartCards({ a }) {
    const cards = [
        {
            icon: TrendingUp, label: 'Ingresos del mes', value: a.ingresosMes,
            color: '#10B981', gradient: 'from-emerald-400 to-emerald-600',
            spark: a.sparkIngresos, trend: a.variacionIngresosPct,
        },
        {
            icon: TrendingDown, label: 'Gastos del mes', value: a.gastosMes,
            color: '#F43F5E', gradient: 'from-rose-400 to-rose-600',
            spark: a.sparkGastos, trend: a.variacionGastosPct, invert: true,
        },
        {
            icon: PiggyBank, label: 'Ahorro acumulado', value: a.ahorroAcumulado,
            color: '#6366F1', gradient: 'from-indigo-400 to-violet-600',
            spark: a.sparkAhorro,
        },
        {
            icon: CalendarClock, label: 'Promedio diario', value: a.promedioDiario,
            color: '#F59E0B', gradient: 'from-amber-400 to-orange-500',
            spark: a.sparkPromedio,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((c, i) => (
                <SmartCard key={c.label} {...c} delay={i * 0.06} />
            ))}
        </div>
    );
}
