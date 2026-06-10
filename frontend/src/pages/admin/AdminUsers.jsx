import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Crown, Ban, LockOpen, ShieldCheck, Shield, Trash2, Users } from 'lucide-react';
import { Navbar } from '../../components/Navbar.jsx';
import { Card } from '../../ui/Card.jsx';
import PremiumBadge from '../../ui/PremiumBadge.jsx';
import { adminService } from '../../services/admin.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { fechaCorta } from '../../lib/format.js';

export default function AdminUsers() {
    const { user: actual } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [plan, setPlan] = useState('Todos');
    const [estado, setEstado] = useState('Todos');

    const cargar = () => {
        setLoading(true);
        adminService.listarUsuarios().then((d) => setUsuarios(d.usuarios)).finally(() => setLoading(false));
    };
    useEffect(cargar, []);

    const accion = async (fn, confirmar) => {
        if (confirmar && !confirm(confirmar)) return;
        try { await fn(); cargar(); } catch { alert('No se pudo completar la acción.'); }
    };

    const filtrados = useMemo(() => usuarios.filter((u) => {
        const q = busqueda.toLowerCase();
        const okQ = !q || u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
        const okPlan = plan === 'Todos' || (plan === 'Premium' ? u.esPremium : !u.esPremium);
        const okEstado = estado === 'Todos' || (estado === 'Bloqueados' ? u.bloqueado : !u.bloqueado);
        return okQ && okPlan && okEstado;
    }), [usuarios, busqueda, plan, estado]);

    return (
        <div className="min-h-screen bg-[#f7f8fa]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-x py-8">
                <div className="flex items-center gap-3 mb-5">
                    <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-700">← Panel</Link>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Users size={22} /> Gestión de usuarios</h1>
                </div>

                <Card className="p-5 sm:p-6">
                    {/* Filtros */}
                    <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o correo..."
                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white" />
                        </div>
                        <Sel value={plan} set={setPlan} opts={['Todos', 'Premium', 'Gratis']} />
                        <Sel value={estado} set={setEstado} opts={['Todos', 'Activos', 'Bloqueados']} />
                    </div>

                    {loading ? (
                        <div className="py-16 text-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                    ) : filtrados.length === 0 ? (
                        <p className="text-center text-gray-400 py-14 text-sm">No se encontraron usuarios.</p>
                    ) : (
                        <div className="overflow-x-auto scrollbar-thin -mx-2 px-2">
                            <table className="w-full text-left min-w-[760px]">
                                <thead>
                                    <tr className="text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                                        <th className="pb-3 pl-2">Usuario</th><th className="pb-3">Plan</th><th className="pb-3">Estado</th>
                                        <th className="pb-3">Rol</th><th className="pb-3">Registro</th><th className="pb-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence initial={false}>
                                        {filtrados.map((u) => {
                                            const yo = u._id === actual?.id;
                                            return (
                                                <motion.tr key={u._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className="border-b border-gray-50 hover:bg-gray-50/60 text-sm">
                                                    <td className="py-3 pl-2">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs">{u.nombre?.[0]?.toUpperCase() || 'U'}</span>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-gray-800 truncate flex items-center gap-1.5">{u.nombre || 'Sin nombre'} {yo && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 rounded-full">Tú</span>}</p>
                                                                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">{u.esPremium ? <PremiumBadge size="sm" /> : <span className="text-xs font-bold text-gray-400">Gratis</span>}</td>
                                                    <td className="py-3">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.bloqueado ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                            {u.bloqueado ? 'Bloqueado' : 'Activo'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                                                    <td className="py-3 text-gray-400 text-xs">{u.createdAt ? fechaCorta(u.createdAt) : '—'}</td>
                                                    <td className="py-3">
                                                        {yo ? <span className="text-xs text-gray-300 block text-center">—</span> : (
                                                            <div className="flex items-center justify-center gap-1">
                                                                {u.esPremium
                                                                    ? <IconBtn title="Quitar Premium" color="amber" onClick={() => accion(() => adminService.quitarPremium(u._id))}><Crown size={15} /></IconBtn>
                                                                    : <IconBtn title="Dar Premium" color="amberSolid" onClick={() => accion(() => adminService.darPremium(u._id))}><Crown size={15} /></IconBtn>}
                                                                {u.bloqueado
                                                                    ? <IconBtn title="Desbloquear" color="emerald" onClick={() => accion(() => adminService.bloquear(u._id, false))}><LockOpen size={15} /></IconBtn>
                                                                    : <IconBtn title="Bloquear" color="rose" onClick={() => accion(() => adminService.bloquear(u._id, true), '¿Bloquear a este usuario?')}><Ban size={15} /></IconBtn>}
                                                                {u.role === 'admin'
                                                                    ? <IconBtn title="Quitar admin" color="slate" onClick={() => accion(() => adminService.cambiarRol(u._id, 'usuario'))}><Shield size={15} /></IconBtn>
                                                                    : <IconBtn title="Hacer admin" color="purple" onClick={() => accion(() => adminService.cambiarRol(u._id, 'admin'))}><ShieldCheck size={15} /></IconBtn>}
                                                                <IconBtn title="Eliminar" color="rose" onClick={() => accion(() => adminService.eliminarUsuario(u._id), '¿Eliminar este usuario y todos sus datos? Es irreversible.')}><Trash2 size={15} /></IconBtn>
                                                            </div>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                    <p className="text-xs text-gray-400 mt-3">{filtrados.length} usuario{filtrados.length !== 1 ? 's' : ''}</p>
                </Card>
            </main>
        </div>
    );
}

function Sel({ value, set, opts }) {
    return (
        <select value={value} onChange={(e) => set(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500">
            {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
    );
}

function IconBtn({ children, title, color, onClick }) {
    const colores = {
        amber: 'text-amber-500 hover:bg-amber-50',
        amberSolid: 'text-gray-400 hover:text-amber-500 hover:bg-amber-50',
        emerald: 'text-emerald-500 hover:bg-emerald-50',
        rose: 'text-gray-400 hover:text-rose-500 hover:bg-rose-50',
        purple: 'text-gray-400 hover:text-purple-600 hover:bg-purple-50',
        slate: 'text-purple-500 hover:bg-purple-50',
    }[color];
    return (
        <button title={title} onClick={onClick} className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${colores}`}>
            {children}
        </button>
    );
}
