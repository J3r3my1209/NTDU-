import { supabase } from '../lib/supabase.js';
import { getCategoria } from '../lib/categories.js';

/**
 * Capa de servicios de transacciones sobre Supabase.
 * Mapea las filas de la tabla `gastos` a la forma que usa la UI:
 *   { _id, descripcion, monto, tipo, cuenta, categoria, createdAt }
 */

const mapFila = (row) => ({
    _id: row.id,
    descripcion: row.descripcion,
    monto: Number(row.monto),
    tipo: row.tipo,
    cuenta: row.cuenta,
    categoria: row.categoria,
    createdAt: row.creado_en
});

const usuarioActualId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay sesión activa.');
    return user.id;
};

// Nota: las columnas usuario_id / creado_en de la tabla `gastos` están en español.

export const obtenerGastosAPI = async () => {
    const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .order('creado_en', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapFila);
};

export const crearGastoAPI = async (datosFormulario) => {
    const user_id = await usuarioActualId();

    const { data, error } = await supabase
        .from('gastos')
        .insert({
            usuario_id: user_id,
            descripcion: datosFormulario.descripcion,
            monto: Number(datosFormulario.monto),
            tipo: datosFormulario.tipo || 'Gasto',
            cuenta: datosFormulario.cuenta || 'Efectivo',
            categoria: datosFormulario.categoria || 'Otros'
        })
        .select()
        .single();

    if (error) throw error;
    return mapFila(data);
};

export const actualizarGastoAPI = async (id, gastoData) => {
    const payload = {};
    ['descripcion', 'tipo', 'cuenta', 'categoria'].forEach(k => {
        if (gastoData[k] !== undefined) payload[k] = gastoData[k];
    });
    if (gastoData.monto !== undefined) payload.monto = Number(gastoData.monto);

    const { data, error } = await supabase
        .from('gastos')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return mapFila(data);
};

export const eliminarGastoAPI = async (id) => {
    const { error } = await supabase.from('gastos').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
};

