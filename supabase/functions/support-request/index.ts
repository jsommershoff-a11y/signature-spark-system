import { z } from "npm:zod@3.23.8";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

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
  // Spam-Schutz (Honeypot + Min-Time-to-Submit). Beide optional, damit alte Clients weiter funktionieren.
  website: z.string().max(200).optional().default(""),
  formStartedAt: z.number().int().nonnegative().optional(),
});

const sha256Hex = async (input: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const d = parsed.data;
    const ts = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

    // Spam-Schutz #1: Honeypot — befülltes "website"-Feld = Bot. Vortäuschen, dass alles ok ist.
    if (d.website && d.website.trim().length > 0) {
      console.warn("support-request honeypot triggered", { ip: req.headers.get("x-forwarded-for") });
      return new Response(JSON.stringify({ ok: true, ticketRef: "(spam-blocked)" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Spam-Schutz #2: Min-Time-to-Submit — Mensch braucht >=2 s.
    if (typeof d.formStartedAt === "number") {
      const elapsed = Date.now() - d.formStartedAt;
      if (elapsed >= 0 && elapsed < 2000) {
        console.warn("support-request submitted too fast", { elapsed });
        return new Response(JSON.stringify({ ok: true, ticketRef: "(spam-blocked)" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Spam-Schutz #3: Deduplizierung — identische email + message-hash binnen 5 Min => kein neues Ticket.
    const messageHash = await sha256Hex(`${d.email.toLowerCase()}|${d.message.trim()}`);
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();

    const { data: hashHit } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("sender_email", d.email)
      .eq("message_hash", messageHash)
      .gte("created_at", fiveMinAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (hashHit?.id) {
      const ref = `#${String(hashHit.id).slice(0, 8).toUpperCase()}`;
      console.log("support-request duplicate suppressed", { ref, email: d.email });
      return new Response(
        JSON.stringify({ ok: true, ticketId: hashHit.id, ticketRef: ref, deduplicated: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 1) Ticket in Supabase anlegen (Source of Truth)
    const subjectShort = `Newsletter-Support – ${d.email} (${d.mailStatus})`;
    const bodyForTicket = [
      `E-Mail: ${d.email}`,
      `Name: ${d.name || "(nicht angegeben)"}`,
      `WhatsApp: ${d.whatsapp || "(nicht angegeben)"}`,
      `Mail-Status: ${d.mailStatus}`,
      `Opt-in: ${d.optInLabel || "—"}`,
      `Grund: ${d.reasonLabel || "—"}`,
      `Seite: ${d.pageUrl || "—"}`,
      ``,
      `--- Nachricht ---`,
      d.message,
    ].join("\n");

    const { data: ticket, error: ticketErr } = await supabase
      .from("support_tickets")
      .insert({
        subject: subjectShort,
        body: bodyForTicket,
        status: "open",
        priority: d.mailStatus === "failed" ? "high" : "normal",
        source: "manual",
        sender_email: d.email,
        sender_name: d.name || null,
        message_hash: messageHash,
      })
      .select("id")
      .single();

    if (ticketErr) {
      console.error("support_tickets insert failed:", ticketErr);
    }

    const ticketId = ticket?.id ?? null;
    const ticketRef = ticketId ? `#${String(ticketId).slice(0, 8).toUpperCase()}` : "(kein Ticket)";

    // 1b) Microsoft Teams Notification (best-effort)
    try {
      const TEAMS_KEY = Deno.env.get("MICROSOFT_TEAMS_API_KEY");
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      const TEAM_ID = "65e33c2b-34bf-491b-81cb-b0cde7af3067"; // KI Team
      const CHANNEL_ID = "19:kaNJGMj0D8Qd7c1s55jxdCITlymSTqHCOS690RMhQG81@thread.tacv2"; // KI Power Team
      if (TEAMS_KEY && LOVABLE_API_KEY) {
        const priorityBadge = d.mailStatus === "failed" ? "🔴 HIGH" : "🟢 NORMAL";
        const teamsHtml = `
          <p><b>🎫 Neues Support-Ticket ${escapeHtml(ticketRef)}</b> &nbsp; ${priorityBadge}</p>
          <ul>
            <li><b>Von:</b> ${escapeHtml(d.name || "-")} &lt;${escapeHtml(d.email)}&gt;</li>
            <li><b>WhatsApp:</b> ${escapeHtml(d.whatsapp || "-")}</li>
            <li><b>Mail-Status:</b> ${escapeHtml(d.mailStatus)} (${escapeHtml(d.reasonLabel || "-")})</li>
            <li><b>Quelle:</b> ${escapeHtml(d.pageUrl || "-")}</li>
          </ul>
          <p><b>Nachricht:</b><br/>${escapeHtml(d.message).replace(/\n/g, "<br/>")}</p>
          <p style="color:#666;font-size:11px">Ticket-ID: ${escapeHtml(ticketId ?? "-")}</p>
        `;
        const tRes = await fetch(
          `https://connector-gateway.lovable.dev/microsoft_teams/teams/${TEAM_ID}/channels/${encodeURIComponent(CHANNEL_ID)}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": TEAMS_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              body: { contentType: "html", content: teamsHtml },
              subject: `Support ${ticketRef} – ${d.email}`,
            }),
          },
        );
        if (!tRes.ok) {
          console.error("Teams notify failed:", tRes.status, await tRes.text());
        }
      }
    } catch (teamsErr) {
      console.error("Teams notify error:", teamsErr);
    }

    // 2) Mail an Team via Resend
    const subject = `[Support ${ticketRef}] ${d.email} – ${d.mailStatus}`;
    const html = `
      <h2>Neue Support-Anfrage (Newsletter-Bestätigung)</h2>
      <p><strong>Ticket:</strong> ${escapeHtml(ticketRef)}<br/>
         <strong>Zeitpunkt:</strong> ${escapeHtml(ts)}</p>
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
      <p style="color:#666;font-size:12px">Seite: ${escapeHtml(d.pageUrl)}<br/>Ticket-ID: ${escapeHtml(ticketId ?? "—")}</p>
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

    // 3) Bestätigungs-Mail an den Absender (best-effort, blockiert nicht)
    // Threading: <local>+<shortid>@<domain> als Reply-To, damit das Inbound-Webhook
    // Antworten dem Ticket zuordnen kann. Default-Route aus inbound_email_config
    // ziehen, fallback auf ENV INBOUND_REPLY_DOMAIN + "ticket".
    let routeLocal = "ticket";
    let routeDomain = Deno.env.get("INBOUND_REPLY_DOMAIN") || "";
    try {
      const { data: defaultRoute } = await supabase
        .from("inbound_email_config")
        .select("local_part, reply_domain")
        .eq("enabled", true)
        .eq("is_default", true)
        .maybeSingle();
      if (defaultRoute?.local_part && defaultRoute?.reply_domain) {
        routeLocal = defaultRoute.local_part;
        routeDomain = defaultRoute.reply_domain;
      }
    } catch (routeErr) {
      console.warn("support-request: route lookup failed", routeErr);
    }
    const shortIdLower = ticketId ? String(ticketId).slice(0, 8).toLowerCase() : null;
    const replyToAddr = routeDomain && shortIdLower
      ? `${routeLocal}+${shortIdLower}@${routeDomain}`
      : "info@krs-signature.de";
    const confirmHtml = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
        <h2 style="color:#0F3E2E;margin:0 0 12px">Wir haben deine Anfrage erhalten ✅</h2>
        <p style="margin:0 0 12px">Hallo ${escapeHtml(d.name || "")},</p>
        <p style="margin:0 0 16px">vielen Dank für deine Nachricht. Dein Support-Ticket
          <strong style="color:#f97316">${escapeHtml(ticketRef)}</strong>
          wurde angelegt. Unser Team meldet sich innerhalb von 24 Stunden an Werktagen bei dir
          unter <strong>${escapeHtml(d.email)}</strong>.</p>
        <div style="background:#FFF3EB;border-left:4px solid #f97316;padding:12px 16px;border-radius:6px;margin:16px 0">
          <p style="margin:0 0 6px;font-weight:600">Deine Nachricht:</p>
          <p style="margin:0;white-space:pre-wrap;color:#374151;font-size:14px">${escapeHtml(d.message)}</p>
        </div>
        <p style="margin:16px 0 0;font-size:13px;color:#6b7280">
          Du kannst auf diese Mail einfach antworten – deine Antwort landet direkt im Ticket.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="font-size:12px;color:#9ca3af;margin:0">
          KRS Signature · info@krs-signature.de · Ticket ${escapeHtml(ticketRef)}
        </p>
      </div>
    `;

    try {
      const c = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "KRS Support <info@krs-signature.de>",
          to: [d.email],
          reply_to: replyToAddr,
          subject: `Wir haben deine Anfrage erhalten – Ticket ${ticketRef}`,
          html: confirmHtml,
          headers: {
            "X-Ticket-Id": ticketId ?? "",
            "X-Ticket-Ref": ticketRef,
          },
        }),
      });
      if (!c.ok) {
        const txt = await c.text();
        console.error("Confirmation mail failed:", c.status, txt);
      } else if (ticketId) {
        try {
          const j = await c.json();
          const resendId = j?.id ? `<${j.id}@resend.email>` : null;
          if (resendId) {
            await supabase
              .from("support_tickets")
              .update({ email_message_id: resendId })
              .eq("id", ticketId);
          }
        } catch (parseErr) {
          console.warn("Confirmation mail: could not parse resend id", parseErr);
        }
      }
    } catch (confirmErr) {
      console.error("Confirmation mail error:", confirmErr);
    }

    return new Response(
      JSON.stringify({ ok: true, ticketId, ticketRef }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("support-request error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
