import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, Check, X, PlusCircle } from 'lucide-react';
import { addMonths } from 'date-fns';
import { Card } from '../../ui/Card.jsx';
import { SectionHeader } from '../../ui/Badges.jsx';
import { money, fechaLarga } from '../../lib/format.js';
import { obtenerMetas, crearMeta, actualizarMeta, eliminarMeta } from '../../services/metasService.js';

export default function SavingsGoals({ ritmoMensual = 0 }) {
    const [metas, setMetas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [disponible, setDisponible] = useState(true);
    const [creando, setCreando] = useState(false);
    const [form, setForm] = useState({ titulo: '', montoObjetivo: '', montoActual: '', fechaLimite: '' });
    const [abonando, setAbonando] = useState(null);
    const [abono, setAbono] = useState('');

    useEffect(() => {
        obtenerMetas()
            .then(setMetas)
            .catch(() => setDisponible(false))
            .finally(() => setCargando(false));
    }, []);

    const guardar = async (e) => {
        e.preventDefault();
        if (!form.titulo || !form.montoObjetivo) return;
        const nueva = await crearMeta(form);
        setMetas((m) => [nueva, ...m]);
        setForm({ titulo: '', montoObjetivo: '', montoActual: '', fechaLimite: '' });
        setCreando(false);
    };

    const abonar = async (meta) => {
        const extra = Number(abono);
        if (!extra || extra <= 0) { setAbonando(null); return; }
        const act = await actualizarMeta(meta.id, { montoActual: meta.montoActual + extra });
        setMetas((m) => m.map((x) => (x.id === meta.id ? act : x)));
        setAbonando(null); setAbono('');
    };

    const borrar = async (id) => {
        await eliminarMeta(id);
        setMetas((m) => m.filter((x) => x.id !== id));
    };

    const estimar = (meta) => {
        const falta = meta.montoObjetivo - meta.montoActual;
        if (falta <= 0) return '¡Meta cumplida! 🎉';
        if (ritmoMensual > 0) {
            const meses = Math.ceil(falta / ritmoMensual);
            return `Estimado: ${fechaLarga(addMonths(new Date(), meses))}`;
        }
        return meta.fechaLimite ? `Objetivo: ${fechaLarga(meta.fechaLimite)}` : 'Define un ritmo de ahorro';
    };

    return (
        <Card className="p-6 h-full">
            <SectionHeader
                icon={Target} title="Metas de ahorro" subtitle="Tu progreso hacia tus objetivos"
                action={
                    <button onClick={() => setCreando((v) => !v)}
                        className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition">
                        <Plus size={15} /> Nueva meta
                    </button>
                }
            />

            {!disponible && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 mb-3">
                    Ejecuta el <b>schema.sql</b> actualizado en Supabase para activar las metas (tabla <b>metas</b>).
                </div>
            )}

            <AnimatePresence>
                {creando && (
                    <motion.form onSubmit={guardar}
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-4">
                        <div className="space-y-2.5 rounded-2xl bg-gray-50 p-3.5 border border-gray-100">
                            <input className="input-base" placeholder="¿Para qué ahorras? (ej. Viaje)" value={form.titulo}
                                onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
                            <div className="grid grid-cols-2 gap-2.5">
                                <input className="input-base" type="number" step="0.01" placeholder="Monto objetivo" value={form.montoObjetivo}
                                    onChange={(e) => setForm({ ...form, montoObjetivo: e.target.value })} />
                                <input className="input-base" type="number" step="0.01" placeholder="Ya ahorrado (opcional)" value={form.montoActual}
                                    onChange={(e) => setForm({ ...form, montoActual: e.target.value })} />
                            </div>
                            <input className="input-base" type="date" value={form.fechaLimite}
                                onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })} />
                            <button type="submit" className="w-full bg-brand-500 hover:bg-brand-400 text-black font-bold text-sm py-2.5 rounded-xl transition">
                                Crear meta
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {cargando ? (
                <div className="h-32 flex items-center justify-center text-sm text-gray-400">Cargando metas...</div>
            ) : metas.length === 0 ? (
                <div className="text-center py-10">
                    <Target className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-sm text-gray-400">Aún no tienes metas. ¡Crea la primera!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {metas.map((meta) => {
                        const pct = Math.min(100, (meta.montoActual / meta.montoObjetivo) * 100);
                        const completa = pct >= 100;
                        return (
                            <motion.div key={meta.id} layout
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl border border-gray-100 p-4 hover:shadow-card transition group">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate flex items-center gap-1.5">
                                            {completa && <Check size={15} className="text-emerald-500" />} {meta.titulo}
                                        </p>
                                        <p className="text-xs text-gray-400">{estimar(meta)}</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => setAbonando(abonando === meta.id ? null : meta.id)}
                                            className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition" title="Abonar">
                                            <PlusCircle size={16} />
                                        </button>
                                        <button onClick={() => borrar(meta.id)}
                                            className="p-1.5 text-gray-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition opacity-0 group-hover:opacity-100" title="Eliminar">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 flex justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-gray-700">{money(meta.montoActual)}</span>
                                    <span className="text-gray-400">{money(meta.montoObjetivo)}</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div className={`h-full rounded-full ${completa ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-400 to-brand-600'}`}
                                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                                </div>
                                <p className="text-right text-[11px] font-bold text-gray-500 mt-1">{pct.toFixed(0)}%</p>

                                <AnimatePresence>
                                    {abonando === meta.id && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden">
                                            <div className="flex gap-2 mt-3">
                                                <input className="input-base flex-1" type="number" step="0.01" placeholder="Monto a abonar" value={abono}
                                                    onChange={(e) => setAbono(e.target.value)} autoFocus />
                                                <button onClick={() => abonar(meta)} className="px-3 bg-brand-500 hover:bg-brand-400 text-black rounded-xl"><Check size={16} /></button>
                                                <button onClick={() => { setAbonando(null); setAbono(''); }} className="px-3 bg-gray-100 text-gray-500 rounded-xl"><X size={16} /></button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
