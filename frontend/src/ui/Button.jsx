/**
 * Button — Componente reutilizable con variantes Tailwind
 */
export const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    disabled = false,
    loading = false,
    className = ''
}) => {
    const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm px-5 py-2.5';

    const variants = {
        primary:   'bg-black text-white hover:bg-gray-800',
        green:     'bg-[#00E56A] text-black hover:bg-[#00c45a]',
        danger:    'bg-red-500 text-white hover:bg-red-600',
        ghost:     'bg-gray-100 text-gray-700 hover:bg-gray-200',
        outline:   'border border-gray-300 text-gray-700 hover:bg-gray-50'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${base} ${variants[variant] || variants.primary} ${className}`}
        >
            {loading && (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
};

export default Button;
