import { supabase } from '../lib/supabase.js';
import { subMonths, isSameMonth, format, subDays } from 'date-fns';

/**
 * Servicios de administración sobre Supabase.
 * El acceso global lo permite la política RLS `es_admin()` del schema.
 */
export const adminService = {
    // Lista todos los usuarios (perfiles) con su estado premium/bloqueo.
    listarUsuarios: async () => {
        const { data, error } = await supabase
            .from('perfiles')
            .select('id, nombre, correo, rol, es_premium, premium_desde, bloqueado, creado_en, ultimo_acceso')
            .order('creado_en', { ascending: false });
        if (error) throw error;

        const usuarios = (data || []).map((u) => ({
            _id: u.id,
            nombre: u.nombre,
            email: u.correo,
            role: u.rol,
            esPremium: u.es_premium,
            premiumDesde: u.premium_desde,
            bloqueado: u.bloqueado,
            createdAt: u.creado_en,
            ultimoAcceso: u.ultimo_acceso,
        }));
        return { ok: true, total: usuarios.length, usuarios };
    },

    cambiarRol: async (id, role) => {
        const { error } = await supabase.from('perfiles').update({ rol: role }).eq('id', id);
        if (error) throw error;
        return { ok: true };
    },

    darPremium: async (id) => {
        const { error } = await supabase.from('perfiles')
            .update({ es_premium: true, premium_desde: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
        return { ok: true };
    },

    quitarPremium: async (id) => {
        const { error } = await supabase.from('perfiles')
            .update({ es_premium: false, premium_desde: null }).eq('id', id);
        if (error) throw error;
        return { ok: true };
    },

    bloquear: async (id, bloqueado) => {
        const { error } = await supabase.from('perfiles').update({ bloqueado }).eq('id', id);
        if (error) throw error;
        return { ok: true };
    },

    eliminarUsuario: async (id) => {
        // Borra datos del usuario (el login en auth.users requiere service_role).
        await supabase.from('gastos').delete().eq('usuario_id', id);
        await supabase.from('metas').delete().eq('usuario_id', id);
        await supabase.from('compras').delete().eq('usuario_id', id);
        const { error } = await supabase.from('perfiles').delete().eq('id', id);
        if (error) throw error;
        return { ok: true };
    },

    // Estadísticas globales para el panel de administración.
    estadisticas: async () => {
        const [perfilesRes, comprasRes, gastosRes] = await Promise.all([
            supabase.from('perfiles').select('rol, es_premium, creado_en, ultimo_acceso'),
            supabase.from('compras').select('monto, creado_en'),
            supabase.from('gastos').select('tipo, monto, categoria'),
        ]);
        if (perfilesRes.error) throw perfilesRes.error;

        const perfiles = perfilesRes.data || [];
        const compras = comprasRes.data || [];
        const gastos = gastosRes.data || [];
        const hace30 = subDays(new Date(), 30);

        // Usuarios
        const totalUsuarios = perfiles.length;
        const premium = perfiles.filter((p) => p.es_premium).length;
        const gratuitos = totalUsuarios - premium;
        const nuevos30 = perfiles.filter((p) => new Date(p.creado_en) >= hace30).length;
        const activos30 = perfiles.filter((p) => p.ultimo_acceso && new Date(p.ultimo_acceso) >= hace30).length;

        // Registros por mes (últimos 6)
        const serieRegistros = [];
        for (let i = 5; i >= 0; i--) {
            const m = subMonths(new Date(), i);
            serieRegistros.push({
                label: format(m, 'LLL'),
                total: perfiles.filter((p) => isSameMonth(new Date(p.creado_en), m)).length,
            });
        }

        // Ingresos Premium
        const totalCompras = compras.length;
        const ingresosPremium = compras.reduce((s, c) => s + Number(c.monto), 0);
        const promedioIngreso = totalCompras ? ingresosPremium / totalCompras : 0;
        const serieVentas = [];
        for (let i = 5; i >= 0; i--) {
            const m = subMonths(new Date(), i);
            serieVentas.push({
                label: format(m, 'LLL'),
                total: compras.filter((c) => isSameMonth(new Date(c.creado_en), m)).reduce((s, c) => s + Number(c.monto), 0),
            });
        }

        // Plataforma
        const porTipo = {};
        const porCategoria = {};
        for (const g of gastos) {
            porTipo[g.tipo] ??= { _id: g.tipo, total: 0, cantidad: 0 };
            porTipo[g.tipo].total += Number(g.monto);
            porTipo[g.tipo].cantidad += 1;
            porCategoria[g.categoria] ??= { _id: g.categoria, total: 0, cantidad: 0 };
            porCategoria[g.categoria].total += Number(g.monto);
            porCategoria[g.categoria].cantidad += 1;
        }
        const topCategorias = Object.values(porCategoria).sort((a, b) => b.cantidad - a.cantidad).slice(0, 8);
        const totalIngresosRegistrados = porTipo['Ingreso']?.total || 0;
        const totalGastosRegistrados = porTipo['Gasto']?.total || 0;

        return {
            ok: true,
            estadisticas: {
                totalUsuarios, gratuitos, premium, nuevos30, activos30,
                totalCompras, ingresosPremium, promedioIngreso,
                serieRegistros, serieVentas,
                totalTransacciones: gastos.length,
                totalIngresosRegistrados, totalGastosRegistrados,
                topCategorias,
                resumenPorTipo: Object.values(porTipo),
            },
        };
    },
};
