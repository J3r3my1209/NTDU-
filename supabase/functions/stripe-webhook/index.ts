// supabase/functions/stripe-webhook/index.ts
//
// Recibe los eventos que Stripe envía a este endpoint público.
// Cuando el pago se confirma (checkout.session.completed), activa Premium
// para el usuario indicado en session.metadata.usuario_id, usando la
// service_role key (que ignora RLS) directamente en la base de datos.
//
// Variables de entorno necesarias:
//   STRIPE_SECRET_KEY          -> sk_test_... o sk_live_...
//   STRIPE_WEBHOOK_SECRET      -> whsec_... (lo da Stripe al crear el webhook)
//   SUPABASE_URL                -> inyectada automáticamente por Supabase
//   SUPABASE_SERVICE_ROLE_KEY   -> inyectada automáticamente por Supabase
//
// Cómo conectarlo con Stripe (modo prueba):
//   1) Despliega esta función: supabase functions deploy stripe-webhook --no-verify-jwt
//   2) En el Dashboard de Stripe (modo TEST) → Developers → Webhooks → Add endpoint
//      URL: https://<tu-proyecto>.supabase.co/functions/v1/stripe-webhook
//      Evento a escuchar: checkout.session.completed
//   3) Copia el "Signing secret" (whsec_...) y guárdalo como STRIPE_WEBHOOK_SECRET
//   Para probar en local puedes usar `stripe listen --forward-to <url>`.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.7.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

// Cliente con permisos totales: se usa SOLO dentro de esta función,
// nunca se expone al frontend.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!signature) {
    return new Response("Falta la firma de Stripe.", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // constructEventAsync porque Deno usa SubtleCrypto (no Node crypto).
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (err) {
    console.error("Firma de webhook inválida:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const usuarioId = session.metadata?.usuario_id ?? session.client_reference_id;

      if (!usuarioId) {
        console.error("checkout.session.completed sin usuario_id en metadata.");
        return new Response("Sin usuario_id", { status: 200 }); // 200 para que Stripe no reintente indefinidamente
      }

      if (session.payment_status !== "paid") {
        console.warn("Sesión completada pero no pagada:", session.id);
        return new Response("OK", { status: 200 });
      }

      const monto = (session.amount_total ?? 300) / 100;

      // Función SQL atómica y con protección contra webhooks duplicados
      // (Stripe puede reenviar el mismo evento más de una vez).
      const { error } = await supabaseAdmin.rpc("activar_premium_stripe", {
        p_usuario_id: usuarioId,
        p_monto: monto,
        p_stripe_session_id: session.id,
      });

      if (error) {
        console.error("Error activando Premium:", error);
        return new Response("Error interno", { status: 500 });
      }

      console.log(`✅ Premium activado para usuario ${usuarioId} (sesión ${session.id})`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("stripe-webhook error:", err);
    return new Response("Error interno", { status: 500 });
  }
});
