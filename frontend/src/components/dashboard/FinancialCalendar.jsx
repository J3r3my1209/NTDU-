import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, addMonths, isToday, isSameMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';
import { Card } from '../../ui/Card.jsx';
import { SectionHeader } from '../../ui/Badges.jsx';
import { money } from '../../lib/format.js';

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function FinancialCalendar({ porDia = {} }) {
    const [cursor, setCursor] = useState(new Date());

    const { celdas, totalMes } = useMemo(() => {
        const ini = startOfMonth(cursor);
        const dias = eachDayOfInterval({ start: ini, end: endOfMonth(cursor) });
        const offset = (getDay(ini) + 6) % 7; // Lunes = 0
        const blanks = Array.from({ length: offset }, () => null);
        let neto = 0;
        for (const d of dias) {
            const reg = porDia[format(d, 'yyyy-MM-dd')];
            if (reg) neto += reg.neto;
        }
        return { celdas: [...blanks, ...dias], totalMes: neto };
    }, [cursor, porDia]);

    return (
        <Card className="p-6 h-full">
            <SectionHeader
                icon={CalendarRange}
                title="Calendario financiero"
                subtitle={<span className={totalMes >= 0 ? 'text-emerald-600' : 'text-rose-500'}>Neto del mes: {money(totalMes)}</span>}
                action={
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCursor(addMonths(cursor, -1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronLeft size={16} /></button>
                        <span className="text-xs font-bold text-gray-700 w-28 text-center">{MESES[cursor.getMonth()]} {cursor.getFullYear()}</span>
                        <button onClick={() => setCursor(addMonths(cursor, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronRight size={16} /></button>
                    </div>
                }
            />

            <div className="grid grid-cols-7 gap-1 mb-1">
                {DIAS.map((d, i) => <div key={i} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {celdas.map((d, i) => {
                    if (!d) return <div key={`b${i}`} />;
                    const reg = porDia[format(d, 'yyyy-MM-dd')];
                    const tieneIng = reg?.ingresos > 0;
                    const tieneGas = reg?.gastos > 0;
                    const hoy = isToday(d);
                    const netoPos = reg && reg.neto >= 0;
                    return (
                        <motion.div key={i}
                            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: i * 0.004 }}
                            className={`group relative aspect-square rounded-xl border text-[11px] flex flex-col items-center justify-center
                                ${hoy ? 'border-brand-500 bg-brand-50' : reg ? (netoPos ? 'border-emerald-100 bg-emerald-50/50' : 'border-rose-100 bg-rose-50/50') : 'border-gray-100'}`}>
                            <span className={`font-bold ${hoy ? 'text-brand-700' : 'text-gray-600'}`}>{format(d, 'd')}</span>
                            <div className="flex gap-0.5 mt-0.5 h-1.5">
                                {tieneIng && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                {tieneGas && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                            </div>
                            {reg && (
                                <div className="absolute z-10 bottom-full mb-1 hidden group-hover:block whitespace-nowrap rounded-lg bg-ink text-white text-[10px] px-2 py-1 shadow-float">
                                    {tieneIng && <div className="text-brand-300">+{money(reg.ingresos)}</div>}
                                    {tieneGas && <div className="text-rose-300">−{money(reg.gastos)}</div>}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-semibold text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Ingresos</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Gastos</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500" /> Hoy</span>
            </div>
        </Card>
    );
}
