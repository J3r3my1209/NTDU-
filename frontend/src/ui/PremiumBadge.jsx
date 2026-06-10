import { Crown } from 'lucide-react';

/**
 * PremiumBadge — insignia 👑 Premium con degradado dorado.
 */
export default function PremiumBadge({ size = 'md', className = '' }) {
    const tam = {
        sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
        md: 'text-xs px-2 py-0.5 gap-1',
        lg: 'text-sm px-3 py-1 gap-1.5',
    }[size];
    const icon = { sm: 11, md: 12, lg: 15 }[size];

    return (
        <span className={`inline-flex items-center font-bold rounded-full text-amber-900
            bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 shadow-sm ${tam} ${className}`}>
            <Crown size={icon} strokeWidth={2.5} fill="currentColor" /> Premium
        </span>
    );
}
