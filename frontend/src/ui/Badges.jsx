import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * TrendBadge — badge de variación porcentual.
 * `invert` = true cuando subir es malo (ej. gastos).
 */
export const TrendBadge = ({ value = 0, invert = false, light = false }) => {
    const v = Number(value) || 0;
    const up = v >= 0;
    const bueno = invert ? !up : up;
    const Icon = up ? ArrowUpRight : ArrowDownRight;

    const tonos = bueno
        ? (light ? 'bg-white/15 text-brand-300' : 'bg-emerald-50 text-emerald-600')
        : (light ? 'bg-white/15 text-rose-300' : 'bg-rose-50 text-rose-600');

    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${tonos}`}>
            <Icon size={12} strokeWidth={2.5} />
            {Math.abs(v).toFixed(0)}%
        </span>
    );
};

export const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
    <div className="flex items-end justify-between mb-4 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
                <span className="w-9 h-9 shrink-0 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                    <Icon size={18} />
                </span>
            )}
            <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate">{title}</h2>
                {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
            </div>
        </div>
        {action}
    </div>
);
