// supabase/functions/stripe-create-checkout/index.ts
//
// Crea una sesión de Stripe Checkout (pago único, modo prueba/producción
// según la clave que configures) para desbloquear Premium.
//
// Requiere que el usuario esté autenticado: Supabase valida el JWT
// automáticamente porque verify_jwt = true en config.toml, y aquí además
// usamos ese JWT para saber QUIÉN está comprando.
//
// Variables de entorno necesarias (Supabase → Project Settings → Edge
// Functions → Secrets, o `supabase secrets set`):
//   STRIPE_SECRET_KEY   -> sk_test_... (modo prueba) o sk_live_...
//   SUPABASE_URL        -> ya la inyecta Supabase automáticamente
//   SUPABASE_ANON_KEY   -> ya la inyecta Supabase automáticamente

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.7.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
// URL pública de tu frontend (Vercel en producción, localhost en desarrollo).
// Configúrala como secret; si no existe, usamos el header Origin de la request.
const SITE_URL = Deno.env.get("SITE_URL") ?? "";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";

    // Cliente "de usuario": usa el JWT que llega en el header para saber
    // quién hace la petición (respeta RLS).
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "No autenticado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Evita crear una sesión de pago si el usuario ya es Premium.
    const { data: perfil } = await supabaseUser
      .from("perfiles")
      .select("es_premium")
      .eq("id", user.id)
      .single();

    if (perfil?.es_premium) {
      return new Response(JSON.stringify({ error: "Ya tienes Premium activo." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const origin = SITE_URL || req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "No Tan De Una — Premium",
              description: "Acceso de por vida a las funciones avanzadas.",
            },
            unit_amount: 300, // $3.00 USD, en centavos
          },
          quantity: 1,
        },
      ],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: {
        usuario_id: user.id,
      },
      success_url: `${origin}/premium?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("stripe-create-checkout error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Error creando la sesión de pago." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
