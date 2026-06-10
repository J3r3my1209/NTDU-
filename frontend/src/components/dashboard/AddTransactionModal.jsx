import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO } from '../../lib/categories.js';

const FORM_INICIAL = { descripcion: '', monto: '', tipo: 'Gasto', cuenta: 'Efectivo', categoria: 'Alimentación' };

export default function AddTransactionModal({ open, onClose, onSubmit }) {
    const [form, setForm] = useState(FORM_INICIAL);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) { setForm(FORM_INICIAL); setError(null); }
    }, [open]);

    const cambiarTipo = (tipo) =>
        setForm((f) => ({ ...f, tipo, categoria: tipo === 'Ingreso' ? 'Sueldo' : 'Alimentación' }));

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const enviar = async (e) => {
        e.preventDefault();
        if (!form.descripcion || !form.monto || Number(form.monto) <= 0) {
            setError('Completa la descripción y un monto válido.');
            return;
        }
        setEnviando(true);
        try {
            await onSubmit(form);
            onClose();
        } catch (err) {
            setError(err.message || 'No se pudo guardar la transacción.');
        } finally {
            setEnviando(false);
        }
    };

    const categorias = form.tipo === 'Ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />

                    <motion.div
                        initial={{ y: 40, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 40, opacity: 0, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-float p-6 pb-safe sm:pb-6 max-h-[92vh] overflow-y-auto scrollbar-thin">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-black text-gray-900">Nueva transacción</h3>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
                        </div>

                        {/* Toggle tipo */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {[
                                { v: 'Gasto', icon: TrendingDown, activo: 'bg-rose-500 text-white', label: 'Gasto' },
                                { v: 'Ingreso', icon: TrendingUp, activo: 'bg-emerald-500 text-white', label: 'Ingreso' },
                            ].map((o) => (
                                <button key={o.v} type="button" onClick={() => cambiarTipo(o.v)}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition ${form.tipo === o.v ? o.activo + ' shadow-soft' : 'bg-gray-100 text-gray-500'}`}>
                                    <o.icon size={16} /> {o.label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={enviar} className="space-y-3.5">
                            <Field label="Descripción">
                                <input value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)}
                                    placeholder="Ej. Supermercado, Sueldo..." className="input-base" autoFocus />
                            </Field>
                            <Field label="Monto ($)">
                                <input type="number" step="0.01" min="0" value={form.monto}
                                    onChange={(e) => set('monto', e.target.value)} placeholder="0.00" className="input-base" />
                            </Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Cuenta">
                                    <select value={form.cuenta} onChange={(e) => set('cuenta', e.target.value)} className="input-base">
                                        <option>Efectivo</option><option>Banco</option><option>Tarjeta</option>
                                    </select>
                                </Field>
                                <Field label="Categoría">
                                    <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)} className="input-base">
                                        {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                            </div>

                            {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{error}</p>}

                            <button type="submit" disabled={enviando}
                                className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-60">
                                {enviando ? 'Guardando...' : <><Plus size={18} /> Guardar transacción</>}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

const Field = ({ label, children }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
        {children}
    </div>
);
