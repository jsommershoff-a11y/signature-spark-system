// telegram-approval-webhook
// Verarbeitet Inline-Button-Callbacks aus Telegram für Angebotsfreigaben.
// Wird vom telegram-poll aufgerufen, sobald ein callback_query eintrifft.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Internal-only: requires CRON_SECRET (called by telegram-poll)
  const cronHeader = req.headers.get("x-cron-secret");
  if (!CRON_SECRET || cronHeader !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { callback_query } = await req.json();
    if (!callback_query) {
      return new Response(JSON.stringify({ ok: true, skipped: "no callback_query" }), { headers: corsHeaders });
    }

    const cbId = callback_query.id;
    const data: string = callback_query.data || "";
    const fromUser = callback_query.from?.username || `${callback_query.from?.first_name || ""} ${callback_query.from?.last_name || ""}`.trim();
    const chatId = callback_query.message?.chat?.id;
    const messageId = callback_query.message?.message_id;
    const originalText: string = callback_query.message?.text || callback_query.message?.caption || "";

    // Parse callback data: "offer:approve:<draft_id>" or "offer:reject:<draft_id>"
    const parts = data.split(":");
    if (parts[0] !== "offer" || parts.length < 3) {
      await tg("answerCallbackQuery", { callback_query_id: cbId, text: "Unbekannte Aktion" });
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    const action = parts[1];
    const draftId = parts[2];

    const { data: draft, error: dErr } = await supabase
      .from("offer_drafts")
      .select("id, status, lead_id, qa_passed, suggested_price_cents")
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

    if (action === "approve") {
      if (draft.qa_passed === false) {
        await tg("answerCallbackQuery", {
          callback_query_id: cbId,
          text: "QA nicht bestanden – bitte im CRM korrigieren.",
          show_alert: true,
        });
        return new Response(JSON.stringify({ ok: false, error: "qa failed" }), { headers: corsHeaders });
      }

      // Use existing RPC to materialize draft → offer (sets status='approved' on draft)
      const { data: offerId, error: rpcErr } = await supabase.rpc("approve_offer_draft", { _draft_id: draftId });
      if (rpcErr) {
        // RPC requires a real auth user. Fallback: do approval inline via service role.
        const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
        const { data: created, error: insErr } = await supabase
          .from("offers")
          .insert({
            lead_id: draft.lead_id,
            status: "sent",
            offer_json: { source: "offer_draft", draft_id: draftId, telegram_approval: true },
            public_token: token,
            sent_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select("id")
          .single();
        if (insErr) {
          await tg("answerCallbackQuery", { callback_query_id: cbId, text: `Fehler: ${insErr.message}`, show_alert: true });
          return new Response(JSON.stringify({ ok: false, error: insErr.message }), { headers: corsHeaders });
        }
        await supabase
          .from("offer_drafts")
          .update({
            status: "approved",
            converted_offer_id: created!.id,
            reviewed_by_telegram_user: fromUser,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", draftId);
      } else {
        await supabase
          .from("offer_drafts")
          .update({
            reviewed_by_telegram_user: fromUser,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", draftId);
      }

      // Activity log
      await supabase.from("activities").insert({
        lead_id: draft.lead_id,
        activity_type: "offer_draft_approved",
        channel: "telegram",
        direction: "inbound",
        content: `Angebotsentwurf via Telegram freigegeben von ${fromUser || "unbekannt"}.`,
        metadata: { offer_draft_id: draftId, telegram_user: fromUser },
      });

      // Update Telegram message
      if (chatId && messageId) {
        await tg("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text: `${originalText}\n\n✅ <b>FREIGEGEBEN</b> von ${fromUser || "—"} um ${new Date().toLocaleString("de-DE")}`,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[{ text: "→ Im CRM öffnen", url: `${APP_URL}/app/leads` }]],
          },
        });
      }

      await tg("answerCallbackQuery", { callback_query_id: cbId, text: "✅ Angebot freigegeben & versendet" });
      return new Response(JSON.stringify({ ok: true, action: "approved" }), { headers: corsHeaders });
    }

    if (action === "reject") {
      await supabase
        .from("offer_drafts")
        .update({
          status: "rejected",
          rejection_reason: "Per Telegram abgelehnt",
          reviewed_by_telegram_user: fromUser,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", draftId);

      // Pipeline-Stage zurück auf analysis_ready setzen
      await supabase
        .from("pipeline_items")
        .update({ stage: "analysis_ready", stage_updated_at: new Date().toISOString() })
        .eq("lead_id", draft.lead_id);

      await supabase.from("activities").insert({
        lead_id: draft.lead_id,
        activity_type: "offer_draft_rejected",
        channel: "telegram",
        direction: "inbound",
        content: `Angebotsentwurf via Telegram abgelehnt von ${fromUser || "unbekannt"}.`,
        metadata: { offer_draft_id: draftId, telegram_user: fromUser },
      });

      if (chatId && messageId) {
        await tg("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text: `${originalText}\n\n❌ <b>ABGELEHNT</b> von ${fromUser || "—"} um ${new Date().toLocaleString("de-DE")}`,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[{ text: "→ Im CRM korrigieren", url: `${APP_URL}/app/leads` }]],
          },
        });
      }

      await tg("answerCallbackQuery", { callback_query_id: cbId, text: "❌ Entwurf abgelehnt" });
      return new Response(JSON.stringify({ ok: true, action: "rejected" }), { headers: corsHeaders });
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
