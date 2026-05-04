import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, name, magicLink, trialEndsAt } = await req.json();

    if (!email || !magicLink) {
      return new Response(JSON.stringify({ error: "Missing email or magicLink" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const endsFmt = trialEndsAt
      ? new Date(trialEndsAt).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })
      : "in 30 Tagen";

    const html = `
<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  <h1 style="font-size:22px;margin:0 0 12px;">Willkommen, ${name ?? "schön dass du da bist"}! 🎉</h1>
  <p style="font-size:15px;line-height:1.55;color:#333;">
    Dein <strong>30-Tage-Mitgliederbereich-Zugang</strong> ist freigeschaltet – komplett kostenlos, ohne Zahlungsdaten.
  </p>
  <p style="font-size:15px;line-height:1.55;color:#333;">
    Klicke auf den Button, um dich automatisch einzuloggen:
  </p>
  <p style="text-align:center;margin:28px 0;">
    <a href="${magicLink}"
       style="display:inline-block;background:#FF6B1A;color:#fff;text-decoration:none;
              font-weight:600;padding:14px 28px;border-radius:8px;font-size:15px;">
      Jetzt zum Mitgliederbereich →
    </a>
  </p>
  <div style="background:#FFF3EB;border-left:4px solid #FF6B1A;padding:14px 16px;border-radius:6px;margin:20px 0;">
    <strong style="display:block;font-size:14px;margin-bottom:4px;">📅 2× wöchentlich Live-Call</strong>
    <span style="font-size:13px;color:#444;">
      Sieh live, wie wir Prompts entwickeln, KI-Workflows bauen und auf reale Kundenfälle anwenden.
      Termine findest du im Mitgliederbereich.
    </span>
  </div>
  <p style="font-size:13px;color:#666;">
    Dein Trial läuft bis <strong>${endsFmt}</strong>. Danach kannst du verlängern oder abmelden – alles freiwillig.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="font-size:11px;color:#999;">
    Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
    <span style="word-break:break-all;">${magicLink}</span>
  </p>
</body></html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "KI-Automationen <hi-there@ki-automationen.io>",
        to: [email],
        subject: "Dein Mitgliederbereich-Zugang ist da – 30 Tage gratis 🚀",
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[send-newsletter-welcome] resend error", text);
      return new Response(JSON.stringify({ error: text }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[send-newsletter-welcome] error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
