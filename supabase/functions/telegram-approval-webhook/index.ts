// telegram-approval-webhook
// Verarbeitet Inline-Button-Callbacks UND Reply-Nachrichten aus Telegram für Angebotsfreigaben.
// Jede Aktion wird sofort als Timeline-Eintrag in `activities` gespeichert (mit Bearbeiter-Nennung).
//
// Callback-Daten-Schema:
//   offer:approve:<draftId>
//   offer:reject:<draftId>
//   offer:negotiate:<draftId>           → zeigt Sub-Optionen (price/scope/timing/other)
//   offer:negotiate-opt:<draftId>:<opt> → führt Negotiate mit Sub-Option aus
//   offer:info:<draftId>                → fragt per ForceReply nach Kommentar
//
// Reply-Nachrichten (mit reply_to_message.message_id == draft.telegram_message_id) werden
// als Zusatz-Kommentar zur letzten Aktion in der Timeline gespeichert.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const APP_URL = "https://www.ki-automationen.io";
const GATEWAY = "https://connector-gateway.lovable.dev/telegram";

const NEGOTIATE_OPTIONS: Record<string, string> = {
  price: "Preis nachverhandeln",
  scope: "Scope/Leistung anpassen",
  timing: "Timing/Termin anpassen",
  other: "Sonstiges",
};

