import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PasswordInput — campo de contraseña con un monito 🐵 animado en vez del
 * típico icono de ojo. El monito observa el campo, sigue el cursor con la
 * mirada, sonríe al enfocar y se tapa los ojos con las manos al revelar la
 * contraseña. 100% SVG + Framer Motion (sin GIFs).
 */
export default function PasswordInput({
    value,
    onChange,
    placeholder = '••••••••',
    name,
    id,
    autoComplete = 'current-password',
    required = false,
    autoFocus = false,
    className = '',
}) {
    const reactId = useId();
    const inputId = id || reactId;
    const [visible, setVisible] = useState(false);
    const [focused, setFocused] = useState(false);
    const [frac, setFrac] = useState(0.5); // posición relativa del cursor (0..1)

    const seguirCursor = (el) => {
        const len = el.value.length || 1;
        const pos = el.selectionStart ?? len;
        setFrac(Math.min(1, Math.max(0, pos / len)));
    };

    const base =
        'w-full pl-4 pr-14 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 ' +
        'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-white ' +
        'transition text-sm';

    return (
        <div className="relative">
            <input
                id={inputId}
                name={name}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={(e) => { onChange(e); seguirCursor(e.target); }}
                onKeyUp={(e) => seguirCursor(e.target)}
                onClick={(e) => seguirCursor(e.target)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                required={required}
                autoFocus={autoFocus}
                autoComplete={autoComplete}
                className={`${base} ${className}`}
            />

            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
                <Monkey visible={visible} focused={focused} frac={frac} />
            </button>
        </div>
    );
}

function Monkey({ visible, focused, frac }) {
    const pupilX = (frac - 0.5) * 4.5;   // sigue el cursor horizontalmente
    const pupilY = focused ? 1.6 : 0.6;  // mira un poco hacia el campo
    const spring = { type: 'spring', stiffness: 320, damping: 18 };

    return (
        <motion.svg
            width="36" height="36" viewBox="0 0 64 64"
            initial={false}
            animate={{ rotate: visible ? -5 : 0, y: focused ? -1 : 0 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="drop-shadow-sm"
        >
            {/* Orejas */}
            <circle cx="12" cy="24" r="9" fill="#7A4A2B" />
            <circle cx="12" cy="24" r="4.5" fill="#C6915E" />
            <circle cx="52" cy="24" r="9" fill="#7A4A2B" />
            <circle cx="52" cy="24" r="4.5" fill="#C6915E" />

            {/* Cabeza */}
            <ellipse cx="32" cy="34" rx="22" ry="20" fill="#8B5E3C" />
            {/* Cara */}
            <ellipse cx="32" cy="39" rx="16" ry="14" fill="#E8C29A" />

            {/* Ojos */}
            <g>
                <circle cx="24" cy="30" r="6" fill="#fff" />
                <circle cx="40" cy="30" r="6" fill="#fff" />
                <motion.circle cx={24} cy={30} r="3" fill="#2B2118"
                    animate={{ cx: 24 + pupilX, cy: 30 + pupilY }} transition={spring} />
                <motion.circle cx={40} cy={30} r="3" fill="#2B2118"
                    animate={{ cx: 40 + pupilX, cy: 30 + pupilY }} transition={spring} />
                {/* brillo */}
                <motion.circle cx={25} cy={29} r="0.9" fill="#fff"
                    animate={{ cx: 25 + pupilX, cy: 29 + pupilY }} transition={spring} />
                <motion.circle cx={41} cy={29} r="0.9" fill="#fff"
                    animate={{ cx: 41 + pupilX, cy: 29 + pupilY }} transition={spring} />
            </g>

            {/* Nariz */}
            <ellipse cx="29" cy="41" rx="1.3" ry="2" fill="#8B5E3C" />
            <ellipse cx="35" cy="41" rx="1.3" ry="2" fill="#8B5E3C" />

            {/* Boca (sonríe al enfocar) */}
            <motion.path
                stroke="#8B5E3C" strokeWidth="2" fill="none" strokeLinecap="round"
                initial={false}
                animate={{ d: focused ? 'M26 46 Q32 52 38 46' : 'M27 46 Q32 48.5 37 46' }}
                transition={{ duration: 0.3 }}
            />

            {/* Manos que tapan los ojos */}
            <AnimatePresence>
                {visible && (
                    <motion.g
                        initial={{ y: 26, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 26, opacity: 0 }}
                        transition={{ duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                        <Paw cx={23} rot={-8} />
                        <Paw cx={41} rot={8} />
                    </motion.g>
                )}
            </AnimatePresence>
        </motion.svg>
    );
}

function Paw({ cx, rot }) {
    return (
        <g transform={`rotate(${rot} ${cx} 30)`}>
            <ellipse cx={cx} cy="30" rx="10" ry="9" fill="#7A4A2B" />
            <ellipse cx={cx} cy="31.5" rx="6" ry="6.5" fill="#C6915E" />
            {/* dedos */}
            {[-5.5, -1.8, 1.8, 5.5].map((dx, i) => (
                <line key={i}
                    x1={cx + dx} y1="22.5" x2={cx + dx} y2="26.5"
                    stroke="#5E3719" strokeWidth="1.6" strokeLinecap="round" />
            ))}
        </g>
    );
}
