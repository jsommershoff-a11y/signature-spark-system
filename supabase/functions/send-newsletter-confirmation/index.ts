import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, name, confirmUrl, expiresAt } = await req.json();

    if (!email || !confirmUrl) {
      return json({ error: "Missing email or confirmUrl" }, 400);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) return json({ error: "RESEND_API_KEY missing" }, 500);

    const expiresFmt = expiresAt
      ? new Date(expiresAt).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })
      : "in 7 Tagen";

    const greeting = name ? `Hallo ${String(name).split(" ")[0]},` : "Hallo,";

    const html = `
<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#fff;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  <h1 style="font-size:22px;margin:0 0 12px;">Bitte bestätige deine E-Mail-Adresse</h1>
  <p style="font-size:15px;line-height:1.55;color:#333;">${greeting}</p>
  <p style="font-size:15px;line-height:1.55;color:#333;">
    danke für deine Newsletter-Anmeldung! Damit wir dir den 30-Tage-Mitgliederbereich-Zugang
    freischalten und Live-Call-Erinnerungen senden dürfen, brauchen wir noch <strong>einen Klick</strong>
    von dir.
  </p>
  <p style="text-align:center;margin:28px 0;">
    <a href="${confirmUrl}"
       style="display:inline-block;background:#FF6B1A;color:#fff;text-decoration:none;
              font-weight:600;padding:14px 28px;border-radius:8px;font-size:15px;">
      ✅ E-Mail-Adresse bestätigen
    </a>
  </p>
  <div style="background:#FFF3EB;border-left:4px solid #FF6B1A;padding:14px 16px;border-radius:6px;margin:20px 0;">
    <strong style="display:block;font-size:14px;margin-bottom:4px;">Was passiert nach dem Klick?</strong>
    <span style="font-size:13px;color:#444;">
      Du erhältst sofort eine zweite Mail mit deinem 1-Klick-Login zum Mitgliederbereich
      sowie den Terminen für die 2× wöchentlichen Live-Calls.
    </span>
  </div>
  <p style="font-size:13px;color:#666;">
    Der Bestätigungslink ist bis <strong>${expiresFmt}</strong> gültig. Falls du dich nicht
    angemeldet hast, ignoriere diese E-Mail einfach – ohne Klick passiert nichts.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="font-size:11px;color:#999;">
    Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
    <span style="word-break:break-all;">${confirmUrl}</span>
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
        subject: "Bitte bestätige deine E-Mail (1 Klick)",
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[send-newsletter-confirmation] resend error", text);
      return json({ error: text }, 500);
    }

    return json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[send-newsletter-confirmation] error", msg);
    return json({ error: msg }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
