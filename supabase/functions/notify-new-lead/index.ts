import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SOURCE_LABELS: Record<string, string> = {
  start: "Startseite",
  growth: "Growth",
  handwerk: "Handwerk",
  praxen: "Praxen",
  dienstleister: "Dienstleister",
  immobilien: "Immobilien",
  kurzzeitvermietung: "Kurzzeitvermietung",
  qualifizierung: "Qualifizierung",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { name, email, phone, message, source } = body;

    // Input validation
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email) || email.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (phone && (typeof phone !== "string" || phone.length > 30)) {
      return new Response(JSON.stringify({ error: "Invalid phone" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message && (typeof message !== "string" || message.length > 1000)) {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting: check if lead with same email was inserted in last 60s
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const sixtySecondsAgo = new Date(Date.now() - 60_000).toISOString();
    const { data: recentLeads } = await adminClient
      .from("leads")
      .select("id")
      .eq("email", email.trim())
      .gte("created_at", sixtySecondsAgo)
      .limit(1);

    if (!recentLeads || recentLeads.length === 0) {
      // No recent lead found — probably a timing issue, skip silently
      console.log("No recent lead found for rate-limit check, proceeding anyway");
    }

    if (recentLeads && recentLeads.length > 1) {
      console.log("Rate limited: duplicate email within 60s");
      return new Response(
        JSON.stringify({ error: "Rate limited", message: "Please wait before submitting again" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedName = name.trim();
    const sourceLabel = SOURCE_LABELS[source] || source || "Unbekannt";
    const now = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

    // Email 1: Customer confirmation
    const customerHtml = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px 40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">KRS Signature System</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="font-size:16px;color:#18181b;margin:0 0 16px;">Hallo ${trimmedName},</p>
          <p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 24px;">
            vielen Dank für deine Anfrage! Wir haben deine Nachricht erhalten und melden uns
            innerhalb von <strong>24 Stunden</strong> persönlich bei dir.
          </p>
          <p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 24px;">
            In der Zwischenzeit kannst du dich gerne auf unserer Website umsehen und mehr über
            unser System erfahren.
          </p>
          <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;" />
          <p style="font-size:13px;color:#a1a1aa;margin:0;line-height:1.5;">
            Bei dringenden Fragen erreichst du uns unter
            <a href="mailto:info@krs-signature.de" style="color:#6366f1;">info@krs-signature.de</a>.<br/><br/>
            Mit freundlichen Grüßen,<br/>
            <strong>Dein KRS Team</strong>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Email 2: Team notification
    const teamHtml = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#16213e;padding:24px 40px;">
          <h2 style="color:#ffffff;margin:0;font-size:20px;">Neuer Lead eingegangen</h2>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;color:#3f3f46;">
            <tr><td style="font-weight:600;width:120px;vertical-align:top;">Name:</td><td>${trimmedName}</td></tr>
            <tr><td style="font-weight:600;vertical-align:top;">E-Mail:</td><td><a href="mailto:${email.trim()}" style="color:#6366f1;">${email.trim()}</a></td></tr>
            ${phone ? `<tr><td style="font-weight:600;vertical-align:top;">Telefon:</td><td>${phone.trim()}</td></tr>` : ""}
            <tr><td style="font-weight:600;vertical-align:top;">Quelle:</td><td>${sourceLabel}</td></tr>
            ${message ? `<tr><td style="font-weight:600;vertical-align:top;">Nachricht:</td><td>${message.trim()}</td></tr>` : ""}
            <tr><td style="font-weight:600;vertical-align:top;">Zeitpunkt:</td><td>${now}</td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Send both emails via Resend batch API
    const resendRes = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          from: "KRS Signature System <info@krs-signature.de>",
          to: [email.trim()],
          subject: "Danke für deine Anfrage – KRS Signature System",
          html: customerHtml,
        },
        {
          from: "KRS Signature System <info@krs-signature.de>",
          to: ["info@krs-signature.de"],
          subject: `Neuer Lead: ${trimmedName} (${sourceLabel})`,
          html: teamHtml,
        },
      ]),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend batch error:", errText);
      return new Response(
        JSON.stringify({ error: "Email sending failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendData = await resendRes.json();
    console.log("Emails sent successfully:", resendData);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("notify-new-lead error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
