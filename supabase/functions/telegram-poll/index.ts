// telegram-poll
// Long-polling Loop für Telegram getUpdates.
// Wird minütlich von pg_cron getriggert, läuft bis zu 55 Sek.
// Verarbeitet eingehende callback_query (Approval-Buttons) und delegiert an telegram-approval-webhook.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";
const MAX_RUNTIME_MS = 55_000;
const MIN_REMAINING_MS = 5_000;

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Internal-only
  const cronHeader = req.headers.get("x-cron-secret");
  if (cronHeader !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let totalProcessed = 0;
  let currentOffset: number;

  const { data: state, error: stateErr } = await supabase
    .from("telegram_bot_state")
    .select("update_offset")
    .eq("id", 1)
    .single();

  if (stateErr) {
    return new Response(JSON.stringify({ error: stateErr.message }), { status: 500, headers: corsHeaders });
  }

  currentOffset = state.update_offset;

  while (true) {
    const remainingMs = MAX_RUNTIME_MS - (Date.now() - startTime);
    if (remainingMs < MIN_REMAINING_MS) break;
    const timeout = Math.min(50, Math.floor(remainingMs / 1000) - 5);
    if (timeout < 1) break;

    const r = await fetch(`${GATEWAY_URL}/getUpdates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offset: currentOffset,
        timeout,
        allowed_updates: ["callback_query", "message"],
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("getUpdates failed:", r.status, txt);
      return new Response(JSON.stringify({ error: "getUpdates failed", detail: txt }), {
        status: 502,
        headers: corsHeaders,
      });
    }

    const data = await r.json();
    const updates = data.result ?? [];
    if (updates.length === 0) continue;

    for (const upd of updates) {
      // Callback-Buttons
      if (upd.callback_query) {
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/telegram-approval-webhook`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-cron-secret": CRON_SECRET,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ callback_query: upd.callback_query }),
          });
          totalProcessed++;
        } catch (e) {
          console.error("Failed to forward callback:", e);
        }
      }
      // Reply-Nachrichten (nur an Bot-Messages, mit reply_to_message)
      else if (upd.message?.reply_to_message?.message_id) {
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/telegram-approval-webhook`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-cron-secret": CRON_SECRET,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ message: upd.message }),
          });
          totalProcessed++;
        } catch (e) {
          console.error("Failed to forward reply:", e);
        }
      }
    }

    const newOffset = Math.max(...updates.map((u: any) => u.update_id)) + 1;
    const { error: offErr } = await supabase
      .from("telegram_bot_state")
      .update({ update_offset: newOffset, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (offErr) {
      return new Response(JSON.stringify({ error: offErr.message }), { status: 500, headers: corsHeaders });
    }

    currentOffset = newOffset;
  }

  return new Response(
    JSON.stringify({ ok: true, processed: totalProcessed, finalOffset: currentOffset }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
