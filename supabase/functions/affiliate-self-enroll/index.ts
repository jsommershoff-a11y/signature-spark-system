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

    // Load own profile
    const { data: profile, error: pErr } = await admin
      .from("profiles")
      .select("id, user_id, email, full_name")
      .eq("user_id", userData.user.id)
      .single();
    if (pErr || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!profile.email) {
      return new Response(JSON.stringify({ error: "Profile has no email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });

    const { data: existing } = await admin
      .from("affiliates")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle();

    let affiliateRow = existing;
    let stripeAccountId = existing?.stripe_account_id ?? null;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "DE",
        email: profile.email,
        capabilities: { transfers: { requested: true } },
        business_type: "individual",
        metadata: { profile_id: profile.id, user_id: profile.user_id },
      });
      stripeAccountId = account.id;
    }

    if (!affiliateRow) {
      const { data: inserted, error: iErr } = await admin
        .from("affiliates")
        .insert({
          user_id: profile.user_id,
          profile_id: profile.id,
          stripe_account_id: stripeAccountId,
          status: "pending",
          invited_by: userData.user.id,
        })
        .select()
        .single();
      if (iErr) throw iErr;
      affiliateRow = inserted;
    } else if (!existing?.stripe_account_id) {
      await admin
        .from("affiliates")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", affiliateRow.id);
    }

    const origin = req.headers.get("origin") || "https://signature-spark-system.lovable.app";
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId!,
      refresh_url: `${origin}/app/affiliate?refresh=1`,
      return_url: `${origin}/app/affiliate?onboarded=1`,
      type: "account_onboarding",
    });

    return new Response(
      JSON.stringify({
        affiliate_id: affiliateRow!.id,
        referral_code: affiliateRow!.referral_code,
        onboarding_url: accountLink.url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[affiliate-self-enroll] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
