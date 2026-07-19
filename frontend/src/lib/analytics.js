import {
    startOfMonth, endOfMonth, subMonths, isSameMonth,
    eachDayOfInterval, subDays, startOfWeek, subWeeks,
    startOfYear, format, getDay, differenceInCalendarDays, isWithinInterval,
} from 'date-fns';
import { getCategoria } from './categories.js';

/**
 * Motor de analíticas financieras.
 * Recibe las transacciones { monto, tipo, categoria, cuenta, createdAt } y
 * devuelve TODO lo que el dashboard necesita (resúmenes, series para gráficos,
 * estadísticas automáticas, insights y predicciones). Funciones puras.
 */

const esGasto = (t) => t.tipo === 'Gasto';
const esIngreso = (t) => t.tipo === 'Ingreso';
const monto = (t) => Number(t.monto) || 0;
const neto = (t) => (esIngreso(t) ? monto(t) : -monto(t));
const fecha = (t) => new Date(t.createdAt || Date.now());
const keyDia = (d) => format(new Date(d), 'yyyy-MM-dd');

const sum = (arr, fn) => arr.reduce((acc, x) => acc + fn(x), 0);
const pctCambio = (actual, previo) => {
    if (!previo) return actual > 0 ? 100 : 0;
    return ((actual - previo) / Math.abs(previo)) * 100;
};

// ── Series para sparklines / gráfico principal ────────────────
const serieDiaria = (txs, dias, selector) => {
    const hoy = new Date();
    const inicio = subDays(hoy, dias - 1);
    const dlist = eachDayOfInterval({ start: inicio, end: hoy });
    return dist(dlist, txs, selector, (d, t) => isSameDay(d, fecha(t)));
};
const isSameDay = (a, b) => keyDia(a) === keyDia(b);
const dist = (buckets, txs, selector, match) =>
    buckets.map((b) => selector(txs.filter((t) => match(b, t)), b));

// ── Gráfico Ingresos vs Gastos por periodo ────────────────────
export const seriesPorPeriodo = (txs, periodo) => {
    const hoy = new Date();
    let buckets = [];

    if (periodo === 'dia') {
        buckets = eachDayOfInterval({ start: subDays(hoy, 13), end: hoy }).map((d) => ({
            label: format(d, 'dd/MM'),
            test: (t) => isSameDay(d, fecha(t)),
        }));
    } else if (periodo === 'semana') {
        for (let i = 7; i >= 0; i--) {
            const ini = startOfWeek(subWeeks(hoy, i), { weekStartsOn: 1 });
            const fin = subDays(startOfWeek(subWeeks(hoy, i - 1), { weekStartsOn: 1 }), 1);
            buckets.push({
                label: format(ini, 'dd/MM'),
                test: (t) => isWithinInterval(fecha(t), { start: ini, end: fin }),
            });
        }
    } else if (periodo === 'anio') {
        for (let i = 4; i >= 0; i--) {
            const y = hoy.getFullYear() - i;
            buckets.push({
                label: String(y),
                test: (t) => fecha(t).getFullYear() === y,
            });
        }
    } else {
        // mes (por defecto): últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const m = subMonths(hoy, i);
            buckets.push({
                label: format(m, 'LLL'),
                test: (t) => isSameMonth(fecha(t), m),
            });
        }
    }

    return buckets.map((b) => {
        const dentro = txs.filter(b.test);
        return {
            label: b.label,
            ingresos: sum(dentro.filter(esIngreso), monto),
            gastos: sum(dentro.filter(esGasto), monto),
        };
    });
};

// ── Distribución de gastos por categoría ──────────────────────
const distribucion = (gastos) => {
    const map = {};
    for (const g of gastos) {
        const meta = getCategoria(g.categoria);
        map[meta.label] ??= { label: meta.label, color: meta.color, total: 0, cantidad: 0 };
        map[meta.label].total += monto(g);
        map[meta.label].cantidad += 1;
    }
    const total = sum(Object.values(map), (c) => c.total);
    return Object.values(map)
        .map((c) => ({ ...c, pct: total ? (c.total / total) * 100 : 0 }))
        .sort((a, b) => b.total - a.total);
};

