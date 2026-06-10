import { motion } from 'framer-motion';

/**
 * Card — contenedor premium con animación de entrada y hover sutil.
 */
export const Card = ({ children, className = '', delay = 0, hover = true, ...rest }) => (
    <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay, ease: [0.21, 1.02, 0.73, 1] }}
        whileHover={hover ? { y: -2 } : undefined}
        className={`card p-5 ${className}`}
        {...rest}
    >
        {children}
    </motion.div>
);

export default Card;
