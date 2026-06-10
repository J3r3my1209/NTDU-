-- ============================================================
--  No Tan De Una (NTDU) — Esquema para Supabase (Auth + Postgres)
--  Versión: 3.0.0  ·  Todo en español
--
--  Cómo usarlo:
--    1) Crea un proyecto en https://supabase.com
--    2) Abre el "SQL Editor" y pega TODO este archivo
--    3) Ejecuta (Run)
--    4) En Authentication → Providers → Email, DESACTIVA
--       "Confirm email" para que el registro entre directo.
--
--  La autenticación la maneja Supabase Auth (tabla auth.users).
--  Aquí solo creamos las tablas de la app y las políticas de seguridad.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- TABLA: perfiles  (datos públicos del usuario, 1-a-1 con auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.perfiles (
    id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre        TEXT NOT NULL DEFAULT '',
    correo        TEXT,
    rol           TEXT NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
    foto_perfil   TEXT,
    telefono      TEXT,
    ciudad        TEXT,
    pais          TEXT,
    es_premium    BOOLEAN NOT NULL DEFAULT FALSE,           -- plan Premium (pago único)
    premium_desde TIMESTAMPTZ,                              -- fecha de activación Premium
    bloqueado     BOOLEAN NOT NULL DEFAULT FALSE,           -- cuenta bloqueada por admin
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),       -- fecha de registro
    ultimo_acceso TIMESTAMPTZ,                              -- último inicio de sesión
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfiles_rol ON public.perfiles(rol);

-- Por si la tabla ya existía de una versión anterior (CREATE TABLE IF NOT EXISTS
-- no agrega columnas nuevas a una tabla existente):
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS foto_perfil   TEXT;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS ultimo_acceso TIMESTAMPTZ;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS es_premium    BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS premium_desde TIMESTAMPTZ;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS bloqueado     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS telefono      TEXT;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS ciudad        TEXT;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS pais          TEXT;

-- ─────────────────────────────────────────────────────────────
-- TABLA: gastos  (transacciones: gastos e ingresos)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gastos (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descripcion   TEXT NOT NULL,
    monto         NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    tipo          TEXT NOT NULL CHECK (tipo IN ('Ingreso', 'Gasto')),
    cuenta        TEXT NOT NULL DEFAULT 'Efectivo'
                  CHECK (cuenta IN ('Efectivo', 'Banco', 'Tarjeta')),
    categoria     TEXT NOT NULL DEFAULT 'Otros',
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gastos_usuario_id ON public.gastos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_gastos_creado_en  ON public.gastos(creado_en DESC);

-- ─────────────────────────────────────────────────────────────
-- TABLA: metas  (metas de ahorro del usuario)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.metas (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo         TEXT NOT NULL,
    monto_objetivo NUMERIC(12, 2) NOT NULL CHECK (monto_objetivo > 0),
    monto_actual   NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (monto_actual >= 0),
    fecha_limite   DATE,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metas_usuario_id ON public.metas(usuario_id);

-- ─────────────────────────────────────────────────────────────
-- TABLA: compras  (pagos únicos de Premium — para estadísticas de ingresos)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.compras (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    monto       NUMERIC(12, 2) NOT NULL DEFAULT 3.00,
    metodo      TEXT NOT NULL DEFAULT 'simulado',
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_usuario_id ON public.compras(usuario_id);

-- ─────────────────────────────────────────────────────────────
-- FUNCIÓN: actualizar la columna actualizado_en automáticamente
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.actualizar_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_perfiles_actualizado ON public.perfiles;
CREATE TRIGGER trg_perfiles_actualizado
    BEFORE UPDATE ON public.perfiles
    FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

DROP TRIGGER IF EXISTS trg_gastos_actualizado ON public.gastos;
CREATE TRIGGER trg_gastos_actualizado
    BEFORE UPDATE ON public.gastos
    FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

DROP TRIGGER IF EXISTS trg_metas_actualizado ON public.metas;
CREATE TRIGGER trg_metas_actualizado
    BEFORE UPDATE ON public.metas
    FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

-- ─────────────────────────────────────────────────────────────
-- FUNCIÓN + TRIGGER: crear un perfil automáticamente al registrarse
-- (se ejecuta cuando Supabase Auth inserta en auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.manejar_nuevo_usuario()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    -- nombre y foto pueden venir de registro normal ('nombre') o de Google
    -- ('full_name'/'name' y 'avatar_url'/'picture').
    INSERT INTO public.perfiles (id, nombre, correo, rol, foto_perfil, ultimo_acceso)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'nombre',
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            ''
        ),
        NEW.email,
        'usuario',
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture'
        ),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS al_crear_usuario ON auth.users;
CREATE TRIGGER al_crear_usuario
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.manejar_nuevo_usuario();

-- ─────────────────────────────────────────────────────────────
-- FUNCIÓN: es_admin()  — ¿el usuario actual es admin?
-- SECURITY DEFINER evita recursión infinita en las políticas RLS.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id = auth.uid() AND rol = 'admin'
    );
$$;

-- ─────────────────────────────────────────────────────────────
-- FUNCIÓN: comprar_premium()  — activa Premium (pago único) y registra la compra
-- Se llama desde el checkout. Atómica y registra el ingreso para el admin.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.comprar_premium()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.compras (usuario_id, monto, metodo)
    VALUES (auth.uid(), 3.00, 'simulado');

    UPDATE public.perfiles
    SET es_premium = TRUE,
        premium_desde = COALESCE(premium_desde, NOW())
    WHERE id = auth.uid();
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- SEGURIDAD A NIVEL DE FILA (RLS)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras  ENABLE ROW LEVEL SECURITY;

-- ── perfiles ──
-- Cada usuario ve/edita su propio perfil; los admin ven/editan todos.
DROP POLICY IF EXISTS perfiles_seleccionar ON public.perfiles;
CREATE POLICY perfiles_seleccionar ON public.perfiles
    FOR SELECT USING (id = auth.uid() OR public.es_admin());

DROP POLICY IF EXISTS perfiles_insertar ON public.perfiles;
CREATE POLICY perfiles_insertar ON public.perfiles
    FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS perfiles_actualizar ON public.perfiles;
CREATE POLICY perfiles_actualizar ON public.perfiles
    FOR UPDATE USING (id = auth.uid() OR public.es_admin());

DROP POLICY IF EXISTS perfiles_eliminar ON public.perfiles;
CREATE POLICY perfiles_eliminar ON public.perfiles
    FOR DELETE USING (public.es_admin());

-- ── gastos ──
-- Cada usuario maneja sus propias transacciones; los admin pueden leerlas/borrarlas.
DROP POLICY IF EXISTS gastos_seleccionar ON public.gastos;
CREATE POLICY gastos_seleccionar ON public.gastos
    FOR SELECT USING (usuario_id = auth.uid() OR public.es_admin());

DROP POLICY IF EXISTS gastos_insertar ON public.gastos;
CREATE POLICY gastos_insertar ON public.gastos
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS gastos_actualizar ON public.gastos;
CREATE POLICY gastos_actualizar ON public.gastos
    FOR UPDATE USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS gastos_eliminar ON public.gastos;
CREATE POLICY gastos_eliminar ON public.gastos
    FOR DELETE USING (usuario_id = auth.uid() OR public.es_admin());

-- ── metas ──
-- Cada usuario maneja únicamente sus propias metas de ahorro.
DROP POLICY IF EXISTS metas_seleccionar ON public.metas;
CREATE POLICY metas_seleccionar ON public.metas
    FOR SELECT USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS metas_insertar ON public.metas;
CREATE POLICY metas_insertar ON public.metas
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS metas_actualizar ON public.metas;
CREATE POLICY metas_actualizar ON public.metas
    FOR UPDATE USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS metas_eliminar ON public.metas;
CREATE POLICY metas_eliminar ON public.metas
    FOR DELETE USING (usuario_id = auth.uid());

-- ── compras ──
-- El usuario ve/crea sus propias compras; el admin las ve todas (estadísticas).
DROP POLICY IF EXISTS compras_seleccionar ON public.compras;
CREATE POLICY compras_seleccionar ON public.compras
    FOR SELECT USING (usuario_id = auth.uid() OR public.es_admin());

DROP POLICY IF EXISTS compras_insertar ON public.compras;
CREATE POLICY compras_insertar ON public.compras
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- ¿Cómo crear tu primer ADMIN?
-- 1) Regístrate normalmente desde la app.
-- 2) Vuelve aquí (SQL Editor) y ejecuta, con tu correo:
--      UPDATE public.perfiles SET rol = 'admin'
--      WHERE correo = 'tu-correo@ejemplo.com';
-- ─────────────────────────────────────────────────────────────
