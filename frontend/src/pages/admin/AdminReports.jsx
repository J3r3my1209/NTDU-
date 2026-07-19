import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar.jsx';
import { adminService } from '../../services/admin.service.js';

export default function AdminReports() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.estadisticas()
            .then(data => setStats(data.estadisticas))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const totalIngresos = stats?.resumenPorTipo?.find(r => r._id === 'Ingreso')?.total || 0;
    const totalGastos = stats?.resumenPorTipo?.find(r => r._id === 'Gasto')?.total || 0;
    const balance = totalIngresos - totalGastos;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-700">← Panel admin</Link>
                    <h1 className="text-2xl font-black text-gray-900">📊 Reportes globales</h1>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 p-6">
                                <p className="text-xs font-bold text-gray-400 uppercase">Balance global</p>
                                <h3 className={`text-3xl font-black mt-2 ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    ${balance.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border-l-4 border-emerald-500 p-6">
                                <p className="text-xs font-bold text-gray-400 uppercase">Total ingresos globales</p>
                                <h3 className="text-3xl font-black mt-2 text-emerald-600">
                                    +${totalIngresos.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border-l-4 border-red-500 p-6">
                                <p className="text-xs font-bold text-gray-400 uppercase">Total gastos globales</p>
                                <h3 className="text-3xl font-black mt-2 text-red-600">
                                    -${totalGastos.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="font-bold text-gray-800 mb-4">Top categorías por monto</h2>
                            {stats?.topCategorias?.length > 0 ? (() => {
                                const ordenadas = [...stats.topCategorias].sort((a, b) => b.total - a.total);
                                const maxVal = ordenadas[0].total || 1;
                                return (
                                    <div className="space-y-3">
                                        {ordenadas.map((c, i) => {
                                            const pct = Math.min(100, Math.round((c.total / maxVal) * 100));
                                            return (
                                                <div key={c._id}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="font-medium text-gray-700">
                                                            <span className="text-gray-400 mr-2">#{i + 1}</span>
                                                            {c._id}
                                                        </span>
                                                        <span className="font-bold text-gray-800">${c.total.toFixed(2)}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-[#00E56A] h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })() : (
                                <p className="text-gray-400 text-sm text-center py-8">No hay datos de categorías aún.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
