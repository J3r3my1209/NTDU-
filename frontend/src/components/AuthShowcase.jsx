import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Zap, ShieldCheck, BarChart3, Smartphone, CloudUpload, TrendingUp, ArrowUpRight, Sparkles,
} from 'lucide-react';

/**
 * AuthShowcase — panel izquierdo premium para Login y Registro.
 * Muestra el producto "funcionando" (dashboard flotante + gráficos + tarjetas
 * glassmorphism + partículas y glows). Solo visible en pantallas grandes.
 */
export default function AuthShowcase() {
    const particulas = useMemo(
        () => Array.from({ length: 22 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 2 + Math.random() * 4,
            delay: Math.random() * 4,
            dur: 6 + Math.random() * 6,
        })),
        []
    );

    return (
        <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden bg-ink text-white">
            {/* Fondos: glows y grid */}
            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_15%_10%,rgba(0,229,106,.20),transparent_45%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_90%_90%,rgba(16,185,129,.16),transparent_50%)]" />
            <div className="absolute inset-0 bg-grid-faint [background-size:40px_40px] opacity-[0.18]" />
            <div className="absolute -left-24 top-1/3 w-80 h-80 rounded-full bg-brand-500/20 blur-[100px]" />
            <div className="absolute right-0 bottom-0 w-72 h-72 rounded-full bg-emerald-400/10 blur-[90px]" />

            {/* Partículas flotantes */}
            {particulas.map((p) => (
                <motion.span
                    key={p.id}
                    className="absolute rounded-full bg-brand-300/70"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                    animate={{ y: [0, -24, 0], opacity: [0, 0.9, 0] }}
                    transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}

            {/* Contenido */}
            <div className="relative z-10 flex flex-col w-full p-10 xl:p-14">
                {/* Marca */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="flex items-center gap-2.5">
                    <span className="text-3xl">💸</span>
                    <span className="text-xl font-black tracking-tight">No Tan De Una</span>
                </motion.div>

                {/* Escena central */}
                <div className="relative flex-1 flex items-center justify-center">
                    <FloatingCard className="left-0 top-8 hidden xl:flex" delay={0.4} icon={Zap} color="#00E56A" title="Análisis en tiempo real" />
                    <FloatingCard className="left-2 bottom-16 hidden xl:flex" delay={0.7} icon={ShieldCheck} color="#34D399" title="Datos protegidos" />
                    <FloatingCard className="right-0 top-4 hidden xl:flex" delay={0.55} icon={BarChart3} color="#22D3EE" title="Estadísticas inteligentes" />
                    <FloatingCard className="right-2 bottom-24 hidden xl:flex" delay={0.85} icon={TrendingUp} color="#A3E635" title="Predicciones financieras" />

                    <PhoneMockup />
                </div>

                {/* Eslogan + chips */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                    <h2 className="text-2xl xl:text-3xl font-black leading-tight">
                        Tus finanzas, <span className="text-gradient">claras y bajo control</span>.
                    </h2>
                    <p className="text-white/55 mt-2 text-sm max-w-sm">
                        Visualiza, analiza y predice tu dinero con una experiencia hecha para que decidas mejor.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-5">
                        {[[Smartphone, 'Android y iPhone'], [CloudUpload, 'Respaldo seguro'], [ShieldCheck, '100% seguro']].map(([Icon, t]) => (
                            <span key={t} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur">
                                <Icon size={13} className="text-brand-400" /> {t}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

/* ── Mockup del "teléfono" con dashboard ── */
function PhoneMockup() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, ease: [0.21, 1.02, 0.73, 1] }}
            className="relative">
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-[270px] rounded-[2rem] bg-white/[0.06] border border-white/15 backdrop-blur-xl p-4 shadow-float">
                {/* Notch */}
                <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-white/20" />

                {/* Saldo */}
                <div className="rounded-2xl bg-gradient-to-br from-brand-500/20 to-transparent border border-white/10 p-4">
                    <div className="flex items-center gap-1.5 text-white/55 text-[11px] font-semibold uppercase tracking-wider">
                        <Sparkles size={12} className="text-brand-400" /> Saldo actual
                    </div>
                    <div className="mt-1 flex items-end gap-2">
                        <span className="text-3xl font-black">$2,450</span>
                        <span className="mb-1 inline-flex items-center gap-0.5 text-[11px] font-bold text-brand-300 bg-brand-500/15 rounded-md px-1.5 py-0.5">
                            <ArrowUpRight size={11} /> 12% este mes
                        </span>
                    </div>
                    <LineChart />
                </div>

                {/* Categorías */}
                <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-4">
                    <Donut />
                    <div className="space-y-1.5 flex-1">
                        {[['Alimentación', '#F59E0B'], ['Transporte', '#3B82F6'], ['Servicios', '#06B6D4'], ['Entretenimiento', '#EC4899']].map(([t, c]) => (
                            <div key={t} className="flex items-center gap-2 text-[11px] text-white/70">
                                <span className="w-2 h-2 rounded-full" style={{ background: c }} /> {t}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mini tarjetas ingreso/gasto */}
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-3">
                        <p className="text-[10px] text-emerald-300/80 font-semibold">Ingresos</p>
                        <p className="text-sm font-black text-emerald-300">+$3,200</p>
                    </div>
                    <div className="rounded-xl bg-rose-500/10 border border-rose-400/20 p-3">
                        <p className="text-[10px] text-rose-300/80 font-semibold">Gastos</p>
                        <p className="text-sm font-black text-rose-300">-$750</p>
                    </div>
                </div>
            </motion.div>

            {/* Resplandor bajo el teléfono */}
            <div className="absolute -inset-6 -z-10 bg-brand-500/20 blur-3xl rounded-full" />
        </motion.div>
    );
}

function LineChart() {
    const linea = 'M0,52 C24,40 40,46 60,30 C82,12 100,34 122,24 C146,13 170,20 200,6';
    const area = `${linea} L200,64 L0,64 Z`;
    return (
        <svg viewBox="0 0 200 64" className="mt-3 w-full h-16" preserveAspectRatio="none">
            <defs>
                <linearGradient id="auth-line" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E56A" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00E56A" stopOpacity="0" />
                </linearGradient>
            </defs>
            <motion.path d={area} fill="url(#auth-line)"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} />
            <motion.path d={linea} fill="none" stroke="#00E56A" strokeWidth="2.5" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
        </svg>
    );
}

function Donut() {
    return (
        <div className="relative w-[68px] h-[68px] shrink-0">
            <div className="w-full h-full rounded-full"
                style={{ background: 'conic-gradient(#F59E0B 0 46%, #3B82F6 46% 70%, #06B6D4 70% 88%, #EC4899 88% 100%)' }} />
            <div className="absolute inset-[10px] rounded-full bg-ink flex items-center justify-center">
                <span className="text-[10px] font-bold text-white/60">Gastos</span>
            </div>
        </div>
    );
}

/* ── Tarjeta flotante glassmorphism ── */
function FloatingCard({ className = '', icon: Icon, color, title, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -9, 0] }}
            transition={{
                opacity: { duration: 0.5, delay }, scale: { duration: 0.5, delay },
                y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay },
            }}
            whileHover={{ scale: 1.06, y: -4 }}
            className={`absolute z-20 items-center gap-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-3.5 py-2.5 shadow-float ${className}`}>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}22`, color }}>
                <Icon size={16} />
            </span>
            <span className="text-xs font-bold whitespace-nowrap">{title}</span>
        </motion.div>
    );
}
