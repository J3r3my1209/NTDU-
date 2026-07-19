import {
    Utensils, Car, Home, HeartPulse, GraduationCap, Plug, Gamepad2,
    Wallet, TrendingUp, Briefcase, Gift, CircleDashed,
} from 'lucide-react';

/**
 * Metadata visual de cada categoría: icono (lucide), color base (hex para charts)
 * y clases Tailwind para fondos suaves.
 */
export const CATEGORIAS = {
    alimentacion:    { label: 'Alimentación',   icon: Utensils,      color: '#F59E0B', soft: 'bg-amber-50 text-amber-600' },
    transporte:      { label: 'Transporte',     icon: Car,           color: '#3B82F6', soft: 'bg-blue-50 text-blue-600' },
    hogar:           { label: 'Hogar',          icon: Home,          color: '#8B5CF6', soft: 'bg-violet-50 text-violet-600' },
    salud:           { label: 'Salud',          icon: HeartPulse,    color: '#F43F5E', soft: 'bg-rose-50 text-rose-600' },
    educacion:       { label: 'Educación',      icon: GraduationCap, color: '#6366F1', soft: 'bg-indigo-50 text-indigo-600' },
    servicios:       { label: 'Servicios',      icon: Plug,          color: '#06B6D4', soft: 'bg-cyan-50 text-cyan-600' },
    entretenimiento: { label: 'Entretenimiento',icon: Gamepad2,      color: '#EC4899', soft: 'bg-pink-50 text-pink-600' },
    sueldo:          { label: 'Sueldo',         icon: Wallet,        color: '#10B981', soft: 'bg-emerald-50 text-emerald-600' },
    inversiones:     { label: 'Inversiones',    icon: TrendingUp,    color: '#14B8A6', soft: 'bg-teal-50 text-teal-600' },
    negocio:         { label: 'Negocio',        icon: Briefcase,     color: '#0EA5E9', soft: 'bg-sky-50 text-sky-600' },
    premios:         { label: 'Premios',        icon: Gift,          color: '#D946EF', soft: 'bg-fuchsia-50 text-fuchsia-600' },
    otros:           { label: 'Otros',          icon: CircleDashed,  color: '#64748B', soft: 'bg-slate-100 text-slate-600' },
};

// Sinónimos / nombres antiguos → clave canónica
const ALIAS = {
    comida: 'alimentacion',
    vivienda: 'hogar',
    ocio: 'entretenimiento',
    estudios: 'educacion',
    transporte: 'transporte',
};

const normalizar = (s = '') =>
    s.toString().trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Devuelve la metadata de una categoría, con fallback a "Otros". */
export const getCategoria = (nombre) => {
    const key = normalizar(nombre);
    const canonical = ALIAS[key] || key;
    return CATEGORIAS[canonical] || { ...CATEGORIAS.otros, label: nombre || 'Otros' };
};

// Opciones para los formularios
export const CATEGORIAS_GASTO = [
    'Alimentación', 'Transporte', 'Hogar', 'Salud',
    'Educación', 'Servicios', 'Entretenimiento', 'Otros',
];
export const CATEGORIAS_INGRESO = [
    'Sueldo', 'Inversiones', 'Negocio', 'Premios', 'Otros',
];
