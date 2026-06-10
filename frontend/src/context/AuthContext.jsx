import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

/**
 * Construye el objeto `usuario` que usa la app a partir de la sesión de
 * Supabase Auth + su fila en la tabla `profiles`.
 * Mantiene la forma { id, nombre, email, role, fotoPerfil } que esperan
 * los componentes (Navbar, Dashboard, Profile, etc.).
 */
const construirUsuario = async (authUser) => {
    if (!authUser) return null;

    const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre, rol, foto_perfil, telefono, ciudad, pais, es_premium, premium_desde, bloqueado')
        .eq('id', authUser.id)
        .single();

    const meta = authUser.user_metadata || {};

    return {
        id: authUser.id,
        email: authUser.email,
        nombre: perfil?.nombre || meta.nombre || meta.full_name || meta.name || '',
        role: perfil?.rol || 'usuario',
        fotoPerfil: perfil?.foto_perfil || meta.avatar_url || meta.picture || null,
        telefono: perfil?.telefono || '',
        ciudad: perfil?.ciudad || '',
        pais: perfil?.pais || '',
        esPremium: perfil?.es_premium || false,
        premiumDesde: perfil?.premium_desde || null,
        bloqueado: perfil?.bloqueado || false,
    };
};

// Usuario "básico" inmediato desde la sesión (sin consultar la BD).
const usuarioBasico = (authUser) => {
    const meta = authUser.user_metadata || {};
    return {
        id: authUser.id,
        email: authUser.email,
        nombre: meta.nombre || meta.full_name || meta.name || '',
        role: 'usuario',
        fotoPerfil: meta.avatar_url || meta.picture || null,
        telefono: '',
        ciudad: '',
        pais: '',
        esPremium: false,
        premiumDesde: null,
        bloqueado: false,
    };
};

// Registra el último acceso (fire-and-forget, no bloquea el login).
const registrarAcceso = (id) => {
    supabase.from('perfiles').update({ ultimo_acceso: new Date().toISOString() }).eq('id', id).then(() => {});
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);            // { id, nombre, email, role, fotoPerfil }
    const [token, setToken] = useState(null);          // access_token de Supabase
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Al montar: restaurar sesión y escuchar cambios de auth
    useEffect(() => {
        let activo = true;

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!activo) return;
            aplicarSesion(session);
            setLoading(false);
        };
        init();

        // IMPORTANTE: este callback NO debe hacer `await` de llamadas a Supabase
        // (deadlock con el lock de auth). Solo fijamos la sesión y diferimos
        // cualquier consulta a la BD con setTimeout(0).
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (evento, session) => {
                if (!activo) return;
                aplicarSesion(session);
                if (evento === 'SIGNED_IN' && session?.user) {
                    setTimeout(() => registrarAcceso(session.user.id), 0);
                }
            }
        );

        return () => {
            activo = false;
            subscription?.unsubscribe();
        };
    }, []);

    // Fija la sesión al instante (síncrono) y enriquece el perfil sin bloquear.
    const aplicarSesion = (session) => {
        if (session?.user) {
            setToken(session.access_token);
            setIsAuthenticated(true);
            setUser((prev) => (prev?.id === session.user.id ? prev : usuarioBasico(session.user)));
            // Carga el perfil real (rol, nombre, foto) fuera del lock de auth.
            setTimeout(() => {
                construirUsuario(session.user).then((u) => { if (u) setUser(u); }).catch(() => {});
            }, 0);
        } else {
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
        }
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(traducirError(error.message));

        const usuario = await construirUsuario(data.user);
        setUser(usuario);
        setToken(data.session?.access_token || null);
        setIsAuthenticated(true);
        return usuario;
    };

    const registro = async (nombre, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { nombre } }
        });
        if (error) throw new Error(traducirError(error.message));

        // Si "Confirm email" está desactivado en Supabase, ya hay sesión.
        if (!data.session) {
            throw new Error(
                'Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.'
            );
        }

        const usuario = await construirUsuario(data.user);
        setUser(usuario);
        setToken(data.session.access_token);
        setIsAuthenticated(true);
        return usuario;
    };

    const loginConGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
                queryParams: { access_type: 'offline', prompt: 'select_account' },
            },
        });
        if (error) throw new Error(traducirError(error.message));
        // El navegador se redirige a Google; la sesión se aplica al volver.
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    };

    const actualizarUsuario = (nuevosDatos) => {
        setUser(prev => ({ ...prev, ...nuevosDatos }));
    };

    // Vuelve a leer el perfil desde la BD (tras comprar premium, etc.)
    const refrescarUsuario = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            const u = await construirUsuario(authUser);
            if (u) setUser(u);
            return u;
        }
        return null;
    };

    // Checkout simulado: activa Premium para siempre y registra la compra.
    const comprarPremium = async () => {
        const { error } = await supabase.rpc('comprar_premium');
        if (error) throw new Error(error.message);
        return refrescarUsuario();
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            role: user?.role || null,
            esPremium: user?.esPremium || false,
            bloqueado: user?.bloqueado || false,
            isAuthenticated,
            loading,
            login,
            registro,
            loginConGoogle,
            logout,
            actualizarUsuario,
            refrescarUsuario,
            comprarPremium
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Traduce los mensajes de error más comunes de Supabase Auth.
const traducirError = (msg = '') => {
    const m = msg.toLowerCase();
    if (m.includes('invalid login credentials')) return 'Credenciales incorrectas.';
    if (m.includes('user already registered')) return 'Ya existe una cuenta con ese correo.';
    if (m.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (m.includes('email not confirmed')) return 'Debes confirmar tu correo antes de iniciar sesión.';
    return msg || 'Ocurrió un error. Intenta de nuevo.';
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
};

export default AuthContext;
