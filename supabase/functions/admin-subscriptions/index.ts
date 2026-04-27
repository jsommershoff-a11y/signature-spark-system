import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: unknown) =>
  console.log(`[admin-subscriptions] ${s}${d ? " " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });

    // Authn
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("No authorization header");
    const { data: ud, error: ue } = await anon.auth.getUser(auth.replace("Bearer ", ""));
    if (ue || !ud.user) throw new Error("Unauthenticated");

    // Authz: admin only
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Fetch all subscriptions (active + canceled in last 90d)
    log("Fetching subscriptions");
    const subsRes = await stripe.subscriptions.list({
      status: "all",
      limit: 100,
      expand: ["data.customer", "data.items.data.price.product"],
    });

    const subs = subsRes.data.map((s) => {
      const item = s.items.data[0];
      const price = item?.price;
      const product = price?.product as Stripe.Product | undefined;
      const customer = s.customer as Stripe.Customer | Stripe.DeletedCustomer | undefined;
      const customerEmail =
        customer && !("deleted" in customer) ? customer.email ?? null : null;
      const customerName =
        customer && !("deleted" in customer) ? customer.name ?? null : null;
      const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id;

      return {
        id: s.id,
        status: s.status,
        customer_id: customerId,
        customer_email: customerEmail,
        customer_name: customerName,
        product_id: typeof product === "string" ? product : product?.id ?? null,
        product_name: typeof product === "string" ? null : product?.name ?? null,
        price_id: price?.id ?? null,
        amount_cents: price?.unit_amount ?? null,
        currency: price?.currency ?? null,
        interval: price?.recurring?.interval ?? null,
        interval_count: price?.recurring?.interval_count ?? null,
        current_period_start: (s as any).current_period_start
          ? new Date((s as any).current_period_start * 1000).toISOString()
          : null,
        current_period_end: (s as any).current_period_end
          ? new Date((s as any).current_period_end * 1000).toISOString()
          : null,
        start_date: s.start_date ? new Date(s.start_date * 1000).toISOString() : null,
        cancel_at_period_end: s.cancel_at_period_end,
        cancel_at: s.cancel_at ? new Date(s.cancel_at * 1000).toISOString() : null,
        canceled_at: s.canceled_at ? new Date(s.canceled_at * 1000).toISOString() : null,
        ended_at: s.ended_at ? new Date(s.ended_at * 1000).toISOString() : null,
        trial_end: s.trial_end ? new Date(s.trial_end * 1000).toISOString() : null,
        created: new Date(s.created * 1000).toISOString(),
      };
    });

    // Enrich with profile info via stripe_customer_id
    const customerIds = subs.map((s) => s.customer_id).filter(Boolean) as string[];
    const profileMap = new Map<string, { full_name: string | null; email: string | null; user_id: string }>();
    if (customerIds.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("user_id, full_name, email, stripe_customer_id")
        .in("stripe_customer_id", customerIds);
      profiles?.forEach((p) => {
        if (p.stripe_customer_id)
          profileMap.set(p.stripe_customer_id, {
            full_name: p.full_name,
            email: p.email,
            user_id: p.user_id,
          });
      });
    }

    const enriched = subs.map((s) => ({
      ...s,
      profile: s.customer_id ? profileMap.get(s.customer_id) ?? null : null,
    }));

    // Aggregate stats
    const statusCounts: Record<string, number> = {};
    let mrrCents = 0;
    enriched.forEach((s) => {
      statusCounts[s.status] = (statusCounts[s.status] ?? 0) + 1;
      if (s.status === "active" || s.status === "trialing") {
        if (s.amount_cents && s.interval) {
          if (s.interval === "month") mrrCents += s.amount_cents;
          else if (s.interval === "year") mrrCents += Math.round(s.amount_cents / 12);
          else if (s.interval === "week") mrrCents += s.amount_cents * 4;
        }
      }
    });

    log("Done", { total: enriched.length, mrrCents });

    return new Response(
      JSON.stringify({
        subscriptions: enriched,
        stats: {
          total: enriched.length,
          status_counts: statusCounts,
          mrr_cents: mrrCents,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
