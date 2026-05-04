import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const name = body?.name ? String(body.name).trim().slice(0, 200) : "";
    const whatsappRaw = body?.whatsapp ? String(body.whatsapp).trim() : "";
    const source = body?.source ? String(body.source).slice(0, 100) : "newsletter";
    const consent = body?.consent === true;

    // Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
      return new Response(JSON.stringify({ error: "Bitte gültige E-Mail angeben." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!name || name.length < 2) {
      return new Response(JSON.stringify({ error: "Bitte Namen angeben." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let whatsapp: string | null = null;
    if (whatsappRaw) {
      const digits = whatsappRaw.replace(/\D/g, "");
      if (digits.length < 7 || whatsappRaw.length > 40) {
        return new Response(JSON.stringify({ error: "WhatsApp-Nummer ungültig." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      whatsapp = whatsappRaw;
    }
    if (!consent) {
      return new Response(JSON.stringify({ error: "Bitte Einwilligung bestätigen." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = req.headers.get("user-agent") ?? null;

    const { error } = await supabase
      .from("newsletter_signups")
      .upsert(
        {
          email,
          name,
          whatsapp,
          source,
          consent_marketing: consent,
          trial_started_at: now.toISOString(),
          trial_ends_at: trialEnd.toISOString(),
          ip_address: ip,
          user_agent: ua,
          status: "trial_active",
          meta: { referer: req.headers.get("referer") ?? null },
        },
        { onConflict: "email" },
      );

    if (error) {
      console.error("[newsletter-signup] insert error", error);
      return new Response(JSON.stringify({ error: "Speichern fehlgeschlagen." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional: notify team via existing email infrastructure (best-effort, non-blocking)
    try {
      await supabase.functions.invoke("send-team-notification", {
        body: {
          subject: `Neuer Newsletter-Trial: ${email}`,
          message: `Name: ${name ?? "—"}\nE-Mail: ${email}\nWhatsApp: ${whatsapp}\nQuelle: ${source}\nTrial bis: ${trialEnd.toISOString()}`,
        },
      });
    } catch (_) { /* ignore */ }

    return new Response(
      JSON.stringify({ ok: true, trial_ends_at: trialEnd.toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[newsletter-signup] error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
