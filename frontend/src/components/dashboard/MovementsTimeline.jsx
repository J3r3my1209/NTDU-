import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { Card } from '../../ui/Card.jsx';
import { SectionHeader } from '../../ui/Badges.jsx';
import { getCategoria } from '../../lib/categories.js';
import { money, fechaCorta, hora } from '../../lib/format.js';

/**
 * MovementsTimeline — línea temporal estilo app bancaria.
 */
export default function MovementsTimeline({ transacciones = [], limite = 8 }) {
    const lista = [...transacciones]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limite);

    return (
        <Card className="p-6 h-full">
            <SectionHeader icon={History} title="Movimientos recientes" subtitle="Tu actividad más reciente" />

            {lista.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                    Sin movimientos todavía.
                </div>
            ) : (
                <div className="relative pl-3">
                    <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gray-100" />
                    <div className="space-y-1">
                        {lista.map((t, i) => {
                            const meta = getCategoria(t.categoria);
                            const Icon = meta.icon;
                            const ingreso = t.tipo === 'Ingreso';
                            return (
                                <motion.div key={t._id}
                                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.04 }}
                                    className="relative flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-gray-50 transition">
                                    <span className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white shrink-0"
                                        style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                                        <Icon size={15} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{t.descripcion}</p>
                                        <p className="text-xs text-gray-400">
                                            {meta.label} · {t.cuenta} · {fechaCorta(t.createdAt)} · {hora(t.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-bold shrink-0 ${ingreso ? 'text-emerald-600' : 'text-gray-900'}`}>
                                        {ingreso ? '+' : '−'}{money(t.monto)}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </Card>
    );
}