// ── Insights inteligentes ─────────────────────────────────────
const construirInsights = ({ gastosMes, gastosMesPrev, distMes, txMes }) => {
    const out = [];

    const entret = distMes.find((c) => c.label === 'Entretenimiento');
    if (entret && entret.total > 0) {
        out.push({
            id: 'ahorro-entret', tono: 'positivo',
            titulo: 'Oportunidad de ahorro',
            texto: `Podrías ahorrar ${money(entret.total * 0.1)} al mes reduciendo 10% tus gastos en Entretenimiento.`,
        });
    }

    // Categoría que más creció vs mes anterior
    const prevMap = {};
    for (const g of gastosMesPrev) {
        const l = getCategoria(g.categoria).label;
        prevMap[l] = (prevMap[l] || 0) + monto(g);
    }
    let mayorAlza = null;
    for (const c of distMes) {
        const antes = prevMap[c.label] || 0;
        if (antes > 0) {
            const cambio = pctCambio(c.total, antes);
            if (cambio >= 20 && (!mayorAlza || cambio > mayorAlza.cambio)) {
                mayorAlza = { label: c.label, cambio };
            }
        }
    }
    if (mayorAlza) {
        out.push({
            id: 'alza-cat', tono: 'alerta',
            titulo: 'Gasto en aumento',
            texto: `Tu gasto en ${mayorAlza.label} aumentó ${Math.round(mayorAlza.cambio)}% respecto al mes anterior.`,
        });
    }

    // Concentración en fin de semana
    const totalGastoMes = sum(txMes.filter(esGasto), monto);
    const finde = sum(txMes.filter((t) => esGasto(t) && [0, 6].includes(getDay(fecha(t)))), monto);
    if (totalGastoMes > 0 && finde / totalGastoMes >= 0.4) {
        out.push({
            id: 'finde', tono: 'neutro',
            titulo: 'Patrón de fin de semana',
            texto: `Los fines de semana concentran el ${Math.round((finde / totalGastoMes) * 100)}% de tus gastos.`,
        });
    }

    // Comparación general de gasto
    if (gastosMesPrev.length) {
        const cambio = pctCambio(gastosMes, sum(gastosMesPrev, monto));
        if (cambio <= -5) {
            out.push({
                id: 'baja-gasto', tono: 'positivo',
                titulo: '¡Vas mejorando!',
                texto: `Este mes gastaste ${Math.abs(Math.round(cambio))}% menos que el mes anterior. Sigue así.`,
            });
        }
    }

    if (out.length === 0) {
        out.push({
            id: 'vacio', tono: 'neutro',
            titulo: 'Sigue registrando',
            texto: 'Registra más movimientos para desbloquear análisis e insights personalizados.',
        });
    }
    return out;
};

// money() local mínimo para insights (evita import circular con format)
const money = (n) =>
    new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(Number(n) || 0);

