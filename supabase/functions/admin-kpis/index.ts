import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: unknown) =>
  console.log(`[admin-kpis] ${s}${d ? " " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });

    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("No authorization header");
    const { data: ud, error: ue } = await anon.auth.getUser(auth.replace("Bearer ", ""));
    if (ue || !ud.user) throw new Error("Unauthenticated");

    const { data: roleCheck } = await admin.rpc("has_min_role", {
      _user_id: ud.user.id,
      _min_role: "admin",
    });
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Run all DB counts in parallel
    const [
      profilesActive,
      profilesAll,
      leadsOpen,
      leadsTotal,
      customersActive,
      ordersPaid30d,
      webhookErrors24h,
      syncErrors7d,
    ] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }).gte("updated_at", since30d),
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("crm_leads").select("id", { count: "exact", head: true }).eq("status", "new"),
      admin.from("crm_leads").select("id", { count: "exact", head: true }),
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .in("subscription_status", ["active", "trialing"]),
      admin
        .from("orders")
        .select("amount_cents")
        .eq("status", "paid")
        .gte("paid_at", since30d),
      admin
        .from("webhook_events")
        .select("id", { count: "exact", head: true })
        .eq("status", "error")
        .gte("received_at", since24h),
      admin
        .from("sync_errors")
        .select("id", { count: "exact", head: true })
        .gte("timestamp", since7d),
    ]);

    const revenue30dCents =
      (ordersPaid30d.data ?? []).reduce((sum, o: any) => sum + (o.amount_cents ?? 0), 0) ?? 0;

    // Stripe MRR (best-effort)
    let mrrCents = 0;
    let activeSubs = 0;
    let stripeOk = false;
    try {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const subs = await stripe.subscriptions.list({ status: "active", limit: 100 });
        activeSubs = subs.data.length;
        for (const s of subs.data) {
          const price = s.items.data[0]?.price;
          if (!price?.unit_amount || !price.recurring) continue;
          const amt = price.unit_amount;
          if (price.recurring.interval === "month") mrrCents += amt;
          else if (price.recurring.interval === "year") mrrCents += Math.round(amt / 12);
          else if (price.recurring.interval === "week") mrrCents += amt * 4;
        }
        stripeOk = true;
      }
    } catch (e) {
      log("Stripe error", { msg: e instanceof Error ? e.message : String(e) });
    }

    // Integration health
    const integrations = {
      stripe: stripeOk ? "ok" : "error",
      webhooks: (webhookErrors24h.count ?? 0) === 0 ? "ok" : "warn",
      sync: (syncErrors7d.count ?? 0) === 0 ? "ok" : "warn",
    };
    const healthOk = Object.values(integrations).filter((v) => v === "ok").length;
    const healthTotal = Object.keys(integrations).length;

    const payload = {
      users: {
        active_30d: profilesActive.count ?? 0,
        total: profilesAll.count ?? 0,
      },
      leads: {
        open: leadsOpen.count ?? 0,
        total: leadsTotal.count ?? 0,
      },
      customers: {
        active: customersActive.count ?? 0,
      },
      revenue: {
        last_30d_cents: revenue30dCents,
        mrr_cents: mrrCents,
        active_subscriptions: activeSubs,
      },
      health: {
        ok: healthOk,
        total: healthTotal,
        integrations,
        webhook_errors_24h: webhookErrors24h.count ?? 0,
        sync_errors_7d: syncErrors7d.count ?? 0,
      },
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
