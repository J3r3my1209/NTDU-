import { motion } from 'framer-motion';
import {
    Flame, Crown, ArrowLeftRight, CalendarDays, TrendingDown, CalendarX,
} from 'lucide-react';
import { Card } from '../../ui/Card.jsx';
import { SectionHeader } from '../../ui/Badges.jsx';
import { money, fechaDiaSemana, capitalizar } from '../../lib/format.js';
import { Activity } from 'lucide-react';

export default function AutoStats({ stats }) {
    const { mayorGasto, categoriaDominante, comparacionMensualPct, promedioDiario, mejorDia, diaMayorGasto } = stats;

    const items = [
        mayorGasto && {
            icon: Flame, color: '#F43F5E',
            titulo: 'Mayor gasto del mes',
            texto: <>Tu mayor gasto fue <b>{mayorGasto.descripcion}</b> ({capitalizar(mayorGasto.categoria)}) con <b>{money(mayorGasto.monto)}</b>.</>,
        },
        categoriaDominante && {
            icon: Crown, color: '#F59E0B',
            titulo: 'Categoría dominante',
            texto: <>El <b>{categoriaDominante.pct.toFixed(0)}%</b> de tus gastos pertenece a <b>{categoriaDominante.label}</b>.</>,
        },
        {
            icon: ArrowLeftRight, color: comparacionMensualPct > 0 ? '#F43F5E' : '#10B981',
            titulo: 'Comparación mensual',
            texto: comparacionMensualPct === 0
                ? <>Mismo nivel de gasto que el mes anterior.</>
                : <>Este mes gastaste <b>{Math.abs(comparacionMensualPct).toFixed(0)}% {comparacionMensualPct > 0 ? 'más' : 'menos'}</b> que el mes anterior.</>,
        },
        {
            icon: CalendarDays, color: '#6366F1',
            titulo: 'Promedio diario',
            texto: <>Gastas en promedio <b>{money(promedioDiario)}</b> por día este mes.</>,
        },
        mejorDia && {
            icon: TrendingDown, color: '#10B981',
            titulo: 'Mejor día financiero',
            texto: <>Tu día con menos gastos fue el <b>{fechaDiaSemana(mejorDia[0])}</b> ({money(mejorDia[1])}).</>,
        },
        diaMayorGasto && {
            icon: CalendarX, color: '#EC4899',
            titulo: 'Día de mayor gasto',
            texto: <>Tu gasto más alto fue el <b>{fechaDiaSemana(diaMayorGasto[0])}</b> ({money(diaMayorGasto[1])}).</>,
        },
    ].filter(Boolean);

    return (
        <Card className="p-6">
            <SectionHeader icon={Activity} title="Estadísticas automáticas" subtitle="Generadas a partir de tus movimientos" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map((it, i) => (
                    <motion.div key={it.titulo}
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 hover:bg-white hover:shadow-card transition">
                        <span className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${it.color}1A`, color: it.color }}>
                            <it.icon size={17} />
                        </span>
                        <p className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{it.titulo}</p>
                        <p className="mt-1 text-sm text-gray-700 leading-snug">{it.texto}</p>
                    </motion.div>
                ))}
            </div>
        </Card>
    );
}
