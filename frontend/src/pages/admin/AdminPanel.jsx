import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis,
} from 'recharts';
import {
    Users, Crown, UserPlus, Activity, DollarSign, ShoppingCart, TrendingUp,
    ArrowDownCircle, ArrowUpCircle, Layers, ArrowRight,
} from 'lucide-react';
import { Navbar } from '../../components/Navbar.jsx';
import { Card } from '../../ui/Card.jsx';
import { SectionHeader } from '../../ui/Badges.jsx';
import AnimatedNumber from '../../ui/AnimatedNumber.jsx';
import { adminService } from '../../services/admin.service.js';
import { getCategoria } from '../../lib/categories.js';
import { money, moneyCompact } from '../../lib/format.js';

export default function AdminPanel() {
    const [s, setS] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.estadisticas().then((d) => setS(d.estadisticas)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading || !s) {
        return (
            <div className="min-h-screen bg-[#f7f8fa]"><Navbar />
                <div className="flex items-center justify-center h-[70vh]">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    const planData = [
        { label: 'Premium', value: s.premium, color: '#F59E0B' },
        { label: 'Gratuitos', value: s.gratuitos, color: '#94A3B8' },
    ];

    return (
        <div className="min-h-screen bg-[#f7f8fa]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-x py-8 space-y-5">
                <div className="flex items-end justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">⚡ Panel de Administrador</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Vista global del sistema NTDU.</p>
                    </div>
                    <Link to="/admin/users" className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition">
                        <Users size={16} /> Gestionar usuarios
                    </Link>
                </div>

                {/* Usuarios */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <Stat icon={Users} label="Usuarios totales" value={s.totalUsuarios} grad="from-blue-400 to-blue-600" />
                    <Stat icon={Crown} label="Premium" value={s.premium} grad="from-amber-400 to-amber-500" />
                    <Stat icon={Users} label="Gratuitos" value={s.gratuitos} grad="from-slate-400 to-slate-500" />
                    <Stat icon={UserPlus} label="Nuevos (30d)" value={s.nuevos30} grad="from-emerald-400 to-emerald-600" />
                    <Stat icon={Activity} label="Activos (30d)" value={s.activos30} grad="from-violet-400 to-violet-600" />
                </div>

                {/* Ingresos */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <Card className="p-6 lg:col-span-1">
                        <SectionHeader icon={DollarSign} title="Ingresos Premium" subtitle="Ventas únicas de $3" />
                        <div className="space-y-3">
                            <Money label="Total generado" value={s.ingresosPremium} icon={DollarSign} color="#10B981" />
                            <Money label="Compras realizadas" value={s.totalCompras} icon={ShoppingCart} color="#6366F1" raw />
                            <Money label="Promedio por compra" value={s.promedioIngreso} icon={TrendingUp} color="#F59E0B" />
                        </div>
                    </Card>

                    <Card className="p-6 lg:col-span-2">
                        <SectionHeader icon={TrendingUp} title="Ventas Premium por mes" subtitle="Últimos 6 meses" />
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={s.serieVentas} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                    <defs><linearGradient id="ventas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} /><stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient></defs>
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <Tooltip formatter={(v) => money(v)} />
                                    <Area type="monotone" dataKey="total" stroke="#F59E0B" strokeWidth={2.5} fill="url(#ventas)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Distribución + registros */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <Card className="p-6">
                        <SectionHeader icon={Crown} title="Plan de usuarios" subtitle="Premium vs Gratuitos" />
                        <div className="flex items-center gap-4">
                            <div className="w-32 h-32 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={planData} dataKey="value" innerRadius={40} outerRadius={62} paddingAngle={2} stroke="none">
                                            {planData.map((d) => <Cell key={d.label} fill={d.color} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                                {planData.map((d) => (
                                    <div key={d.label} className="flex items-center gap-2 text-sm">
                                        <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                                        <span className="text-gray-600">{d.label}</span>
                                        <span className="font-bold text-gray-900">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 lg:col-span-2">
                        <SectionHeader icon={UserPlus} title="Registros por mes" subtitle="Crecimiento de usuarios" />
                        <div className="h-44">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={s.serieRegistros} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                    <Bar dataKey="total" fill="#6366F1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Uso de la plataforma */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:col-span-1">
                        <Stat icon={Layers} label="Transacciones" value={s.totalTransacciones} grad="from-sky-400 to-sky-600" />
                        <MoneyStat icon={ArrowUpCircle} label="Ingresos registrados" value={s.totalIngresosRegistrados} grad="from-emerald-400 to-emerald-600" />
                        <MoneyStat icon={ArrowDownCircle} label="Gastos registrados" value={s.totalGastosRegistrados} grad="from-rose-400 to-rose-600" />
                    </div>

                    <Card className="p-6 lg:col-span-2">
                        <SectionHeader icon={Layers} title="Categorías más usadas" subtitle="En toda la plataforma" />
                        <div className="space-y-2.5">
                            {s.topCategorias.map((c, i) => {
                                const meta = getCategoria(c._id);
                                const max = s.topCategorias[0]?.cantidad || 1;
                                return (
                                    <div key={c._id}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-gray-700">{meta.label}</span>
                                            <span className="text-gray-400">{c.cantidad} mov. · {money(c.total)}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div className="h-full rounded-full" style={{ background: meta.color }}
                                                initial={{ width: 0 }} animate={{ width: `${(c.cantidad / max) * 100}%` }}
                                                transition={{ duration: 0.6, delay: i * 0.05 }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/admin/users" className="card p-6 hover:shadow-card transition group flex items-center justify-between">
                        <div><div className="text-2xl mb-1">👥</div><h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition">Gestionar usuarios</h3><p className="text-sm text-gray-500">Premium, bloqueos, roles y más.</p></div>
                        <ArrowRight className="text-gray-300 group-hover:text-purple-500 transition" />
                    </Link>
                    <Link to="/admin/reports" className="card p-6 hover:shadow-card transition group flex items-center justify-between">
                        <div><div className="text-2xl mb-1">📊</div><h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition">Reportes globales</h3><p className="text-sm text-gray-500">Análisis financiero de la plataforma.</p></div>
                        <ArrowRight className="text-gray-300 group-hover:text-blue-500 transition" />
                    </Link>
                </div>
            </main>
        </div>
    );
}

function Stat({ icon: Icon, label, value, grad }) {
    return (
        <Card className="p-4" hover>
            <span className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} text-white flex items-center justify-center`}><Icon size={17} /></span>
            <p className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
            <AnimatedNumber value={value} format={(v) => Math.round(v).toLocaleString('es-EC')} className="text-2xl font-black text-gray-900" />
        </Card>
    );
}
function MoneyStat({ icon: Icon, label, value, grad }) {
    return (
        <Card className="p-4" hover>
            <span className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} text-white flex items-center justify-center`}><Icon size={17} /></span>
            <p className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-black text-gray-900">{moneyCompact(value)}</p>
        </Card>
    );
}
function Money({ label, value, icon: Icon, color, raw }) {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}1A`, color }}><Icon size={17} /></span>
            <div className="flex-1"><p className="text-xs text-gray-400 font-semibold">{label}</p>
                <p className="text-lg font-black text-gray-900">{raw ? value : money(value)}</p></div>
        </div>
    );
}
