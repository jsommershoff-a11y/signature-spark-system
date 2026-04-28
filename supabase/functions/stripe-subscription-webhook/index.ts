// Stripe Subscription Webhook
// Verarbeitet customer.subscription.* und invoice.payment_* Events
// und synchronisiert subscription_status / trial_ends_at in profiles.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const RELEVANT_EVENTS = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.trial_will_end",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "checkout.session.completed",
]);

function tsToISO(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature || "",
      webhookSecret
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[STRIPE-SUB-WEBHOOK] Signature verification failed:", msg);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("[STRIPE-SUB-WEBHOOK] Event:", event.type, event.id);

  if (!RELEVANT_EVENTS.has(event.type)) {
    return new Response(JSON.stringify({ received: true, ignored: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    let subscription: Stripe.Subscription | null = null;
    let customerId: string | null = null;

    if (event.type.startsWith("customer.subscription.")) {
      subscription = event.data.object as Stripe.Subscription;
      customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    } else if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.subscription) {
        return new Response(JSON.stringify({ received: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const subId = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
      subscription = await stripe.subscriptions.retrieve(subId);
      customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    } else if (event.type.startsWith("invoice.")) {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.subscription) {
        return new Response(JSON.stringify({ received: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const subId = typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription.id;
      subscription = await stripe.subscriptions.retrieve(subId);
      customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    }

    if (!subscription || !customerId) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Customer-Email holen (Fallback-Matching)
    let email: string | null = null;
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer.deleted) email = (customer as Stripe.Customer).email ?? null;
    } catch (_) { /* ignore */ }

    // Status-Mapping (1:1 von Stripe übernehmen, da DB textbasiert)
    const status = subscription.status; // trialing | active | past_due | canceled | unpaid | incomplete | incomplete_expired

    const { data: syncedUserId, error: syncErr } = await supabase.rpc(
      "sync_stripe_subscription",
      {
        _stripe_customer_id: customerId,
        _stripe_subscription_id: subscription.id,
        _status: status,
        _trial_start: tsToISO(subscription.trial_start),
        _trial_end: tsToISO(subscription.trial_end),
        _current_period_end: tsToISO(subscription.current_period_end),
        _cancel_at: tsToISO(subscription.cancel_at),
        _email: email,
      }
    );

    if (syncErr) {
      console.error("[STRIPE-SUB-WEBHOOK] sync RPC error:", syncErr);
      throw syncErr;
    }

    console.log(
      `[STRIPE-SUB-WEBHOOK] Synced sub=${subscription.id} status=${status} user=${syncedUserId}`
    );

    return new Response(JSON.stringify({ received: true, user_id: syncedUserId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[STRIPE-SUB-WEBHOOK] Handler error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
