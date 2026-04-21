import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });
    const webhookSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET") ?? "";
    const sig = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;
    if (webhookSecret && sig) {
      try {
        event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
      } catch (err) {
        console.error("Signature verification failed:", err);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      console.warn("STRIPE_CONNECT_WEBHOOK_SECRET not set – parsing without verification");
      event = JSON.parse(body) as Stripe.Event;
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      const chargesEnabled = !!account.charges_enabled;
      const payoutsEnabled = !!account.payouts_enabled;
      const detailsSubmitted = !!account.details_submitted;

      const status = chargesEnabled && payoutsEnabled ? "active" : "pending";

      const update: Record<string, unknown> = {
        charges_enabled: chargesEnabled,
        payouts_enabled: payoutsEnabled,
        details_submitted: detailsSubmitted,
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === "active") {
        update.activated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("affiliates")
        .update(update)
        .eq("stripe_account_id", account.id);

      if (error) console.error("Update affiliate error:", error);
      else console.log(`Affiliate updated for ${account.id}: status=${status}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[stripe-connect-webhook]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