const money = (n) => '$' + (Number(n) || 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fechaTxt = (d) => (d ? new Date(d).toLocaleDateString('es-EC') : '');
const hexToRgb = (hex) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

// Agrupa gastos por categoría (para los gráficos de los reportes).
const distribucionGastos = (transacciones) => {
    const map = {};
    for (const t of transacciones) {
        if (t.tipo !== 'Gasto') continue;
        const meta = getCategoria(t.categoria);
        map[meta.label] ??= { label: meta.label, color: meta.color, total: 0 };
        map[meta.label].total += Number(t.monto || 0);
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
};

/**
 * Exporta a Excel (.xls). Genera una tabla HTML con estilos que Excel abre como
 * una hoja con formato (cabeceras de color, filas alternadas, montos coloreados).
 */
export const exportarTransaccionesExcel = async (lista) => {
    const transacciones = lista || (await obtenerGastosAPI());
    const ingresos = transacciones.filter((t) => t.tipo === 'Ingreso').reduce((s, t) => s + Number(t.monto || 0), 0);
    const gastos = transacciones.filter((t) => t.tipo === 'Gasto').reduce((s, t) => s + Number(t.monto || 0), 0);

    const th = 'background:#047857;color:#fff;font-weight:bold;padding:8px 10px;border:1px solid #cbd5e1;text-align:center;';
    const td = 'padding:6px 10px;border:1px solid #e2e8f0;';

    const filas = transacciones.map((t, i) => {
        const bg = i % 2 ? 'background:#f8fafc;' : '';
        const colorMonto = t.tipo === 'Gasto' ? '#dc2626' : '#16a34a';
        return `<tr>
            <td style="${td}${bg}">${escHtml(t.descripcion)}</td>
            <td style="${td}${bg}text-align:center;">${escHtml(t.tipo)}</td>
            <td style="${td}${bg}">${escHtml(t.cuenta)}</td>
            <td style="${td}${bg}">${escHtml(t.categoria)}</td>
            <td style="${td}${bg}color:${colorMonto};font-weight:bold;text-align:right;">${t.tipo === 'Gasto' ? '-' : '+'}${money(t.monto)}</td>
            <td style="${td}${bg}text-align:center;">${fechaTxt(t.createdAt)}</td>
        </tr>`;
    }).join('');

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="utf-8"></head>
        <body>
        <table style="border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:13px;">
            <tr><td colspan="6" style="font-size:18px;font-weight:bold;color:#0f172a;padding:8px 0;">No Tan De Una — Reporte financiero</td></tr>
            <tr><td colspan="6" style="color:#64748b;padding-bottom:6px;">Generado: ${new Date().toLocaleString('es-EC')}</td></tr>
            <tr>
                <td colspan="2" style="${td}background:#ecfdf5;color:#16a34a;font-weight:bold;">Ingresos: ${money(ingresos)}</td>
                <td colspan="2" style="${td}background:#fef2f2;color:#dc2626;font-weight:bold;">Gastos: ${money(gastos)}</td>
                <td colspan="2" style="${td}background:#eff6ff;color:#2563eb;font-weight:bold;">Saldo: ${money(ingresos - gastos)}</td>
            </tr>
            <tr><td colspan="6" style="height:8px;"></td></tr>
            <tr>
                <td style="${th}">Descripción</td><td style="${th}">Tipo</td><td style="${th}">Cuenta</td>
                <td style="${th}">Categoría</td><td style="${th}">Monto</td><td style="${th}">Fecha</td>
            </tr>
            ${filas}
        </table>
        </body></html>`;

    return new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
};

const escHtml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Exporta a PDF (premium): resumen, gráfico de barras por categoría y tabla.
 * Usa jsPDF con carga diferida.
 */
export const exportarTransaccionesPDF = async (lista) => {
    const transacciones = lista || (await obtenerGastosAPI());
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 52;

    // Encabezado
    doc.setFillColor(10, 11, 13); doc.rect(0, 0, 595, 76, 'F');
    doc.setTextColor(255); doc.setFontSize(18);
    doc.text('No Tan De Una', 40, 40);
    doc.setFontSize(10); doc.setTextColor(0, 229, 106);
    doc.text('Reporte financiero', 40, 58);
    doc.setTextColor(180); doc.setFontSize(9);
    doc.text(new Date().toLocaleString('es-EC'), 555, 40, { align: 'right' });
    y = 104;

    // Tarjetas de resumen
    const ingresos = transacciones.filter((t) => t.tipo === 'Ingreso').reduce((s, t) => s + Number(t.monto || 0), 0);
    const gastos = transacciones.filter((t) => t.tipo === 'Gasto').reduce((s, t) => s + Number(t.monto || 0), 0);
    const tarjetas = [
        ['Ingresos', money(ingresos), [22, 163, 74]],
        ['Gastos', money(gastos), [220, 38, 38]],
        ['Saldo', money(ingresos - gastos), [37, 99, 235]],
    ];
    tarjetas.forEach(([label, val, rgb], i) => {
        const x = 40 + i * 172;
        doc.setFillColor(248, 250, 252); doc.roundedRect(x, y, 160, 52, 6, 6, 'F');
        doc.setTextColor(120); doc.setFontSize(9); doc.text(label, x + 12, y + 20);
        doc.setTextColor(rgb[0], rgb[1], rgb[2]); doc.setFontSize(15); doc.text(val, x + 12, y + 40);
    });
    y += 84;

    // Gráfico de barras por categoría
    const dist = distribucionGastos(transacciones).slice(0, 6);
    if (dist.length) {
        doc.setTextColor(17, 19, 23); doc.setFontSize(13);
        doc.text('Distribución de gastos por categoría', 40, y); y += 18;
        const max = dist[0].total || 1;
        const barW = 360;
        dist.forEach((c) => {
            const [r, g, b] = hexToRgb(c.color);
            doc.setTextColor(60); doc.setFontSize(9);
            doc.text(c.label, 40, y + 9);
            doc.setFillColor(238, 240, 243); doc.roundedRect(150, y, barW, 12, 3, 3, 'F');
            doc.setFillColor(r, g, b); doc.roundedRect(150, y, Math.max(4, (c.total / max) * barW), 12, 3, 3, 'F');
            doc.setTextColor(40); doc.text(money(c.total), 150 + barW + 8, y + 9);
            y += 22;
        });
        y += 12;
    }

    // Tabla de transacciones
    const header = () => {
        doc.setFillColor(4, 120, 87); doc.rect(40, y - 12, 515, 20, 'F');
        doc.setTextColor(255); doc.setFontSize(9);
        [['Descripción', 46], ['Tipo', 240], ['Categoría', 300], ['Monto', 410], ['Fecha', 495]].forEach(([t, x]) => doc.text(t, x, y + 2));
        y += 22;
    };
    doc.setTextColor(17, 19, 23); doc.setFontSize(13);
    doc.text('Detalle de transacciones', 40, y); y += 22;
    header();

    doc.setFontSize(9);
    transacciones.forEach((t, i) => {
        if (y > 800) { doc.addPage(); y = 52; header(); }
        if (i % 2) { doc.setFillColor(248, 250, 252); doc.rect(40, y - 10, 515, 16, 'F'); }
        doc.setTextColor(40);
        doc.text(String(t.descripcion || '').slice(0, 32), 46, y);
        doc.text(String(t.tipo || ''), 240, y);
        doc.text(String(t.categoria || '').slice(0, 16), 300, y);
        const [r, g, b] = t.tipo === 'Gasto' ? [220, 38, 38] : [22, 163, 74];
        doc.setTextColor(r, g, b);
        doc.text(`${t.tipo === 'Gasto' ? '-' : '+'}${money(t.monto)}`, 410, y);
        doc.setTextColor(120);
        doc.text(fechaTxt(t.createdAt), 495, y);
        y += 16;
    });

    return doc.output('blob');
};
