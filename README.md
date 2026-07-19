# 💸 No Tan De Una (NTDU) — v3.0.0

Plataforma de gestión de gastos personales construida con **React + Vite** y
**Supabase** (Auth + Postgres + Row Level Security). No requiere servidor propio.

---

## Arquitectura

```
React (Vite)  ──>  Supabase
                   ├─ Auth      (registro / login / sesiones)
                   ├─ Postgres  (tablas profiles, gastos)
                   └─ RLS       (cada usuario solo ve sus datos; admin ve todo)
```

No hay backend Node propio: el frontend habla directo con Supabase usando la
`anon key` pública, y la seguridad la garantizan las políticas RLS de la base de datos.

---

## Puesta en marcha

### 1. Crear el proyecto en Supabase
1. Entra a [supabase.com](https://supabase.com) y crea un proyecto (gratis).
2. Ve a **SQL Editor**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y ejecútalo.
3. Ve a **Authentication → Providers → Email** y **desactiva "Confirm email"**
   (para que el registro entre directo sin confirmar correo).
4. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon` `public` key

### 2. Configurar y correr el frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edita .env con tu URL y tu anon key de Supabase
npm run dev
```
Abre http://localhost:5173

### 3. Crear el primer administrador
1. Regístrate normalmente desde la app.
2. En Supabase → **SQL Editor**, ejecuta (con tu correo):
   ```sql
   UPDATE public.profiles SET role = 'admin'
   WHERE email = 'tu-correo@ejemplo.com';
   ```
3. Cierra sesión y vuelve a entrar: ya verás el panel **⚡ Admin**.

---

## ⚙️ Variables de entorno (`frontend/.env`)
```
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-public-key>
```
> La `anon key` es **pública** por diseño; la seguridad real vive en las
> políticas RLS del `schema.sql`. Nunca pongas la `service_role` key en el frontend.

---

## Login con Google (OAuth)

El botón "Continuar con Google" usa el proveedor OAuth de Supabase. Para activarlo:

### 1. Crear credenciales en Google Cloud
1. Entra a [console.cloud.google.com](https://console.cloud.google.com) → crea un proyecto.
2. **APIs & Services → OAuth consent screen** → tipo *External* → completa nombre y correo.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** → tipo *Web application*.
4. En **Authorized redirect URIs** agrega la URL que te da Supabase (paso 2):
   `https://<tu-proyecto>.supabase.co/auth/v1/callback`
5. Copia el **Client ID** y el **Client Secret**.

### 2. Activar el proveedor en Supabase
1. Panel de Supabase → **Authentication → Providers → Google** → actívalo.
2. Pega el **Client ID** y **Client Secret** y guarda.
3. En **Authentication → URL Configuration → Redirect URLs** agrega tus orígenes:
   - `http://localhost:5173/dashboard`
   - `https://<tu-dominio-en-vercel>/dashboard`

### 3. Listo
Al pulsar "Continuar con Google": si el usuario existe inicia sesión, y si es nuevo
se crea su perfil automáticamente (nombre, correo y foto vienen de Google). La sesión
queda persistida y se registra el `ultimo_acceso`.

---

## Pagos con Stripe (Premium)

El upgrade a Premium ($3 USD, pago único) se cobra con **Stripe Checkout**,
usando dos Edge Functions de Supabase (no se agregó backend propio):

```
Frontend (Premium.jsx)
    │  1) invoca la función "stripe-create-checkout" (con su JWT)
    ▼
stripe-create-checkout  ──>  crea una Checkout Session en Stripe
    │  2) devuelve la URL de pago, el navegador redirige a Stripe
    ▼
Usuario paga en la página de Stripe
    │  3) Stripe llama al webhook cuando el pago se confirma
    ▼
stripe-webhook  ──>  verifica la firma y llama a activar_premium_stripe()
    │                (con la service_role key, ignora RLS)
    ▼
Postgres: perfiles.es_premium = true + fila nueva en compras
```

### 1. Obtener tus claves de prueba
1. En el [Dashboard de Stripe](https://dashboard.stripe.com/test/apikeys), con el
   switch en modo **Test**, copia la **Secret key** (`sk_test_...`).

### 2. Configurar los secrets de las Edge Functions
```bash
supabase login
supabase link --project-ref <tu-project-ref>

supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set SITE_URL=http://localhost:5173   # o tu dominio de Vercel
```
(`STRIPE_WEBHOOK_SECRET` se agrega en el paso 4, después de crear el webhook.)

### 3. Desplegar las funciones
```bash
supabase functions deploy stripe-create-checkout
supabase functions deploy stripe-webhook --no-verify-jwt
```

### 4. Crear el webhook en Stripe (modo prueba)
1. Ve a **Developers → Webhooks → Add endpoint** (con el switch en modo Test).
2. URL del endpoint:
   `https://<tu-proyecto>.supabase.co/functions/v1/stripe-webhook`
3. Evento a escuchar: `checkout.session.completed`.
4. Copia el **Signing secret** (`whsec_...`) que te da Stripe y configúralo:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 5. Probar en local (opcional)
Con el [Stripe CLI](https://docs.stripe.com/stripe-cli):
```bash
stripe login
stripe listen --forward-to https://<tu-proyecto>.supabase.co/functions/v1/stripe-webhook
```
Usa la tarjeta de prueba `4242 4242 4242 4242`, cualquier fecha futura y CVC.

### 6. Ejecutar el SQL actualizado
Vuelve a correr [`supabase/schema.sql`](supabase/schema.sql) en el SQL Editor:
agrega la columna `stripe_session_id` a `compras`, la función
`activar_premium_stripe()` (la única que puede activar Premium ahora) y le
revoca el permiso de ejecución directa a `comprar_premium()`, que era el
RPC "simulado" que usaba la versión anterior.

> El flujo anterior activaba Premium con un solo RPC llamado directo desde
> el navegador — cómodo para la demo, pero cualquier usuario logueado podía
> ejecutarlo desde la consola y obtener Premium gratis. Con Stripe, la
> activación solo ocurre en el webhook, firmado por Stripe y ejecutado con
> la `service_role` key, así que ya no es posible saltárselo desde el cliente.

---

## Modelo de datos

| Tabla | Descripción |
|-------|-------------|
| `auth.users` | Gestionada por Supabase Auth (credenciales) |
| `profiles` | Datos del usuario: `nombre`, `email`, `role`, `foto_perfil` (1-a-1 con `auth.users`) |
| `gastos` | Transacciones: `descripcion`, `monto`, `tipo`, `cuenta`, `categoria` |

Al registrarse, un **trigger** crea automáticamente la fila en `profiles`.

---

## Seguridad (RLS)

| Regla | Detalle |
|-------|---------|
| Datos propios | Cada usuario solo lee/escribe sus `gastos` y su `profile` |
| Rol admin | La función `is_admin()` permite a los admin ver/gestionar todo |
| Roles | `user` (por defecto) y `admin` |

---

## Funcionalidades
- Registro / login / recuperación de contraseña (Supabase Auth)
- Registrar ingresos y gastos, con categorías y cuentas
- Balance en tiempo real y análisis por categoría
- Exportar transacciones a CSV (se abre en Excel)
- Panel de administrador: usuarios, roles y estadísticas globales

---

## Despliegue (Vercel)
El frontend es estático. En Vercel:
1. Importa el repo, **Root Directory = `frontend`**.
2. Agrega las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Deploy. El archivo `vercel.json` ya maneja el routing de la SPA.

---

Desarrollado por Fabara, Vivas & Perugachi — Proyecto académico.
=======
No Tan De Una

No Tan De Una es una aplicación inteligente de gestión financiera personal diseñada para ayudarte a tomar el control de tu dinero de forma simple, rápida y visual.

Registra tus ingresos y gastos, organiza tus movimientos por categorías y obtén estadísticas en tiempo real para entender exactamente en qué se está yendo tu dinero. Gracias a sus gráficos interactivos, análisis financieros y reportes detallados, podrás identificar hábitos de consumo, mejorar tu capacidad de ahorro y tomar mejores decisiones financieras.

La aplicación combina una experiencia moderna, intuitiva y accesible con herramientas avanzadas de análisis, permitiendo que cualquier persona, sin importar sus conocimientos financieros, pueda administrar sus finanzas de manera eficiente.

Características principales
Registro de ingresos y gastos.
Balance financiero en tiempo real.
Estadísticas y gráficos interactivos.
Organización por categorías.
Historial completo de transacciones.
Exportación de reportes.
Metas de ahorro.
Análisis inteligente de gastos.
Acceso desde computadora, Android y iPhone.
Diseño moderno y fácil de usar.
Versión Premium

Por un único pago de $3 USD de por vida, desbloquea funciones avanzadas como análisis inteligentes, predicciones financieras, reportes detallados, exportaciones avanzadas y herramientas exclusivas para mejorar el control de tus finanzas.

No Tan De Una nace con un objetivo claro: ayudarte a entender tu dinero, mejorar tus hábitos financieros y tomar decisiones más inteligentes para alcanzar tus metas económicas.
>>>>>>> 5f9141c2c1d9e6ac7d1bb7a70a57309df0e04996
