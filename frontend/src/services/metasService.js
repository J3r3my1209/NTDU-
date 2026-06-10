import { supabase } from '../lib/supabase.js';

/**
 * Servicio de metas de ahorro sobre Supabase.
 * Mapea las filas a: { id, titulo, montoObjetivo, montoActual, fechaLimite, creadoEn }
 */
const map = (r) => ({
    id: r.id,
    titulo: r.titulo,
    montoObjetivo: Number(r.monto_objetivo),
    montoActual: Number(r.monto_actual),
    fechaLimite: r.fecha_limite,
    creadoEn: r.creado_en,
});

const usuarioId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay sesión activa.');
    return user.id;
};

export const obtenerMetas = async () => {
    const { data, error } = await supabase
        .from('metas')
        .select('*')
        .order('creado_en', { ascending: false });
    if (error) throw error;
    return (data || []).map(map);
};

export const crearMeta = async ({ titulo, montoObjetivo, montoActual = 0, fechaLimite = null }) => {
    const usuario_id = await usuarioId();
    const { data, error } = await supabase
        .from('metas')
        .insert({
            usuario_id,
            titulo,
            monto_objetivo: Number(montoObjetivo),
            monto_actual: Number(montoActual) || 0,
            fecha_limite: fechaLimite || null,
        })
        .select()
        .single();
    if (error) throw error;
    return map(data);
};

export const actualizarMeta = async (id, cambios) => {
    const payload = {};
    if (cambios.titulo !== undefined) payload.titulo = cambios.titulo;
    if (cambios.montoObjetivo !== undefined) payload.monto_objetivo = Number(cambios.montoObjetivo);
    if (cambios.montoActual !== undefined) payload.monto_actual = Number(cambios.montoActual);
    if (cambios.fechaLimite !== undefined) payload.fecha_limite = cambios.fechaLimite || null;

    const { data, error } = await supabase
        .from('metas').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return map(data);
};

export const eliminarMeta = async (id) => {
    const { error } = await supabase.from('metas').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
};
