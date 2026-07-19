import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon, AlignLeft } from 'lucide-react';
import { Card } from '../../ui/Card.jsx';
import { SectionHeader } from '../../ui/Badges.jsx';
import { getCategoria } from '../../lib/categories.js';
import { money } from '../../lib/format.js';

export default function CategoryDistribution({ distribucion = [] }) {
    const [vista, setVista] = useState('dona');
    const total = distribucion.reduce((s, c) => s + c.total, 0);

    if (!distribucion.length) {
        return (
            <Card className="p-6 h-full">
                <SectionHeader icon={PieIcon} title="Distribución de gastos" subtitle="Por categoría" />
                <div className="flex items-center justify-center h-56 text-sm text-gray-400">
                    Aún no hay gastos para analizar.
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 h-full">
            <SectionHeader
                icon={PieIcon}
                title="Distribución de gastos"
                subtitle="¿En qué se va tu dinero?"
                action={
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {[['dona', PieIcon], ['barras', AlignLeft]].map(([k, Icon]) => (
                            <button key={k} onClick={() => setVista(k)}
                                className={`p-1.5 rounded-md transition ${vista === k ? 'bg-white shadow-soft text-gray-900' : 'text-gray-400'}`}>
                                <Icon size={15} />
                            </button>
                        ))}
                    </div>
                }
            />

            <AnimatePresence mode="wait">
                {vista === 'dona' ? (
                    <motion.div key="dona"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col sm:flex-row items-center gap-5">
                        <div className="relative w-36 h-36 shrink-0 mx-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                    <Pie data={distribucion} dataKey="total" nameKey="label"
                                        cx="50%" cy="50%" innerRadius={46} outerRadius={66} paddingAngle={1.5}
                                        stroke="none" isAnimationActive animationDuration={800}>
                                        {distribucion.map((c) => <Cell key={c.label} fill={c.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Total</span>
                                <span className="text-base font-black text-gray-900 leading-none">{money(total)}</span>
                            </div>
                        </div>
                        <div className="flex-1 w-full space-y-2 min-w-0">
                            {distribucion.slice(0, 6).map((c) => (
                                <Leyenda key={c.label} c={c} />
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="barras"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="space-y-3 pt-1">
                        {distribucion.slice(0, 7).map((c, i) => (
                            <div key={c.label}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-semibold text-gray-700">{c.label}</span>
                                    <span className="font-bold text-gray-900">{money(c.total)}</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div className="h-full rounded-full"
                                        style={{ backgroundColor: c.color }}
                                        initial={{ width: 0 }} animate={{ width: `${c.pct}%` }}
                                        transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }} />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}

function Leyenda({ c }) {
    const meta = getCategoria(c.label);
    const Icon = meta.icon;
    return (
        <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${c.color}1A`, color: c.color }}>
                <Icon size={14} />
            </span>
            <span className="text-sm font-medium text-gray-700 flex-1 truncate min-w-0">{c.label}</span>
            <span className="text-xs font-bold text-gray-400 shrink-0">{c.pct.toFixed(0)}%</span>
            <span className="text-sm font-bold text-gray-900 shrink-0 whitespace-nowrap tabular-nums">{money(c.total)}</span>
        </div>
    );
}
