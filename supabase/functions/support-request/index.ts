import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const Schema = z.object({
  email: z.string().trim().email().max(320),
  name: z.string().trim().max(200).optional().default(""),
  whatsapp: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().min(5, "Bitte beschreibe dein Anliegen kurz.").max(2000),
  mailStatus: z.enum(["sent", "queued", "already", "failed"]),
  optInLabel: z.string().max(300).optional().default(""),
  reasonLabel: z.string().max(300).optional().default(""),
  pageUrl: z.string().max(500).optional().default(""),
});

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");

    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const d = parsed.data;
    const ts = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
    const subject = `[Newsletter-Support] ${d.email} – ${d.mailStatus}`;
    const html = `
      <h2>Neue Support-Anfrage (Newsletter-Bestätigung)</h2>
      <p><strong>Zeitpunkt:</strong> ${escapeHtml(ts)}</p>
      <h3>Kontakt</h3>
      <ul>
        <li><strong>E-Mail:</strong> ${escapeHtml(d.email)}</li>
        <li><strong>Name:</strong> ${escapeHtml(d.name || "(nicht angegeben)")}</li>
        <li><strong>WhatsApp:</strong> ${escapeHtml(d.whatsapp || "(nicht angegeben)")}</li>
      </ul>
      <h3>Opt-in / Double-Opt-in</h3>
      <ul>
        <li><strong>Status:</strong> ${escapeHtml(d.optInLabel || d.mailStatus)}</li>
        <li><strong>Code:</strong> ${escapeHtml(d.mailStatus)}</li>
        <li><strong>Grund:</strong> ${escapeHtml(d.reasonLabel || "—")}</li>
      </ul>
      <h3>Nachricht</h3>
      <p style="white-space:pre-wrap;border-left:3px solid #f97316;padding-left:12px">${escapeHtml(d.message)}</p>
      <p style="color:#666;font-size:12px">Seite: ${escapeHtml(d.pageUrl)}</p>
    `;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "KRS Support <info@krs-signature.de>",
        to: ["info@krs-signature.de"],
        reply_to: d.email,
        subject,
        html,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`Resend ${r.status}: ${txt}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("support-request error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
