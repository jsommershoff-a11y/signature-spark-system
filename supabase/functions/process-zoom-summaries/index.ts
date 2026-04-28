// process-zoom-summaries
// Stündlich getriggert via pg_cron. Liest Gmail nach Meeting-Summaries,
// extrahiert via GPT-5, matcht gegen crm_leads, erzeugt Offer-Drafts oder Tasks.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const GMAIL_GW = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const GOOGLE_MAIL_API_KEY = Deno.env.get("GOOGLE_MAIL_API_KEY")!;
const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
const TELEGRAM_NOTIFY_CHAT_ID = Deno.env.get("TELEGRAM_NOTIFY_CHAT_ID");
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Broad filter: any meeting summary mail. Matches Zoom AI Companion, Fathom, Fireflies,
// Otter, tl;dv, Read.ai, Granola, Krisp, Avoma, Loom Summary, Microsoft Teams Recap.
const GMAIL_QUERY = [
  '(',
  'subject:(Zusammenfassung OR Summary OR "Meeting Summary" OR "Besprechungszusammenfassung"',
  ' OR "Meeting Recap" OR "AI Companion" OR "Recording is available" OR "Aufzeichnung")',
  ' OR from:(zoom.us OR fathom.video OR fireflies.ai OR fyi.fyi OR otter.ai OR tldv.io',
  ' OR read.ai OR granola.ai OR krisp.ai OR avoma.com OR loom.com OR microsoft.com)',
  ') -in:spam -in:trash newer_than:3d',
].join('');

async function sendTelegram(text: string) {
  if (!TELEGRAM_API_KEY || !TELEGRAM_NOTIFY_CHAT_ID) return;
  try {
    await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_NOTIFY_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error("Telegram send failed:", e);
  }
}

async function gmailFetch(path: string) {
  const r = await fetch(`${GMAIL_GW}${path}`, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
    },
  });
  if (!r.ok) throw new Error(`Gmail ${path} → ${r.status}: ${await r.text()}`);
  return r.json();
}

function decodeBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  try {
    return new TextDecoder().decode(Uint8Array.from(atob(b64 + pad), (c) => c.charCodeAt(0)));
  } catch {
    return "";
  }
}

function extractBody(payload: any): string {
  if (!payload) return "";
  if (payload.body?.data) return decodeBase64Url(payload.body.data);
  if (payload.parts) {
    // Prefer text/plain
    for (const p of payload.parts) {
      if (p.mimeType === "text/plain" && p.body?.data) return decodeBase64Url(p.body.data);
    }
    for (const p of payload.parts) {
      if (p.mimeType === "text/html" && p.body?.data) {
        return decodeBase64Url(p.body.data).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      }
    }
    for (const p of payload.parts) {
      const nested = extractBody(p);
      if (nested) return nested;
    }
  }
  return "";
}

function getHeader(headers: any[], name: string): string {
  return headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

function extractEmails(text: string): string[] {
  const re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  return Array.from(new Set((text.match(re) || []).map((e) => e.toLowerCase())));
}

async function aiExtract(emailBody: string, subject: string): Promise<any> {
  const sys = `Du analysierst Zoom/Meeting-Zusammenfassungen für ein deutsches Vertriebs-CRM (KI-Automatisierungen).
Extrahiere strukturierte Daten. Antworte AUSSCHLIESSLICH via Tool-Call.`;

  const r = await fetch(AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-5",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: `Betreff: ${subject}\n\n${emailBody.slice(0, 15000)}` },
      ],
      tools: [{
        type: "function",
        function: {
          name: "extract_meeting_summary",
          description: "Strukturierte Extraktion einer Meeting-Zusammenfassung",
          parameters: {
            type: "object",
            properties: {
              meeting_topic: { type: "string", description: "Thema des Meetings" },
              meeting_date_iso: { type: "string", description: "ISO-Datum des Meetings, leer wenn unbekannt" },
              participants: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    role: { type: "string" },
                  },
                  required: ["name"],
                },
              },
              summary: { type: "string", description: "2-4 Sätze Kernzusammenfassung" },
              pain_points: { type: "array", items: { type: "string" } },
              desired_services: { type: "array", items: { type: "string" } },
              objections: { type: "array", items: { type: "string" } },
              next_steps: { type: "array", items: { type: "string" } },
              followup_requested: { type: "boolean" },
              intent: {
                type: "string",
                enum: ["interest", "followup", "rejection", "unclear"],
                description: "Hauptabsicht: interest=Angebot machen, followup=Wiedervorlage, rejection=Absage, unclear=manuelle Prüfung",
              },
              close_probability: { type: "number", description: "0-100" },
              urgency: { type: "string", enum: ["low", "medium", "high"] },
              budget_signal: { type: "string" },
              decision_maker_present: { type: "boolean" },
            },
            required: ["participants", "summary", "intent", "pain_points", "next_steps"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "extract_meeting_summary" } },
    }),
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`AI extract failed [${r.status}]: ${t}`);
  }
  const data = await r.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("AI returned no tool call");
  return { extraction: JSON.parse(args), tokens: data.usage?.total_tokens };
}

