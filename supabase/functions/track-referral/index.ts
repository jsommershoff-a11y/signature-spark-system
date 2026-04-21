import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ref_code, lead_id, email } = await req.json();
    if (!ref_code || typeof ref_code !== "string") {
      return new Response(JSON.stringify({ error: "ref_code required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve affiliate
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id, status")
      .eq("referral_code", ref_code.toUpperCase())
      .maybeSingle();

    if (!affiliate || affiliate.status !== "active") {
      return new Response(JSON.stringify({ ok: false, reason: "invalid_or_inactive_affiliate" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert referral (idempotent on lead+affiliate)
    const insertPayload: Record<string, unknown> = {
      affiliate_id: affiliate.id,
      ref_code: ref_code.toUpperCase(),
    };
    if (lead_id) insertPayload.lead_id = lead_id;
    if (email) insertPayload.email = email;

    const { data, error } = await supabase
      .from("referrals")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      // Likely unique violation – not fatal
      console.log("Referral insert info:", error.message);
      return new Response(JSON.stringify({ ok: true, deduped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, referral_id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[track-referral]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
