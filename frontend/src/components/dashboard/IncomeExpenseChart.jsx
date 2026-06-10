import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card } from '../../ui/Card.jsx';
import { SectionHeader } from '../../ui/Badges.jsx';
import { seriesPorPeriodo } from '../../lib/analytics.js';
import { money, moneyCompact } from '../../lib/format.js';

const PERIODOS = [
    { key: 'dia', label: 'Día' },
    { key: 'semana', label: 'Semana' },
    { key: 'mes', label: 'Mes' },
    { key: 'anio', label: 'Año' },
];

function TooltipPersonalizado({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const ing = payload.find((p) => p.dataKey === 'ingresos')?.value || 0;
    const gas = payload.find((p) => p.dataKey === 'gastos')?.value || 0;
    return (
        <div className="rounded-xl bg-ink text-white text-xs px-3 py-2 shadow-float border border-white/10">
            <p className="font-semibold text-white/60 mb-1">{label}</p>
            <p className="flex items-center justify-between gap-4">
                <span className="text-brand-300">Ingresos</span><span className="font-bold">{money(ing)}</span>
            </p>
            <p className="flex items-center justify-between gap-4">
                <span className="text-rose-300">Gastos</span><span className="font-bold">{money(gas)}</span>
            </p>
        </div>
    );
}

export default function IncomeExpenseChart({ transacciones = [] }) {
    const [periodo, setPeriodo] = useState('mes');
    const data = useMemo(() => seriesPorPeriodo(transacciones, periodo), [transacciones, periodo]);

    return (
        <Card className="p-6">
            <SectionHeader
                icon={BarChart3}
                title="Ingresos vs Gastos"
                subtitle="Evolución de tu flujo de dinero"
                action={
                    <div className="relative flex bg-gray-100 rounded-xl p-1">
                        {PERIODOS.map((p) => (
                            <button
                                key={p.key}
                                onClick={() => setPeriodo(p.key)}
                                className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                    periodo === p.key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {periodo === p.key && (
                                    <motion.span
                                        layoutId="periodo-pill"
                                        className="absolute inset-0 bg-white rounded-lg shadow-soft"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="relative">{p.label}</span>
                            </button>
                        ))}
                    </div>
                }
            />

            <div className="h-72 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id="gIng" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gGas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 11 }} dy={6} />
                        <YAxis tickLine={false} axisLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            tickFormatter={(v) => moneyCompact(v)} width={52} />
                        <Tooltip content={<TooltipPersonalizado />} cursor={{ stroke: '#d1d5db', strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="ingresos" stroke="#10B981" strokeWidth={2.5}
                            fill="url(#gIng)" isAnimationActive animationDuration={800} />
                        <Area type="monotone" dataKey="gastos" stroke="#F43F5E" strokeWidth={2.5}
                            fill="url(#gGas)" isAnimationActive animationDuration={800} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-3 flex items-center justify-center gap-6 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Ingresos</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Gastos</span>
            </div>
        </Card>
    );
}
