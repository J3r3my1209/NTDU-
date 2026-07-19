import { useEffect } from 'react';
import { useMotionValue, useTransform, animate, motion } from 'framer-motion';

/**
 * AnimatedNumber — anima el conteo de un número hasta `value`.
 * `format` controla cómo se muestra (por defecto moneda).
 */
const moneyFmt = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' });

export const AnimatedNumber = ({
    value = 0,
    format = (v) => moneyFmt.format(v),
    duration = 1,
    className = '',
}) => {
    const mv = useMotionValue(0);
    const text = useTransform(mv, (v) => format(v));

    useEffect(() => {
        const controls = animate(mv, Number(value) || 0, {
            duration,
            ease: [0.21, 1.02, 0.73, 1],
        });
        return controls.stop;
    }, [value, duration, mv]);

    return <motion.span className={`tabular-nums ${className}`}>{text}</motion.span>;
};

export default AnimatedNumber;
