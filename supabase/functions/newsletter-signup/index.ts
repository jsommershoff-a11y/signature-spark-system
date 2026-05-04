import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Newsletter-Signup mit Double-Opt-In.
 * 1. Validiert Eingabe + Consent
 * 2. Upsert in newsletter_signups mit status='pending_confirmation' und Token (7 Tage gültig)
 * 3. Sendet Bestätigungs-Mail via send-newsletter-confirmation
 *
 * Provisionierung (Trial, Magic-Link, Welcome-Mail) erfolgt erst nach
 * Bestätigung in der Edge Function `newsletter-confirm`.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const name = body?.name ? String(body.name).trim().slice(0, 200) : "";
    const whatsappRaw = body?.whatsapp ? String(body.whatsapp).trim() : "";
    const source = body?.source ? String(body.source).slice(0, 100) : "newsletter";
    const consent = body?.consent === true;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
      return json({ error: "Bitte gültige E-Mail angeben." }, 400);
    }
    if (!name || name.length < 2) {
      return json({ error: "Bitte Namen angeben." }, 400);
    }
    let whatsapp: string | null = null;
    if (whatsappRaw) {
      const digits = whatsappRaw.replace(/\D/g, "");
      if (digits.length < 7 || whatsappRaw.length > 40) {
        return json({ error: "WhatsApp-Nummer ungültig." }, 400);
      }
      whatsapp = whatsappRaw;
    }
    if (!consent) {
      return json({ error: "Bitte Einwilligung bestätigen." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const now = new Date();
    const tokenExpires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Sicheren Token erzeugen (32 bytes -> 64 hex chars)
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const confirmToken = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = req.headers.get("user-agent") ?? null;

    // Existierende confirmed-Anmeldung? Dann nicht neu starten.
    const { data: existing } = await supabase
      .from("newsletter_signups")
      .select("id,status,confirmed_at")
      .eq("email", email)
      .maybeSingle();

    if (existing?.confirmed_at) {
      return json({
        ok: true,
        already_confirmed: true,
        message: "Du bist bereits eingetragen und bestätigt.",
      });
    }

    const { error } = await supabase
      .from("newsletter_signups")
      .upsert(
        {
          email,
          name,
          whatsapp,
          source,
          consent_marketing: consent,
          ip_address: ip,
          user_agent: ua,
          status: "pending_confirmation",
          confirm_token: confirmToken,
          confirmation_sent_at: now.toISOString(),
          token_expires_at: tokenExpires.toISOString(),
          confirmed_at: null,
          // Trial wird erst bei Bestätigung gesetzt
          trial_started_at: null,
          trial_ends_at: null,
          user_id: null,
          meta: { referer: req.headers.get("referer") ?? null },
        },
        { onConflict: "email" },
      );

    if (error) {
      console.error("[newsletter-signup] upsert error", error);
      return json({ error: "Speichern fehlgeschlagen." }, 500);
    }

    // Bestätigungs-Mail senden
    const origin = req.headers.get("origin") || "https://www.dein-automatisierungsberater.de";
    const confirmUrl = `${origin}/newsletter/bestaetigung?token=${confirmToken}`;

    let mailSent = false;
    try {
      const { error: mailErr } = await supabase.functions.invoke("send-newsletter-confirmation", {
        body: { email, name, confirmUrl, expiresAt: tokenExpires.toISOString() },
      });
      if (mailErr) throw mailErr;
      mailSent = true;
    } catch (mailErr) {
      console.error("[newsletter-signup] confirmation mail failed", mailErr);
    }

    return json({
      ok: true,
      pending_confirmation: true,
      mail_sent: mailSent,
      message: "Bitte bestätige deine E-Mail-Adresse.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[newsletter-signup] error", msg);
    return json({ error: msg }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
