import { motion } from 'framer-motion';
import { Wand2, CalendarArrowUp, PiggyBank, ArrowUpNarrowWide, ShieldAlert } from 'lucide-react';
import { money, percent } from '../../lib/format.js';

/**
 * Predictions — proyecciones a futuro calculadas con el promedio de los
 * últimos meses registrados.
 */
export default function Predictions({ predicciones }) {
    const { gastoEstimadoProx, ahorroEstimadoProx, categoriaCrece, riesgo, tasaAhorro } = predicciones;

    const cards = [
        {
            icon: CalendarArrowUp, color: '#F43F5E',
            label: 'Gasto estimado próximo mes',
            valor: money(gastoEstimadoProx),
            sub: 'Según tu promedio reciente',
        },
        {
            icon: PiggyBank, color: '#10B981',
            label: 'Ahorro estimado',
            valor: money(ahorroEstimadoProx),
            sub: `Tasa de ahorro: ${percent(tasaAhorro)}`,
        },
        {
            icon: ArrowUpNarrowWide, color: '#6366F1',
            label: 'Categoría que más crecerá',
            valor: categoriaCrece?.label || '—',
            sub: categoriaCrece && categoriaCrece.cambio > 0 ? `Tendencia ${percent(categoriaCrece.cambio)}` : 'Estable',
        },
        {
            icon: ShieldAlert, color: riesgo.color,
            label: 'Riesgo financiero',
            valor: riesgo.nivel,
            sub: riesgo.nivel === 'Bajo' ? 'Tus finanzas están sanas' : riesgo.nivel === 'Medio' ? 'Cuida tu tasa de ahorro' : 'Estás gastando de más',
        },
    ];

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white p-6 shadow-float">
            <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
                <div className="flex items-center gap-2.5 mb-5">
                    <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur"><Wand2 size={18} /></span>
                    <div>
                        <h2 className="text-base font-bold">Predicciones</h2>
                        <p className="text-xs text-white/60">Proyección basada en tu historial</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cards.map((c, i) => (
                        <motion.div key={c.label}
                            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.07 }}
                            className="rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur">
                            <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center" style={{ color: c.color }}>
                                <c.icon size={17} />
                            </span>
                            <p className="mt-3 text-xs font-semibold text-white/60">{c.label}</p>
                            <p className="text-xl font-black mt-0.5">{c.valor}</p>
                            <p className="text-[11px] text-white/55 mt-0.5">{c.sub}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
