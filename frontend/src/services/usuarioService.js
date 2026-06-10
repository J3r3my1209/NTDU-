import { supabase } from '../lib/supabase.js';

/**
 * Actualiza el perfil del usuario autenticado.
 * El correo NO se edita aquí (es el identificador de la cuenta de Supabase Auth).
 * Devuelve los datos que la app fusiona en el usuario en contexto.
 */
export const actualizarPerfil = async ({ nombre, telefono, ciudad, pais }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay sesión activa.');

    const { data, error } = await supabase
        .from('perfiles')
        .update({ nombre, telefono, ciudad, pais })
        .eq('id', user.id)
        .select('id, nombre, correo, telefono, ciudad, pais')
        .single();

    if (error) throw new Error(error.message);

    return {
        nombre: data.nombre,
        email: data.correo,
        telefono: data.telefono || '',
        ciudad: data.ciudad || '',
        pais: data.pais || '',
    };
};
