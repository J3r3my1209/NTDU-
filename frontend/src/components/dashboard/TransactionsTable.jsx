import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Trash2, Download, ChevronLeft, ChevronRight, ArrowUpDown, ListFilter, Receipt,
    FileSpreadsheet, FileText, Crown, ChevronDown,
} from 'lucide-react';
import { Card } from '../../ui/Card.jsx';
import { SectionHeader } from '../../ui/Badges.jsx';
import { getCategoria } from '../../lib/categories.js';
import { money, fechaCorta } from '../../lib/format.js';
import { usePremium } from '../../context/PremiumContext.jsx';
import { exportarTransaccionesExcel, exportarTransaccionesPDF } from '../../services/gastosService.js';

const POR_PAGINA = 8;

export default function TransactionsTable({ transacciones = [], onEliminar }) {
    const [busqueda, setBusqueda] = useState('');
    const [tipo, setTipo] = useState('Todos');
    const [categoria, setCategoria] = useState('Todas');
    const [orden, setOrden] = useState({ campo: 'createdAt', dir: 'desc' });
    const [pagina, setPagina] = useState(1);

    const categorias = useMemo(
        () => ['Todas', ...new Set(transacciones.map((t) => getCategoria(t.categoria).label))],
        [transacciones]
    );

    const filtradas = useMemo(() => {
        let r = transacciones.filter((t) => {
            const q = busqueda.toLowerCase();
            const coincide = !q || t.descripcion?.toLowerCase().includes(q) || getCategoria(t.categoria).label.toLowerCase().includes(q);
            const okTipo = tipo === 'Todos' || t.tipo === tipo;
            const okCat = categoria === 'Todas' || getCategoria(t.categoria).label === categoria;
            return coincide && okTipo && okCat;
        });
        r = [...r].sort((a, b) => {
            let va = a[orden.campo], vb = b[orden.campo];
            if (orden.campo === 'monto') { va = Number(va); vb = Number(vb); }
            if (orden.campo === 'createdAt') { va = new Date(va); vb = new Date(vb); }
            return orden.dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
        });
        return r;
    }, [transacciones, busqueda, tipo, categoria, orden]);

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const visibles = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

    const ordenarPor = (campo) =>
        setOrden((o) => ({ campo, dir: o.campo === campo && o.dir === 'desc' ? 'asc' : 'desc' }));

    return (
        <Card className="p-6">
            <SectionHeader
                icon={Receipt}
                title="Historial de transacciones"
                subtitle={`${filtradas.length} movimiento${filtradas.length !== 1 ? 's' : ''}`}
                action={<ExportButton transacciones={filtradas} />}
            />

            {/* Controles */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={busqueda}
                        onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                        placeholder="Buscar por descripción o categoría..."
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                    />
                </div>
                <div className="flex gap-2.5">
                    <Select value={tipo} onChange={(v) => { setTipo(v); setPagina(1); }} opciones={['Todos', 'Ingreso', 'Gasto']} />
                    <Select value={categoria} onChange={(v) => { setCategoria(v); setPagina(1); }} opciones={categorias} icon={ListFilter} />
                </div>
            </div>

            {/* Tabla */}
            {visibles.length === 0 ? (
                <div className="text-center py-14 text-sm text-gray-400">No se encontraron transacciones.</div>
            ) : (
                <div className="overflow-x-auto scrollbar-thin -mx-2 px-2">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                                <th className="pb-3 pl-2">Descripción</th>
                                <th className="pb-3">Categoría</th>
                                <th className="pb-3 hidden sm:table-cell">Cuenta</th>
                                <Th label="Fecha" activo={orden.campo === 'createdAt'} dir={orden.dir} onClick={() => ordenarPor('createdAt')} />
                                <Th label="Monto" activo={orden.campo === 'monto'} dir={orden.dir} onClick={() => ordenarPor('monto')} align="right" />
                                <th className="pb-3 text-center">·</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence initial={false}>
                                {visibles.map((t) => {
                                    const meta = getCategoria(t.categoria);
                                    const Icon = meta.icon;
                                    const ingreso = t.tipo === 'Ingreso';
                                    return (
                                        <motion.tr key={t._id}
                                            layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                                            className="group border-b border-gray-50 hover:bg-gray-50/70 transition-colors text-sm">
                                            <td className="py-3 pl-2 font-medium text-gray-800">{t.descripcion}</td>
                                            <td className="py-3">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold"
                                                    style={{ backgroundColor: `${meta.color}14`, color: meta.color }}>
                                                    <Icon size={12} /> {meta.label}
                                                </span>
                                            </td>
                                            <td className="py-3 text-gray-500 text-xs font-semibold hidden sm:table-cell">{t.cuenta}</td>
                                            <td className="py-3 text-gray-400 text-xs">{fechaCorta(t.createdAt)}</td>
                                            <td className={`py-3 text-right font-bold ${ingreso ? 'text-emerald-600' : 'text-gray-900'}`}>
                                                {ingreso ? '+' : '−'}{money(t.monto)}
                                            </td>
                                            <td className="py-3 text-center">
                                                <button onClick={() => onEliminar?.(t._id)}
                                                    className="p-1.5 text-gray-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
                                                    title="Eliminar">
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Paginación */}
            {totalPaginas > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Página {paginaActual} de {totalPaginas}</span>
                    <div className="flex items-center gap-1">
                        <PageBtn disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}><ChevronLeft size={16} /></PageBtn>
                        {Array.from({ length: totalPaginas }).slice(0, 5).map((_, i) => {
                            const n = i + 1;
                            return (
                                <button key={n} onClick={() => setPagina(n)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${n === paginaActual ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                    {n}
                                </button>
                            );
                        })}
                        <PageBtn disabled={paginaActual === totalPaginas} onClick={() => setPagina(paginaActual + 1)}><ChevronRight size={16} /></PageBtn>
                    </div>
                </div>
            )}
        </Card>
    );
}

function Th({ label, activo, dir, onClick, align = 'left' }) {
    return (
        <th className={`pb-3 ${align === 'right' ? 'text-right' : ''}`}>
            <button onClick={onClick} className={`inline-flex items-center gap-1 hover:text-gray-700 transition ${activo ? 'text-gray-900' : ''}`}>
                {label} <ArrowUpDown size={11} className={activo ? 'text-brand-600' : 'text-gray-300'} />
            </button>
        </th>
    );
}

function Select({ value, onChange, opciones, icon: Icon }) {
    return (
        <div className="relative">
            {Icon && <Icon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
            <select value={value} onChange={(e) => onChange(e.target.value)}
                className={`appearance-none bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500 ${Icon ? 'pl-8' : 'pl-3'}`}>
                {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

function ExportButton({ transacciones }) {
    const { esPremium, abrirModalPremium } = usePremium();
    const [abierto, setAbierto] = useState(false);

    const descargar = (blob, nombre) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = nombre;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
    };

    const exportar = async (tipo) => {
        setAbierto(false);
        const fecha = new Date().toISOString().slice(0, 10);
        try {
            if (tipo === 'pdf') {
                descargar(await exportarTransaccionesPDF(transacciones), `Reporte_NTDU_${fecha}.pdf`);
            } else {
                descargar(await exportarTransaccionesExcel(transacciones), `Reporte_NTDU_${fecha}.xls`);
            }
        } catch {
            alert('No se pudo exportar el reporte.');
        }
    };

    if (!esPremium) {
        return (
            <button onClick={() => abrirModalPremium('Exportar reportes')}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-soft">
                <Crown size={14} className="text-amber-400" fill="currentColor" /> Exportar
            </button>
        );
    }

    return (
        <div className="relative">
            <button onClick={() => setAbierto((v) => !v)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-soft">
                <Download size={15} /> Exportar <ChevronDown size={13} />
            </button>
            <AnimatePresence>
                {abierto && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setAbierto(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                            className="absolute right-0 mt-1.5 z-20 w-44 bg-white rounded-xl shadow-float border border-gray-100 p-1.5">
                            <button onClick={() => exportar('excel')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <FileSpreadsheet size={16} className="text-emerald-600" /> Excel
                            </button>
                            <button onClick={() => exportar('pdf')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <FileText size={16} className="text-rose-500" /> PDF
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function PageBtn({ children, disabled, onClick }) {
    return (
        <button disabled={disabled} onClick={onClick}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition">
            {children}
        </button>
    );
}
