import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const FeatureCard = ({ icon, title, desc }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

const StatCard = ({ value, label }) => (
    <div className="text-center">
        <div className="text-4xl font-black text-[#00E56A]">{value}</div>
        <div className="text-gray-500 text-sm mt-1">{label}</div>
    </div>
);

export default function Landing() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* ── Navbar ─────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl">💸</span>
                        <span className="text-xl font-black tracking-tight text-gray-900">No Tan De Una</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="bg-[#00E56A] hover:bg-[#00c45a] text-black font-bold py-2 px-5 rounded-full text-sm transition-all">
                                Ir al Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 font-medium text-sm hover:text-gray-900 transition-colors">
                                    Iniciar sesión
                                </Link>
                                <Link to="/register" className="bg-[#00E56A] hover:bg-[#00c45a] text-black font-bold py-2 px-5 rounded-full text-sm transition-all">
                                    Empieza gratis
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── Hero ───────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-2 rounded-full mb-8 border border-emerald-200">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Gestión financiera personal, sin complicaciones
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-6">
                    Controla tus gastos,<br />
                    <span className="text-[#00E56A]">sin tantas vueltas.</span>
                </h1>

                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                    La herramienta perfecta para saber exactamente a dónde se está yendo tu plata cada mes. Simple, rápido y sin excusas.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/register" className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all hover:-translate-y-0.5 shadow-lg">
                        Empezar ahora — Es gratis
                    </Link>
                    <Link to="/login" className="bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold py-4 px-8 rounded-2xl text-lg transition-all border border-gray-200">
                        Ya tengo cuenta
                    </Link>
                </div>
            </section>

            {/* ── Stats ──────────────────────────────── */}
            <section className="bg-gray-50 border-y border-gray-100 py-12">
                <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <StatCard value="100%" label="Gratis siempre" />
                    <StatCard value="< 1min" label="Para empezar" />
                    <StatCard value="Excel" label="Exportación real" />
                    <StatCard value="100%" label="Tus datos, tuyos" />
                </div>
            </section>

            {/* ── Features ───────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                        Todo lo que necesitas
                    </h2>
                    <p className="text-gray-500 text-lg">Sin apps complicadas. Sin suscripciones. Sin rollo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon="💳"
                        title="Registra en segundos"
                        desc="Añade ingresos y gastos en menos tiempo del que tardas en lamentarte por haberlos hecho."
                    />
                    <FeatureCard
                        icon="📊"
                        title="Visualiza tu balance"
                        desc="Ve exactamente cuánto ganas, cuánto gastas y cuánto te queda. En tiempo real."
                    />
                    <FeatureCard
                        icon="📁"
                        title="Exporta a Excel"
                        desc="Descarga tu historial completo en formato .xlsx con un solo clic. Bonito y formateado."
                    />
                    <FeatureCard
                        icon="🗂️"
                        title="Categorías inteligentes"
                        desc="Comida, transporte, vivienda, inversiones. Organiza tus movimientos sin esfuerzo."
                    />
                    <FeatureCard
                        icon="🔐"
                        title="Seguro y privado"
                        desc="Autenticación JWT, contraseñas cifradas con bcrypt. Tus datos están seguros."
                    />
                    <FeatureCard
                        icon="📱"
                        title="Responsive"
                        desc="Úsalo desde tu celular, tablet o computadora. Siempre se ve bien."
                    />
                </div>
            </section>

            {/* ── CTA ────────────────────────────────── */}
            <section className="bg-black text-white py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-black mb-4">
                        ¿Listo para tomar el control?
                    </h2>
                    <p className="text-gray-400 text-lg mb-8">
                        Crea tu cuenta en 30 segundos y empieza a registrar hoy mismo.
                    </p>
                    <Link to="/register" className="inline-block bg-[#00E56A] hover:bg-[#00c45a] text-black font-black py-4 px-10 rounded-2xl text-lg transition-all hover:-translate-y-0.5">
                        Crear cuenta gratis →
                    </Link>
                </div>
            </section>

            {/* ── Footer ─────────────────────────────── */}
            <footer className="border-t border-gray-100 py-8 px-6 text-center text-gray-400 text-sm">
                <p>© 2024 No Tan De Una — Proyecto académico por Fabara, Vivas & Perugachi</p>
            </footer>
        </div>
    );
}
