import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: affiliate } = await admin
      .from("affiliates")
      .select("*")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (!affiliate?.stripe_account_id) {
      return new Response(JSON.stringify({ error: "No affiliate account found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });
    const origin = req.headers.get("origin") || "https://signature-spark-system.lovable.app";

    // If already onboarded → dashboard login link
    if (affiliate.charges_enabled && affiliate.payouts_enabled) {
      const loginLink = await stripe.accounts.createLoginLink(affiliate.stripe_account_id);
      return new Response(JSON.stringify({ url: loginLink.url, type: "dashboard" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: affiliate.stripe_account_id,
      refresh_url: `${origin}/app/affiliate?refresh=1`,
      return_url: `${origin}/app/affiliate?onboarded=1`,
      type: "account_onboarding",
    });

    return new Response(JSON.stringify({ url: accountLink.url, type: "onboarding" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[affiliate-onboard-refresh]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