// ── Función principal ─────────────────────────────────────────
export const computeAnalytics = (transacciones = []) => {
    const txs = [...transacciones];
    const hoy = new Date();
    const iniMes = startOfMonth(hoy);
    const finMes = endOfMonth(hoy);
    const iniMesPrev = startOfMonth(subMonths(hoy, 1));
    const finMesPrev = endOfMonth(subMonths(hoy, 1));

    const enRango = (t, a, b) => isWithinInterval(fecha(t), { start: a, end: b });
    const txMes = txs.filter((t) => enRango(t, iniMes, finMes));
    const txMesPrev = txs.filter((t) => enRango(t, iniMesPrev, finMesPrev));

    const ingresosMes = sum(txMes.filter(esIngreso), monto);
    const gastosMes = sum(txMes.filter(esGasto), monto);
    const ingresosTotal = sum(txs.filter(esIngreso), monto);
    const gastosTotal = sum(txs.filter(esGasto), monto);
    const saldoTotal = ingresosTotal - gastosTotal;

    const gastosMesPrevArr = txMesPrev.filter(esGasto);
    const netoMesPrev = sum(txMesPrev, neto);
    const netoMes = ingresosMes - gastosMes;

    // Variación del patrimonio: neto acumulado hasta fin de mes vs fin de mes previo
    const acumHasta = (limite) => sum(txs.filter((t) => fecha(t) <= limite), neto);
    const patrimonioActual = acumHasta(hoy);
    const patrimonioPrev = acumHasta(finMesPrev);
    const variacionPatrimonioPct = pctCambio(patrimonioActual, patrimonioPrev);

    // Promedio diario de gasto (días transcurridos del mes)
    const diasTranscurridos = Math.max(1, differenceInCalendarDays(hoy, iniMes) + 1);
    const promedioDiario = gastosMes / diasTranscurridos;

    // Distribuciones
    const distMes = distribucion(txMes.filter(esGasto));
    const distTotal = distribucion(txs.filter(esGasto));
    const distribucionGastos = distMes.length ? distMes : distTotal;

    // ── Estadísticas automáticas ──
    const gastosMesList = txMes.filter(esGasto);
    const mayorGasto = gastosMesList.length
        ? gastosMesList.reduce((a, b) => (monto(b) > monto(a) ? b : a))
        : null;

    const categoriaDominante = distMes[0] || null;

    const comparacionMensualPct = pctCambio(gastosMes, sum(gastosMesPrevArr, monto));

    // Totales por día (del mes) para mejor/peor día
    const porDiaMes = {};
    for (const t of gastosMesList) {
        const k = keyDia(fecha(t));
        porDiaMes[k] = (porDiaMes[k] || 0) + monto(t);
    }
    const diasConGasto = Object.entries(porDiaMes);
    const diaMayorGasto = diasConGasto.length
        ? diasConGasto.reduce((a, b) => (b[1] > a[1] ? b : a))
        : null;
    const mejorDia = diasConGasto.length
        ? diasConGasto.reduce((a, b) => (b[1] < a[1] ? b : a))
        : null;

    // ── Mapa por día (para el calendario) ──
    const porDia = {};
    for (const t of txs) {
        const k = keyDia(fecha(t));
        porDia[k] ??= { ingresos: 0, gastos: 0, neto: 0 };
        if (esIngreso(t)) porDia[k].ingresos += monto(t);
        else porDia[k].gastos += monto(t);
        porDia[k].neto = porDia[k].ingresos - porDia[k].gastos;
    }

    // ── Sparklines (últimos 14 días) ──
    const spark = (dias, sel) => serieDiaria(txs, dias, sel);
    const sparkIngresos = spark(14, (g) => sum(g.filter(esIngreso), monto));
    const sparkGastos = spark(14, (g) => sum(g.filter(esGasto), monto));
    let acum = saldoTotal - sum(txs.filter((t) => fecha(t) > subDays(hoy, 14)), neto);
    const sparkAhorro = spark(14, (g) => { acum += sum(g, neto); return acum; });
    const sparkPromedio = sparkGastos;

    // ── Predicciones ──
    const ultimos3 = [0, 1, 2].map((i) => {
        const m = subMonths(hoy, i);
        const arr = txs.filter((t) => isSameMonth(fecha(t), m));
        return {
            gastos: sum(arr.filter(esGasto), monto),
            ingresos: sum(arr.filter(esIngreso), monto),
        };
    });
    const promGastos3 = sum(ultimos3, (x) => x.gastos) / 3;
    const promIngresos3 = sum(ultimos3, (x) => x.ingresos) / 3;
    const gastoEstimadoProx = promGastos3;
    const ahorroEstimadoProx = promIngresos3 - promGastos3;

    // Categoría que más crecerá: mayor alza vs mes previo
    const prevMap = {};
    for (const g of gastosMesPrevArr) {
        const l = getCategoria(g.categoria).label;
        prevMap[l] = (prevMap[l] || 0) + monto(g);
    }
    let categoriaCrece = null;
    for (const c of distMes) {
        const antes = prevMap[c.label] || 0;
        const cambio = pctCambio(c.total, antes);
        if (!categoriaCrece || cambio > categoriaCrece.cambio) {
            categoriaCrece = { label: c.label, cambio };
        }
    }

    const tasaAhorro = ingresosMes ? (netoMes / ingresosMes) * 100 : 0;
    const riesgo =
        gastosMes > ingresosMes ? { nivel: 'Alto', color: '#F43F5E' }
        : tasaAhorro < 10 ? { nivel: 'Medio', color: '#F59E0B' }
        : { nivel: 'Bajo', color: '#10B981' };

    const insights = construirInsights({
        gastosMes, gastosMesPrev: gastosMesPrevArr, distMes, txMes,
    });

    return {
        // Hero
        saldoTotal,
        variacionPatrimonioPct,
        // Tarjetas
        ingresosMes,
        gastosMes,
        ahorroAcumulado: saldoTotal,
        promedioDiario,
        variacionIngresosPct: pctCambio(ingresosMes, sum(txMesPrev.filter(esIngreso), monto)),
        variacionGastosPct: pctCambio(gastosMes, sum(gastosMesPrevArr, monto)),
        sparkIngresos, sparkGastos, sparkAhorro, sparkPromedio,
        netoMes, netoMesPrev,
        // Distribución
        distribucionGastos,
        // Estadísticas automáticas
        stats: {
            mayorGasto, categoriaDominante, comparacionMensualPct,
            promedioDiario, mejorDia, diaMayorGasto,
        },
        // Insights
        insights,
        // Calendario
        porDia,
        // Predicciones
        predicciones: {
            gastoEstimadoProx, ahorroEstimadoProx, categoriaCrece, riesgo, tasaAhorro,
        },
        // Conteo
        totalTransacciones: txs.length,
    };
};
