import { useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useExpenses } from '../hooks/useExpenses.js';
import { computeAnalytics } from '../lib/analytics.js';
import PremiumGate from '../components/premium/PremiumGate.jsx';

// Importación directa del componente para asegurar su disponibilidad
import FinancialAssistant from '../components/dashboard/FinancialAssistant.jsx';

import HeroBalance from '../components/dashboard/HeroBalance.jsx';
import SmartCards from '../components/dashboard/SmartCards.jsx';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart.jsx';
import CategoryDistribution from '../components/dashboard/CategoryDistribution.jsx';
import Insights from '../components/dashboard/Insights.jsx';
import TransactionsTable from '../components/dashboard/TransactionsTable.jsx';
import AddTransactionModal from '../components/dashboard/AddTransactionModal.jsx';

export default function Dashboard() {
    const { user } = useAuth();
    const { gastos, loading, crearGasto, eliminarGasto } = useExpenses();
    const [modalOpen, setModalOpen] = useState(false);

    // Cálculo optimizado de analíticas
    const a = useMemo(() => {
        if (loading || !gastos) return null;
        return computeAnalytics(gastos);
    }, [gastos, loading]);

    // Pantalla de carga
    if (loading || !a) {
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
        <div className="min-h-screen bg-[#f7f8fa] relative">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
                <header>
                    <h1 className="text-3xl font-black text-gray-900">Hola, {user?.nombre?.split(' ')[0]} 👋</h1>
                </header>

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

                <SmartCards a={a} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2">
                        <IncomeExpenseChart transacciones={gastos} />
                    </div>
                    <CategoryDistribution distribucion={a.distribucionGastos} />
                </div>
                
                <TransactionsTable transacciones={gastos} onEliminar={eliminarGasto} />
            </main>

            <AddTransactionModal 
                open={modalOpen} 
                onClose={() => setModalOpen(false)} 
                onSubmit={crearGasto} 
            />

            {/* BOTÓN DEL ASISTENTE FINANCIERO */}
            {/* Se ubica aquí para asegurar que flote sobre el resto del contenido */}
            <div className="fixed bottom-6 right-6 z-[9999]">
                <FinancialAssistant analytics={a} />
            </div>
        </div>
    );
}