async function tg(method: string, body: Record<string, unknown>) {
  const r = await fetch(`${GATEWAY}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TELEGRAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) console.error(`Telegram ${method} failed:`, await r.text());
  return r.json().catch(() => ({}));
}

function tgUserName(from: any): string {
  return (
    from?.username ||
    `${from?.first_name || ""} ${from?.last_name || ""}`.trim() ||
    "unbekannt"
  );
}

// Schreibt eine Activity (Timeline-Eintrag) als Service-Role.
// `activities.user_id` ist NOT NULL → wir verwenden den lead-owner als Bearbeiter
// (Telegram-Identität bleibt im content + metadata sichtbar).
async function logActivity(
  supabase: ReturnType<typeof createClient>,
  args: {
    leadId: string;
    ownerProfileId: string | null;
    content: string;
    metadata: Record<string, unknown>;
  },
) {
  // Fallback: wenn Lead keinen Owner hat, irgendeinen Admin nehmen, sonst überspringen wir.
  let userId = args.ownerProfileId;
  if (!userId) {
    const { data: anyAdmin } = await supabase
      .from("profiles")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    userId = anyAdmin?.id ?? null;
  }
  if (!userId) {
    console.warn("activities skipped: no user_id available");
    return;
  }

  const { error } = await supabase.from("activities").insert({
    lead_id: args.leadId,
    user_id: userId,
    type: "notiz",
    content: args.content.length > 4900 ? args.content.slice(0, 4900) + "…" : args.content,
    metadata: args.metadata,
  });
  if (error) console.error("activities insert failed:", error);
}

async function getLeadOwner(
  supabase: ReturnType<typeof createClient>,
  leadId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("crm_leads")
    .select("owner_user_id")
    .eq("id", leadId)
    .maybeSingle();
  return data?.owner_user_id ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Internal-only
  const cronHeader = req.headers.get("x-cron-secret");
  if (!CRON_SECRET || cronHeader !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const payload = await req.json();
    const { callback_query, message } = payload;

    // === Pfad A: Reply-Nachricht (Kommentar zu einer Aktion) =================
    if (message && message.reply_to_message?.message_id) {
      const replyToId = message.reply_to_message.message_id;
      const text: string = (message.text || "").trim();
      const fromUser = tgUserName(message.from);

      if (!text) {
        return new Response(JSON.stringify({ ok: true, skipped: "empty reply" }), { headers: corsHeaders });
      }

      const { data: draft } = await supabase
        .from("offer_drafts")
        .select("id, lead_id, status, telegram_message_id")
        .eq("telegram_message_id", replyToId)
        .maybeSingle();

      if (!draft) {
        return new Response(JSON.stringify({ ok: true, skipped: "no draft for reply" }), { headers: corsHeaders });
      }

      const owner = await getLeadOwner(supabase, draft.lead_id);
      const truncated = text.length > 1500 ? text.slice(0, 1500) + "…" : text;
      await logActivity(supabase, {
        leadId: draft.lead_id,
        ownerProfileId: owner,
        content: `💬 Telegram-Kommentar von ${fromUser} zu Angebotsentwurf (Status: ${draft.status}):\n\n${truncated}`,
        metadata: {
          source: "telegram_reply",
          offer_draft_id: draft.id,
          telegram_user: fromUser,
          telegram_message_id: message.message_id,
          reply_to_message_id: replyToId,
          comment: truncated,
          draft_status_at_comment: draft.status,
          captured_at: new Date().toISOString(),
        },
      });

      // Kurze Bestätigung zurück (kein neues Force-Reply)
      if (message.chat?.id) {
        await tg("sendMessage", {
          chat_id: message.chat.id,
          reply_to_message_id: message.message_id,
          text: `✅ Kommentar in CRM-Timeline gespeichert.`,
          disable_notification: true,
        });
      }

      return new Response(JSON.stringify({ ok: true, action: "reply_logged" }), { headers: corsHeaders });
    }

    // === Pfad B: Inline-Button (callback_query) ==============================
    if (!callback_query) {
      return new Response(JSON.stringify({ ok: true, skipped: "no callback_query/message" }), { headers: corsHeaders });
    }

    const cbId = callback_query.id;
    const data: string = callback_query.data || "";
    const fromUser = tgUserName(callback_query.from);
    const chatId = callback_query.message?.chat?.id;
    const messageId = callback_query.message?.message_id;
    const originalText: string = callback_query.message?.text || callback_query.message?.caption || "";

    const parts = data.split(":");
    if (parts[0] !== "offer" || parts.length < 3) {
      await tg("answerCallbackQuery", { callback_query_id: cbId, text: "Unbekannte Aktion" });
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    const action = parts[1];
    const draftId = parts[2];
    const subOption = parts[3]; // bei negotiate-opt

    const { data: draft, error: dErr } = await supabase
      .from("offer_drafts")
      .select("id, status, lead_id, qa_passed, suggested_price_cents, telegram_message_id")
      .eq("id", draftId)
      .maybeSingle();

    if (dErr || !draft) {
      await tg("answerCallbackQuery", { callback_query_id: cbId, text: "Entwurf nicht gefunden", show_alert: true });
      return new Response(JSON.stringify({ ok: false, error: "draft not found" }), { headers: corsHeaders });
    }

    if (draft.status === "approved" || draft.status === "rejected") {
      await tg("answerCallbackQuery", {
        callback_query_id: cbId,
        text: `Bereits ${draft.status === "approved" ? "freigegeben" : "abgelehnt"}.`,
        show_alert: true,
      });
      return new Response(JSON.stringify({ ok: true, skipped: "already processed" }), { headers: corsHeaders });
    }

    const owner = await getLeadOwner(supabase, draft.lead_id);
    const nowIso = new Date().toISOString();
    const baseMeta = {
      offer_draft_id: draftId,
      telegram_user: fromUser,
      telegram_chat_id: chatId,
      telegram_message_id: messageId,
      reviewed_at: nowIso,
      source: "telegram_button",
    };

    // ---- approve ----
    if (action === "approve") {
      if (draft.qa_passed === false) {
        await tg("answerCallbackQuery", {
          callback_query_id: cbId,
          text: "QA nicht bestanden – bitte im CRM korrigieren.",
          show_alert: true,
        });
        await logActivity(supabase, {
          leadId: draft.lead_id,
          ownerProfileId: owner,
          content: `⛔ ${fromUser} versuchte Freigabe via Telegram, abgelehnt: QA nicht bestanden.`,
          metadata: { ...baseMeta, action: "approve_blocked_qa" },
        });
        return new Response(JSON.stringify({ ok: false, error: "qa failed" }), { headers: corsHeaders });
      }

      const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
      const { data: created, error: insErr } = await supabase
        .from("offers")
        .insert({
          lead_id: draft.lead_id,
          status: "sent",
          offer_json: { source: "offer_draft", draft_id: draftId, telegram_approval: true, approved_by_telegram_user: fromUser },
          public_token: token,
          sent_at: nowIso,
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select("id")
        .single();
      if (insErr) {
        await tg("answerCallbackQuery", { callback_query_id: cbId, text: `Fehler: ${insErr.message}`, show_alert: true });
        return new Response(JSON.stringify({ ok: false, error: insErr.message }), { headers: corsHeaders });
      }
      const offerId = created!.id;

      await supabase
        .from("offer_drafts")
        .update({
          status: "approved",
          converted_offer_id: offerId,
          reviewed_by_telegram_user: fromUser,
          reviewed_at: nowIso,
        })
        .eq("id", draftId);

      await supabase
        .from("pipeline_items")
        .update({ stage: "offer_sent", stage_updated_at: nowIso })
        .eq("lead_id", draft.lead_id)
        .in("stage", ["offer_draft", "analysis_ready", "setter_call_done", "setter_call_scheduled", "new_lead"]);

      await logActivity(supabase, {
        leadId: draft.lead_id,
        ownerProfileId: owner,
        content: `✅ Angebotsentwurf freigegeben via Telegram durch ${fromUser} → Angebot versendet, Pipeline auf "offer_sent", Follow-up in 3 Tagen.`,
        metadata: { ...baseMeta, action: "approved", offer_id: offerId },
      });

      if (chatId && messageId) {
        await tg("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text: `${originalText}\n\n✅ <b>FREIGEGEBEN</b> von ${fromUser} um ${new Date().toLocaleString("de-DE")}`,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[{ text: "→ Im CRM öffnen", url: `${APP_URL}/app/leads` }]],
          },
        });
      }

      await tg("answerCallbackQuery", { callback_query_id: cbId, text: "✅ Freigegeben & versendet" });
      return new Response(JSON.stringify({ ok: true, action: "approved" }), { headers: corsHeaders });
    }

    // ---- reject ----
    if (action === "reject") {
      await supabase
        .from("offer_drafts")
        .update({
          status: "rejected",
          rejection_reason: "Per Telegram abgelehnt",
          reviewed_by_telegram_user: fromUser,
          reviewed_at: nowIso,
        })
        .eq("id", draftId);

      await supabase
        .from("pipeline_items")
        .update({ stage: "analysis_ready", stage_updated_at: nowIso })
        .eq("lead_id", draft.lead_id);

      if (owner) {
        await supabase.from("crm_tasks").insert({
          assigned_user_id: owner,
          lead_id: draft.lead_id,
          type: "review_offer",
          title: "Angebotsentwurf überarbeiten",
          description: `Per Telegram abgelehnt von ${fromUser}. Bitte Inhalt/Preis prüfen und neu freigeben.`,
          due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "open",
          meta: { offer_draft_id: draftId, telegram_user: fromUser, source: "telegram_reject" },
        });
      }

      await logActivity(supabase, {
        leadId: draft.lead_id,
        ownerProfileId: owner,
        content: `❌ Angebotsentwurf abgelehnt via Telegram durch ${fromUser} → Pipeline auf "analysis_ready", Korrektur-Task angelegt.`,
        metadata: { ...baseMeta, action: "rejected" },
      });

      if (chatId && messageId) {
        await tg("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text: `${originalText}\n\n❌ <b>ABGELEHNT</b> von ${fromUser} um ${new Date().toLocaleString("de-DE")}`,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[{ text: "→ Im CRM korrigieren", url: `${APP_URL}/app/leads` }]],
          },
        });
      }

      // Optionalen Kommentar einsammeln
      if (chatId) {
        await tg("sendMessage", {
          chat_id: chatId,
          text: `💬 Optional: Antworte auf diese Nachricht mit dem Ablehnungsgrund — er wird in der CRM-Timeline ergänzt.`,
          reply_markup: { force_reply: true, selective: true, input_field_placeholder: "Grund der Ablehnung…" },
          reply_to_message_id: messageId,
        });
      }

      await tg("answerCallbackQuery", { callback_query_id: cbId, text: "❌ Abgelehnt" });
      return new Response(JSON.stringify({ ok: true, action: "rejected" }), { headers: corsHeaders });
    }

    // ---- negotiate (Schritt 1: Sub-Optionen anzeigen) ----
    if (action === "negotiate") {
      // Aktivitäts-Eintrag sofort: User hat Nachverhandeln angetippt
      await logActivity(supabase, {
        leadId: draft.lead_id,
        ownerProfileId: owner,
        content: `🔁 ${fromUser} hat in Telegram „Nachverhandeln" angetippt — wartet auf Sub-Option.`,
        metadata: { ...baseMeta, action: "negotiate_intent" },
      });

      if (chatId && messageId) {
        await tg("sendMessage", {
          chat_id: chatId,
          reply_to_message_id: messageId,
          text: `🔁 <b>Nachverhandeln</b> – worum geht es?`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "💶 Preis", callback_data: `offer:negotiate-opt:${draftId}:price` },
                { text: "📦 Scope", callback_data: `offer:negotiate-opt:${draftId}:scope` },
              ],
              [
                { text: "📅 Timing", callback_data: `offer:negotiate-opt:${draftId}:timing` },
                { text: "✏️ Sonstiges", callback_data: `offer:negotiate-opt:${draftId}:other` },
              ],
            ],
          },
        });
      }
      await tg("answerCallbackQuery", { callback_query_id: cbId, text: "Bitte Option wählen" });
      return new Response(JSON.stringify({ ok: true, action: "negotiate_prompted" }), { headers: corsHeaders });
    }

    // ---- negotiate-opt (Schritt 2: Sub-Option ausgewählt) ----
    if (action === "negotiate-opt") {
      const optKey = subOption || "other";
      const optLabel = NEGOTIATE_OPTIONS[optKey] || NEGOTIATE_OPTIONS.other;

      await supabase
        .from("offer_drafts")
        .update({
          status: "negotiation",
          rejection_reason: `Nachverhandeln (${optLabel})`,
          reviewed_by_telegram_user: fromUser,
          reviewed_at: nowIso,
        })
        .eq("id", draftId);

      const { error: stageErr } = await supabase
        .from("pipeline_items")
        .update({ stage: "negotiation", stage_updated_at: nowIso })
        .eq("lead_id", draft.lead_id);
      if (stageErr) {
        await supabase
          .from("pipeline_items")
          .update({ stage: "analysis_ready", stage_updated_at: nowIso })
          .eq("lead_id", draft.lead_id);
      }

      if (owner) {
        await supabase.from("crm_tasks").insert({
          assigned_user_id: owner,
          lead_id: draft.lead_id,
          type: "negotiate_offer",
          title: `Nachverhandeln: ${optLabel}`,
          description: `Per Telegram zur Nachverhandlung markiert von ${fromUser} (Option: ${optLabel}). Punkt mit Kunden klären, danach Entwurf anpassen.`,
          due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "open",
          meta: { offer_draft_id: draftId, telegram_user: fromUser, source: "telegram_negotiate", sub_option: optKey },
        });
      }

      await logActivity(supabase, {
        leadId: draft.lead_id,
        ownerProfileId: owner,
        content: `🔁 Angebotsentwurf zur Nachverhandlung via Telegram durch ${fromUser} → Option: „${optLabel}". Pipeline auf "negotiation", Task angelegt.`,
        metadata: { ...baseMeta, action: "negotiation", sub_option: optKey, sub_option_label: optLabel },
      });

      if (chatId && messageId) {
        await tg("editMessageText", {
          chat_id: chatId,
          message_id: draft.telegram_message_id || messageId,
          text: `${originalText}\n\n🔁 <b>NACHVERHANDELN</b> – ${optLabel} – markiert von ${fromUser} um ${new Date().toLocaleString("de-DE")}`,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[{ text: "→ Im CRM öffnen", url: `${APP_URL}/app/leads` }]],
          },
        });
        await tg("sendMessage", {
          chat_id: chatId,
          text: `💬 Optional: Antworte auf die ursprüngliche Angebots-Nachricht mit Details zur Nachverhandlung — sie landen in der CRM-Timeline.`,
          reply_markup: { force_reply: true, selective: true, input_field_placeholder: `Details zu „${optLabel}"…` },
          reply_to_message_id: draft.telegram_message_id || messageId,
        });
      }

      await tg("answerCallbackQuery", { callback_query_id: cbId, text: `🔁 Nachverhandeln: ${optLabel}` });
      return new Response(JSON.stringify({ ok: true, action: "negotiation", sub_option: optKey }), { headers: corsHeaders });
    }

    // ---- info (Rückfrage) ----
    if (action === "info") {
      await supabase
        .from("offer_drafts")
        .update({
          status: "info_requested",
          rejection_reason: "Per Telegram zur Kunden-Rückfrage markiert",
          reviewed_by_telegram_user: fromUser,
          reviewed_at: nowIso,
        })
        .eq("id", draftId);

      const { error: stageErr } = await supabase
        .from("pipeline_items")
        .update({ stage: "info_requested", stage_updated_at: nowIso })
        .eq("lead_id", draft.lead_id);
      if (stageErr) {
        await supabase
          .from("pipeline_items")
          .update({ stage: "analysis_ready", stage_updated_at: nowIso })
          .eq("lead_id", draft.lead_id);
      }

      if (owner) {
        await supabase.from("crm_tasks").insert({
          assigned_user_id: owner,
          lead_id: draft.lead_id,
          type: "request_info",
          title: "Rückfrage an Kunden stellen",
          description: `Per Telegram zur Rückfrage markiert von ${fromUser}. Offene Punkte beim Kunden klären.`,
          due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "open",
          meta: { offer_draft_id: draftId, telegram_user: fromUser, source: "telegram_info_request" },
        });
      }

      await logActivity(supabase, {
        leadId: draft.lead_id,
        ownerProfileId: owner,
        content: `❓ Angebotsentwurf zur Kunden-Rückfrage markiert via Telegram durch ${fromUser} → Pipeline auf "info_requested", Task angelegt.`,
        metadata: { ...baseMeta, action: "info_requested" },
      });

      if (chatId && messageId) {
        await tg("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text: `${originalText}\n\n❓ <b>RÜCKFRAGE OFFEN</b> – markiert von ${fromUser} um ${new Date().toLocaleString("de-DE")}`,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[{ text: "→ Im CRM öffnen", url: `${APP_URL}/app/leads` }]],
          },
        });
        await tg("sendMessage", {
          chat_id: chatId,
          text: `💬 Welche Rückfrage genau? Antworte auf die ursprüngliche Angebots-Nachricht — sie landet in der CRM-Timeline.`,
          reply_markup: { force_reply: true, selective: true, input_field_placeholder: "Welche Info brauchen wir vom Kunden?" },
          reply_to_message_id: messageId,
        });
      }

      await tg("answerCallbackQuery", { callback_query_id: cbId, text: "❓ Rückfrage offen" });
      return new Response(JSON.stringify({ ok: true, action: "info_requested" }), { headers: corsHeaders });
    }

    await tg("answerCallbackQuery", { callback_query_id: cbId, text: "Unbekannte Aktion" });
    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (e: any) {
    console.error("telegram-approval-webhook error:", e);
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
