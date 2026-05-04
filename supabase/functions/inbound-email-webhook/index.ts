// Inbound Email Webhook (SendGrid Inbound Parse)
// Empfängt Antworten auf Support-Mails, erkennt Ticket-ID und schreibt
// die Nachricht als Inbound-Message ins Ticket + Activity am Lead.
//
// Erkennung der Ticket-ID (in dieser Reihenfolge):
//   1. To-Adresse `ticket+<shortid>@…`
//   2. Betreff: `#XXXXXXXX` (8 Hex-Zeichen, case-insensitiv)
//   3. In-Reply-To / References Header (Message-ID Lookup)
//   4. Body-Suche nach `Ticket #XXXXXXXX` / `[Support #XXXXXXXX]`
//
// Auth: Optional via `INBOUND_EMAIL_SECRET` als Query-Param `?secret=…`
//        SendGrid hat keine native Signatur, daher Shared-Secret-Pattern.

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INBOUND_SECRET = Deno.env.get("INBOUND_EMAIL_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TEAMS_KEY = Deno.env.get("MICROSOFT_TEAMS_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// Microsoft Teams Ziel (KI Power Team — wie in support-request)
const TEAMS_TEAM_ID = "65e33c2b-34bf-491b-81cb-b0cde7af3067";
const TEAMS_CHANNEL_ID = "19:kaNJGMj0D8Qd7c1s55jxdCITlymSTqHCOS690RMhQG81@thread.tacv2";
const TEAM_INBOX = "info@krs-signature.de";

const escapeHtml = (s: string) =>
  (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

async function notifyTeams(
  html: string,
  subject: string,
  parentMessageId?: string | null,
): Promise<string | null> {
  if (!TEAMS_KEY || !LOVABLE_API_KEY) return null;
  try {
    // Wenn Parent-ID vorhanden → als Reply im Ticket-Thread posten,
    // sonst als neue Top-Level-Nachricht im Channel.
    const url = parentMessageId
      ? `https://connector-gateway.lovable.dev/microsoft_teams/teams/${TEAMS_TEAM_ID}/channels/${encodeURIComponent(TEAMS_CHANNEL_ID)}/messages/${encodeURIComponent(parentMessageId)}/replies`
      : `https://connector-gateway.lovable.dev/microsoft_teams/teams/${TEAMS_TEAM_ID}/channels/${encodeURIComponent(TEAMS_CHANNEL_ID)}/messages`;
    const payload: Record<string, unknown> = { body: { contentType: "html", content: html } };
    // Subject ist nur bei Top-Level-Nachrichten erlaubt (Replies dürfen kein subject haben).
    if (!parentMessageId) payload.subject = subject;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TEAMS_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      console.error("inbound-email: teams notify failed", r.status, await r.text());
      return null;
    }
    try {
      const j = await r.json();
      return j?.id ? String(j.id) : null;
    } catch { return null; }
  } catch (e) { console.error("inbound-email: teams notify error", e); return null; }
}

async function notifyEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Support <info@krs-signature.de>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!r.ok) console.error("inbound-email: resend notify failed", r.status, await r.text());
  } catch (e) { console.error("inbound-email: resend notify error", e); }
}


const SUBJECT_TICKET_RE = /#([0-9a-f]{8})/i;
// Default-Pattern (Fallback wenn keine Routes konfiguriert sind)
const DEFAULT_TO_PLUS_RE = /(?:ticket|support)\+([0-9a-f]{8})@/i;

function buildToPlusRegex(localParts: string[]): RegExp {
  if (!localParts.length) return DEFAULT_TO_PLUS_RE;
  const escaped = localParts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return new RegExp(`(?:${escaped})\\+([0-9a-f]{8})@`, "i");
}

function extractEmail(addr: string | null | undefined): string | null {
  if (!addr) return null;
  const m = addr.match(/<([^>]+)>/);
  return (m ? m[1] : addr).trim().toLowerCase();
}

