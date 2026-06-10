/**
 * Helpers de formato (locale es-EC, moneda USD que usa Ecuador).
 */

const moneyFmt = new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const compactFmt = new Intl.NumberFormat('es-EC', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

export const money = (n) => moneyFmt.format(Number(n) || 0);

// Versión compacta: $12.4k
export const moneyCompact = (n) => '$' + compactFmt.format(Number(n) || 0);

// +$120.00 / -$80.00 según el signo
export const moneySigned = (n) => {
    const v = Number(n) || 0;
    return (v >= 0 ? '+' : '−') + moneyFmt.format(Math.abs(v));
};

export const percent = (n, decimals = 0) => {
    const v = Number(n) || 0;
    return `${v > 0 ? '+' : ''}${v.toFixed(decimals)}%`;
};

const dShort = new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'short' });
const dFull = new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'long', year: 'numeric' });
const dTime = new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit' });
const dWeekday = new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });

export const fechaCorta = (d) => dShort.format(new Date(d));
export const fechaLarga = (d) => dFull.format(new Date(d));
export const hora = (d) => dTime.format(new Date(d));
export const fechaDiaSemana = (d) => dWeekday.format(new Date(d));

export const capitalizar = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);