async function matchLead(supabase: any, emails: string[]): Promise<{ leadId: string | null; via: string; confidence: number }> {
  for (const e of emails) {
    const { data } = await supabase
      .from("crm_leads")
      .select("id, email")
      .ilike("email", e)
      .limit(1)
      .maybeSingle();
    if (data?.id) return { leadId: data.id, via: `email:${e}`, confidence: 1.0 };
  }
  return { leadId: null, via: "none", confidence: 0 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth: cron-secret OR admin JWT
  const cronHeader = req.headers.get("x-cron-secret");
  const isCron = CRON_SECRET && cronHeader === CRON_SECRET;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  if (!isCron) {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
    const token = auth.replace("Bearer ", "");
    const { data: u } = await supabase.auth.getUser(token);
    if (!u?.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const isAdmin = roles?.some((r: any) => r.role === "admin");
    if (!isAdmin) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });
  }

  // Create run log
  const { data: runRow } = await supabase
    .from("zoom_summary_runs")
    .insert({ triggered_by: isCron ? "cron" : "manual", status: "running" })
    .select("id")
    .single();
  const runId = runRow!.id;

  const stats = { scanned: 0, parsed: 0, matched: 0, pending: 0, drafted: 0, followups: 0, errors: [] as any[] };

  try {
    // List recent meeting summary mails
    const list = await gmailFetch(`/users/me/messages?maxResults=25&q=${encodeURIComponent(GMAIL_QUERY)}`);
    const messages = list.messages || [];
    stats.scanned = messages.length;

    for (const m of messages) {
      try {
        // Skip if already processed
        const { data: existing } = await supabase
          .from("zoom_summaries")
          .select("id")
          .eq("gmail_message_id", m.id)
          .maybeSingle();
        if (existing) continue;

        const msg = await gmailFetch(`/users/me/messages/${m.id}?format=full`);
        const headers = msg.payload?.headers || [];
        const subject = getHeader(headers, "Subject");
        const from = getHeader(headers, "From");
        const dateStr = getHeader(headers, "Date");
        const body = extractBody(msg.payload);
        if (!body || body.length < 100) continue;

        // AI extract
        const { extraction, tokens } = await aiExtract(body, subject);
        stats.parsed++;

        // Collect candidate emails: from-header + participants + body
        const candidateEmails = new Set<string>();
        extractEmails(from).forEach((e) => candidateEmails.add(e));
        for (const p of extraction.participants || []) {
          if (p.email) candidateEmails.add(p.email.toLowerCase());
        }
        // body emails (filtered: skip zoom/fireflies/fathom internals)
        extractEmails(body)
          .filter((e) => !/(zoom\.us|fireflies\.ai|fathom\.video|fyi\.fyi|googleapis|noreply|no-reply)/i.test(e))
          .slice(0, 10)
          .forEach((e) => candidateEmails.add(e));

        const match = await matchLead(supabase, Array.from(candidateEmails));

        // Insert summary
        const { data: summary } = await supabase
          .from("zoom_summaries")
          .insert({
            gmail_message_id: m.id,
            gmail_thread_id: msg.threadId,
            subject,
            from_address: from,
            received_at: dateStr ? new Date(dateStr).toISOString() : null,
            meeting_topic: extraction.meeting_topic,
            meeting_date: extraction.meeting_date_iso || null,
            participants: extraction.participants,
            raw_summary: body.slice(0, 20000),
            ai_extraction: { ...extraction, ai_tokens: tokens },
            intent: extraction.intent,
            matched_lead_id: match.leadId,
            matched_via: match.via,
            match_confidence: match.confidence,
          })
          .select("id")
          .single();

        if (!match.leadId) {
          // Pending match
          await supabase.from("pending_zoom_matches").insert({
            zoom_summary_id: summary!.id,
            participants: extraction.participants,
            reason: `Keine E-Mail-Adresse aus ${candidateEmails.size} Kandidaten matchte einen bestehenden Lead.`,
          });
          stats.pending++;
          await sendTelegram(
            `🟡 <b>Zoom-Mail ohne Lead-Match</b>\nThema: ${extraction.meeting_topic || subject}\nTeilnehmer: ${(extraction.participants || []).map((p: any) => p.name).join(", ")}\n→ Manuelle Prüfung im CRM`,
          );
          continue;
        }

        stats.matched++;

        // Branch by intent
        if (extraction.intent === "interest") {
          // Trigger offer-draft generator
          try {
            const r = await fetch(`${SUPABASE_URL}/functions/v1/generate-offer-draft`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "x-cron-secret": CRON_SECRET || "",
              },
              body: JSON.stringify({
                lead_id: match.leadId,
                zoom_summary_id: summary!.id,
              }),
            });
            if (r.ok) stats.drafted++;
            else stats.errors.push({ stage: "offer-draft", msg: await r.text() });
          } catch (e: any) {
            stats.errors.push({ stage: "offer-draft", msg: e.message });
          }
        } else if (extraction.intent === "followup" || extraction.followup_requested) {
          // Get owner of lead to assign task
          const { data: lead } = await supabase
            .from("crm_leads")
            .select("owner_user_id, first_name, last_name")
            .eq("id", match.leadId)
            .maybeSingle();
          if (lead?.owner_user_id) {
            await supabase.from("crm_tasks").insert({
              assigned_user_id: lead.owner_user_id,
              lead_id: match.leadId,
              type: "followup",
              title: `Follow-up: ${extraction.meeting_topic || "Zoom-Call"}`,
              description: `Aus Zoom-Zusammenfassung:\n${extraction.summary}\n\nNächste Schritte:\n${(extraction.next_steps || []).map((s: string) => `• ${s}`).join("\n")}`,
              due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: "open",
            });
            stats.followups++;
          }
        }

        // Activity log
        await supabase.from("activities").insert({
          lead_id: match.leadId,
          activity_type: "zoom_summary_processed",
          channel: "email",
          direction: "inbound",
          content: `${extraction.intent.toUpperCase()}: ${extraction.summary}`.slice(0, 4900),
          metadata: { summary_id: summary!.id, intent: extraction.intent, close_probability: extraction.close_probability },
        }).then(() => {}, () => {});
      } catch (e: any) {
        console.error("Per-message error:", e);
        stats.errors.push({ msg_id: m.id, msg: e.message });
      }
    }

    await supabase
      .from("zoom_summary_runs")
      .update({
        finished_at: new Date().toISOString(),
        status: stats.errors.length > 0 ? "partial" : "success",
        emails_scanned: stats.scanned,
        summaries_parsed: stats.parsed,
        leads_matched: stats.matched,
        pending_matches: stats.pending,
        offers_drafted: stats.drafted,
        followups_created: stats.followups,
        errors: stats.errors,
      })
      .eq("id", runId);

    if (stats.parsed > 0) {
      await sendTelegram(
        `📞 <b>Zoom-Sync</b>\n${stats.parsed} neue Summaries\n✅ ${stats.matched} gematcht · 🟡 ${stats.pending} pending\n📝 ${stats.drafted} Angebotsentwürfe · 🔁 ${stats.followups} Follow-ups`,
      );
    }

    return new Response(JSON.stringify({ ok: true, ...stats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("Run failed:", e);
    await supabase
      .from("zoom_summary_runs")
      .update({
        finished_at: new Date().toISOString(),
        status: "failed",
        errors: [...stats.errors, { fatal: e.message }],
      })
      .eq("id", runId);
    await sendTelegram(`🚨 <b>Zoom-Sync FEHLER</b>\n${e.message}`);
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