function stripQuoted(text: string): string {
  if (!text) return "";
  // Naiver Reply-Stripper: alles ab "Am … schrieb" / "On … wrote:" / "> " entfernen
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  const quoteHeader = /^(am\s+.+\s+schrieb|on\s+.+\s+wrote:|von:\s|from:\s|gesendet:|sent:)/i;
  for (const line of lines) {
    if (quoteHeader.test(line.trim())) break;
    if (/^>+\s?/.test(line)) continue;
    out.push(line);
  }
  return out.join("\n").trim();
}

function findTicketShortId(opts: {
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  toPlusRe: RegExp;
}): string | null {
  if (opts.to) {
    const m = opts.to.match(opts.toPlusRe);
    if (m) return m[1].toLowerCase();
  }
  if (opts.subject) {
    const m = opts.subject.match(SUBJECT_TICKET_RE);
    if (m) return m[1].toLowerCase();
  }
  const body = `${opts.text || ""}\n${opts.html || ""}`;
  const m1 = body.match(/(?:ticket|support)\s*#([0-9a-f]{8})/i);
  if (m1) return m1[1].toLowerCase();
  const m2 = body.match(/\[support\s+#([0-9a-f]{8})\]/i);
  if (m2) return m2[1].toLowerCase();
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  // Shared-Secret-Auth (optional aber empfohlen)
  if (INBOUND_SECRET) {
    const url = new URL(req.url);
    const provided = url.searchParams.get("secret") || req.headers.get("x-inbound-secret");
    if (provided !== INBOUND_SECRET) {
      console.warn("inbound-email: unauthorized — bad/missing secret");
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // SendGrid Inbound Parse sendet multipart/form-data
    const ct = req.headers.get("content-type") || "";
    let from = "", to = "", subject = "", text = "", html = "", headers = "";
    let envelope: any = null;

    if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      from = String(form.get("from") || "");
      to = String(form.get("to") || "");
      subject = String(form.get("subject") || "");
      text = String(form.get("text") || "");
      html = String(form.get("html") || "");
      headers = String(form.get("headers") || "");
      const env = form.get("envelope");
      if (env) { try { envelope = JSON.parse(String(env)); } catch { /* ignore */ } }
    } else if (ct.includes("application/json")) {
      const j = await req.json();
      from = j.from || j.From || "";
      to = j.to || j.To || "";
      subject = j.subject || j.Subject || "";
      text = j.text || j.plain || "";
      html = j.html || "";
      headers = j.headers || "";
      envelope = j.envelope || null;
    } else {
      return new Response(JSON.stringify({ error: "Unsupported content-type" }), {
        status: 415, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromEmail = extractEmail(from) || (envelope?.from ? String(envelope.from).toLowerCase() : null);
    const fromName = (from.match(/^"?([^"<]+?)"?\s*</) || [])[1]?.trim() || null;

    // Headers parsen für Message-ID, In-Reply-To, References
    const headerMap: Record<string, string> = {};
    headers.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^([^:]+):\s*(.*)$/);
      if (m) headerMap[m[1].toLowerCase()] = m[2].trim();
    });
    const messageId = headerMap["message-id"] || null;
    const inReplyTo = headerMap["in-reply-to"] || null;
    const references = headerMap["references"] || null;

    // === Inbound-Routes laden (Admin-konfigurierbar) ===
    const { data: routes } = await supabase
      .from("inbound_email_config")
      .select("local_part, reply_domain, enabled")
      .eq("enabled", true);
    const localParts = (routes || []).map((r: any) => r.local_part);
    const toPlusRe = buildToPlusRegex(localParts);

    // === Ticket-ID Erkennung ===
    let shortId = findTicketShortId({ to, subject, text, html, toPlusRe });
    let ticketId: string | null = null;

    if (shortId) {
      // shortId = erste 8 Zeichen der UUID — Lookup über Prefix
      const { data: t } = await supabase
        .from("support_tickets")
        .select("id, lead_id, sender_email, status")
        .ilike("id", `${shortId}%`)
        .limit(1)
        .maybeSingle();
      if (t) ticketId = t.id;
    }

    // Fallback: Lookup via In-Reply-To / References gegen email_message_id
    if (!ticketId && (inReplyTo || references)) {
      const candidates = [inReplyTo, ...(references || "").split(/\s+/)].filter(Boolean) as string[];
      for (const cand of candidates) {
        const cleaned = cand.replace(/[<>]/g, "");
        const { data: t } = await supabase
          .from("support_tickets")
          .select("id")
          .eq("email_message_id", cleaned)
          .limit(1)
          .maybeSingle();
        if (t) { ticketId = t.id; break; }
      }
    }

    // Letzter Fallback: Match per Sender-Email auf zuletzt geöffnetes Ticket
    if (!ticketId && fromEmail) {
      const { data: t } = await supabase
        .from("support_tickets")
        .select("id")
        .eq("sender_email", fromEmail)
        .neq("status", "closed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (t) ticketId = t.id;
    }

    let needsReview = false;
    if (!ticketId) {
      console.warn("inbound-email: no ticket match — creating Needs-Review ticket", { from: fromEmail, subject });
      needsReview = true;
      const cleanedFallback = stripQuoted(text);
      const reviewBody = [
        `⚠️ Eingehende E-Mail ohne erkennbare Ticket-ID — bitte manuell zuordnen.`,
        ``,
        `Von: ${fromName || ""} <${fromEmail || "(unbekannt)"}>`,
        `An: ${to}`,
        `Betreff: ${subject}`,
        `Message-ID: ${messageId || "—"}`,
        `In-Reply-To: ${inReplyTo || "—"}`,
        ``,
        `--- Nachricht ---`,
        cleanedFallback.slice(0, 8000),
      ].join("\n");

      const { data: reviewTicket, error: reviewErr } = await supabase
        .from("support_tickets")
        .insert({
          subject: `[Needs Review] ${subject?.slice(0, 200) || "Eingehende E-Mail"}`,
          body: reviewBody,
          status: "open",
          priority: "high",
          source: "email",
          sender_email: fromEmail,
          sender_name: fromName,
          email_message_id: messageId,
          internal_notes: "Automatisch erzeugt vom Inbound-Webhook — keine Ticket-ID erkannt.",
        })
        .select("id")
        .single();

      if (reviewErr || !reviewTicket) {
        console.error("inbound-email: needs-review ticket insert failed", reviewErr);
        const orphanHtml = `
          <p><b>🚨 Inbound-Mail OHNE Ticket-Bezug & Needs-Review-Ticket konnte NICHT angelegt werden</b></p>
          <ul><li><b>Von:</b> ${escapeHtml(fromEmail || "?")}</li><li><b>Betreff:</b> ${escapeHtml(subject)}</li></ul>
          <p>${escapeHtml(cleanedFallback.slice(0, 1500)).replace(/\n/g, "<br/>")}</p>
          <p style="color:#c00;font-size:11px">Fehler: ${escapeHtml(String(reviewErr?.message || "unknown"))}</p>
        `;
        await Promise.all([
          notifyTeams(orphanHtml, `🚨 Inbound-Mail Fehler – ${fromEmail || "?"}`),
          notifyEmail(TEAM_INBOX, `[Support] Inbound-Mail FEHLER – ${fromEmail || "?"}`, orphanHtml),
        ]);
        return new Response(JSON.stringify({ ok: false, reason: "review_ticket_failed" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      ticketId = reviewTicket.id;
      // Flow läuft normal weiter — Notifications markieren das Ticket als „Needs Review".
    }

    // === 1) Inbound-Message am Ticket speichern ===
    const cleanText = stripQuoted(text);
    const { error: msgErr } = await supabase
      .from("support_ticket_messages")
      .insert({
        ticket_id: ticketId,
        direction: "inbound",
        from_email: fromEmail,
        from_name: fromName,
        to_email: extractEmail(to),
        subject: subject.slice(0, 500),
        body_text: cleanText.slice(0, 50000),
        body_html: (html || "").slice(0, 200000),
        message_id: messageId,
        in_reply_to: inReplyTo,
        raw_payload: { envelope, headers: headerMap, original_text: text.slice(0, 5000) },
      });
    if (msgErr) console.error("inbound-email: insert message failed", msgErr);

    // === 2) Ticket-Status auf 'in_progress' setzen (Kunde hat geantwortet) ===
    const { error: tUpdErr } = await supabase
      .from("support_tickets")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", ticketId);
    if (tUpdErr) console.error("inbound-email: update ticket status failed", tUpdErr);

    // === 3) Ticket-Kontext + zugewiesener Mitarbeiter laden ===
    const { data: ticketRow } = await supabase
      .from("support_tickets")
      .select("lead_id, sender_email, assigned_to, subject, priority, teams_thread_id")
      .eq("id", ticketId)
      .maybeSingle();

    let leadId = ticketRow?.lead_id || null;
    if (!leadId && fromEmail) {
      const { data: lead } = await supabase
        .from("crm_leads")
        .select("id")
        .ilike("email", fromEmail)
        .limit(1)
        .maybeSingle();
      if (lead) leadId = lead.id;
    }

    // Activity am Lead loggen
    if (leadId) {
      const preview = cleanText.slice(0, 500) || subject;
      await supabase.from("activities").insert({
        lead_id: leadId,
        type: "email_inbound",
        content: `Antwort auf Ticket #${String(ticketId).slice(0, 8).toUpperCase()}: ${preview}`,
        metadata: { ticket_id: ticketId, from: fromEmail, subject },
      });
    }

    // === 4) Team-Benachrichtigungen (Teams + E-Mail) ===
    const ticketRef = `#${String(ticketId).slice(0, 8).toUpperCase()}`;
    const priorityBadge = needsReview
      ? "🟡 NEEDS REVIEW"
      : (ticketRow?.priority === "high" ? "🔴 HIGH" : "🟢 NORMAL");
    const headline = needsReview
      ? `🟡 Inbound-Mail OHNE Ticket-Bezug → Needs-Review-Ticket ${escapeHtml(ticketRef)}`
      : `💬 Neue Antwort auf Support-Ticket ${escapeHtml(ticketRef)}`;
    const previewHtml = escapeHtml(cleanText.slice(0, 1500)).replace(/\n/g, "<br/>");
    const notifyHtml = `
      <p><b>${headline}</b> &nbsp; ${priorityBadge}</p>
      <ul>
        <li><b>Von:</b> ${escapeHtml(fromName || "")} &lt;${escapeHtml(fromEmail || "")}&gt;</li>
        <li><b>Betreff:</b> ${escapeHtml(subject)}</li>
        ${needsReview ? "" : `<li><b>Original-Ticket:</b> ${escapeHtml(ticketRow?.subject || "—")}</li>`}
      </ul>
      ${needsReview ? "<p style=\"color:#b45309\"><b>⚠️ Bitte manuell prüfen und ggf. dem richtigen Ticket/Lead zuordnen.</b></p>" : ""}
      <p><b>Nachricht:</b><br/>${previewHtml}</p>
      <p style="color:#666;font-size:11px">Ticket-ID: ${escapeHtml(ticketId)}</p>
    `;

    // Empfänger: zugewiesener Mitarbeiter (falls vorhanden) + Team-Inbox als CC
    const recipients = new Set<string>([TEAM_INBOX]);
    if (ticketRow?.assigned_to) {
      const { data: assignee } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", ticketRow.assigned_to)
        .maybeSingle();
      if (assignee?.email) recipients.add(assignee.email);
    }

    await Promise.all([
      notifyTeams(notifyHtml, needsReview
        ? `🟡 Needs Review ${ticketRef} – ${fromEmail || ""}`
        : `Antwort ${ticketRef} – ${fromEmail || ""}`),
      ...Array.from(recipients).map((to) =>
        notifyEmail(to, needsReview
          ? `[Support ${ticketRef}] 🟡 Needs Review – ${fromEmail || "Unbekannt"}`
          : `[Support ${ticketRef}] Neue Antwort von ${fromEmail || "Kunde"}`, notifyHtml),
      ),
    ]);

    console.log("inbound-email: processed + notified", { ticketId, recipients: [...recipients] });

    return new Response(JSON.stringify({ ok: true, ticket_id: ticketId, lead_id: leadId, notified: [...recipients] }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("inbound-email: error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
