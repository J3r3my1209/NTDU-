import { useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useExpenses } from '../hooks/useExpenses.js';
import { computeAnalytics } from '../lib/analytics.js';
import PremiumGate from '../components/premium/PremiumGate.jsx';

import HeroBalance from '../components/dashboard/HeroBalance.jsx';
import SmartCards from '../components/dashboard/SmartCards.jsx';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart.jsx';
import CategoryDistribution from '../components/dashboard/CategoryDistribution.jsx';
import AutoStats from '../components/dashboard/AutoStats.jsx';
import Insights from '../components/dashboard/Insights.jsx';
import FinancialCalendar from '../components/dashboard/FinancialCalendar.jsx';
import MovementsTimeline from '../components/dashboard/MovementsTimeline.jsx';
import SavingsGoals from '../components/dashboard/SavingsGoals.jsx';
import Predictions from '../components/dashboard/Predictions.jsx';
import TransactionsTable from '../components/dashboard/TransactionsTable.jsx';
import AddTransactionModal from '../components/dashboard/AddTransactionModal.jsx';

export default function Dashboard() {
    const { user } = useAuth();
    const { gastos, loading, crearGasto, eliminarGasto } = useExpenses();
    const [modalOpen, setModalOpen] = useState(false);

    const a = useMemo(() => computeAnalytics(gastos), [gastos]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f8fa]">
                <Navbar />
                <div className="flex items-center justify-center h-[70vh]">
                    <div className="text-center space-y-3">
                        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400 text-sm font-medium">Cargando tu panel financiero...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f8fa]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
                {/* Saludo */}
                <header className="flex items-end justify-between flex-wrap gap-2">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                            Hola, {user?.nombre?.split(' ')[0] || 'crack'} 👋
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">Este es el estado de tus finanzas hoy.</p>
                    </div>
                </header>

                {/* Hero + Insights */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <div className="xl:col-span-2">
                        <HeroBalance
                            saldoTotal={a.saldoTotal}
                            variacionPatrimonioPct={a.variacionPatrimonioPct}
                            ingresosMes={a.ingresosMes}
                            gastosMes={a.gastosMes}
                            sparkAhorro={a.sparkAhorro}
                            onAdd={() => setModalOpen(true)}
                        />
                    </div>
                    <PremiumGate titulo="Inteligencia financiera">
                        <Insights insights={a.insights} />
                    </PremiumGate>
                </div>

                {/* Tarjetas inteligentes */}
                <SmartCards a={a} />

                {/* Gráfico principal + distribución */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2">
                        <IncomeExpenseChart transacciones={gastos} />
                    </div>
                    <CategoryDistribution distribucion={a.distribucionGastos} />
                </div>

                {/* Estadísticas automáticas (Premium) */}
                <PremiumGate titulo="Analíticas avanzadas">
                    <AutoStats stats={a.stats} />
                </PremiumGate>

                {/* Calendario + Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <FinancialCalendar porDia={a.porDia} />
                    <MovementsTimeline transacciones={gastos} />
                </div>

                {/* Metas + Predicciones */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <SavingsGoals ritmoMensual={a.ahorroAcumulado > 0 ? Math.max(a.netoMes, 0) : 0} />
                    <PremiumGate titulo="Predicciones">
                        <Predictions predicciones={a.predicciones} />
                    </PremiumGate>
                </div>

                {/* Historial */}
                <TransactionsTable
                    transacciones={gastos}
                    onEliminar={eliminarGasto}
                />
            </main>

            <AddTransactionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={crearGasto}
            />
        </div>
    );
}
