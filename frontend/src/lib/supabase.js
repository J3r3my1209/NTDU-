import { createClient } from '@supabase/supabase-js';

/**
 * Configuración de Supabase
 * Las credenciales se cargan desde variables de entorno.
 * Agrega tus claves en el archivo .env:
 *
 *   VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<tu-anon-key>
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ Supabase: Variables de entorno no configuradas.\n' +
        'Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'
    );
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            // Mantiene la sesión tras cerrar el navegador/app y la refresca sola.
            persistSession: true,
            autoRefreshToken: true,
            // Procesa el token que devuelve Google OAuth en la URL al volver.
            detectSessionInUrl: true,
            flowType: 'pkce',
        },
    })
    : null;

export default supabase;
