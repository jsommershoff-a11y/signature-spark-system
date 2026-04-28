// Edge Function: telegram-daily-summary
// Sendet taeglich um 18:00 (Europe/Berlin) eine Telegram-Zusammenfassung:
// - Anzahl neuer Leads heute (aus drive_sync_runs)
// - Anzahl Fehler / fehlgeschlagene Runs
// - Auth: x-cron-secret ODER Admin-JWT

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sendTelegram(text: string): Promise<void> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  const chatId = Deno.env.get("TELEGRAM_NOTIFY_CHAT_ID");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  if (!TELEGRAM_API_KEY) throw new Error("TELEGRAM_API_KEY missing");
  if (!chatId) throw new Error("TELEGRAM_NOTIFY_CHAT_ID missing");

  const res = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TELEGRAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`telegram ${res.status}: ${t.slice(0, 300)}`);
  }
}

// Compute the start of "today" in Europe/Berlin, returned as a UTC ISO string.
function startOfBerlinDayUTC(): string {
  const now = new Date();
  // Format current time in Berlin to get its Y-M-D
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  // Berlin offset: derive by comparing
  // Easier: build a Date for "today 00:00 Berlin" using the Y-M-D and UTC, then adjust by offset.
  const berlinMidnightAsIfUTC = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`);
  // Compute Berlin offset in minutes for "now"
  const tzNow = new Date(
    new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" })).toISOString().slice(0, -1) + "Z",
  );
  const offsetMs = tzNow.getTime() - now.getTime();
  // Berlin midnight in true UTC
  const berlinMidnightUTC = new Date(berlinMidnightAsIfUTC.getTime() - offsetMs);
  return berlinMidnightUTC.toISOString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST")
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const cronSecret = Deno.env.get("CRON_SECRET");

  // Auth
  const headerSecret = req.headers.get("x-cron-secret");
  let authorized = false;
  let triggeredBy = "unknown";
  if (cronSecret && headerSecret && headerSecret === cronSecret) {
    authorized = true;
    triggeredBy = "cron";
  } else {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (userData?.user?.id) {
        const adminClient = createClient(supabaseUrl, serviceKey);
        const { data: roleOk } = await adminClient.rpc("has_min_role", {
          _user_id: userData.user.id,
          _min_role: "admin",
        });
        if (roleOk === true) {
          authorized = true;
          triggeredBy = "manual";
        }
      }
    }
  }
  if (!authorized) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Cron fires at multiple UTC slots; only proceed when Berlin hour == 18 (skip for cron, allow manual)
  if (triggeredBy === "cron") {
    const berlinHour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        hour12: false,
      }).format(new Date()),
    );
    if (berlinHour !== 18) {
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: `berlin_hour=${berlinHour}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  }

  const sinceISO = startOfBerlinDayUTC();

  // Aggregate today's runs
  const { data: runs, error: runsErr } = await supabase
    .from("drive_sync_runs")
    .select("id, sheet_id, inserted, skipped_dedupe, skipped_invalid, errors, status, started_at")
    .gte("started_at", sinceISO)
    .order("started_at", { ascending: true });

  if (runsErr) {
    return new Response(JSON.stringify({ error: runsErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const totalRuns = runs?.length ?? 0;
  const totalInserted = (runs ?? []).reduce((a, r) => a + (r.inserted ?? 0), 0);
  const totalDedupe = (runs ?? []).reduce((a, r) => a + (r.skipped_dedupe ?? 0), 0);
  const totalInvalid = (runs ?? []).reduce((a, r) => a + (r.skipped_invalid ?? 0), 0);
  const failedRuns = (runs ?? []).filter((r) => r.status === "failed");
  const errorRuns = (runs ?? []).filter((r) => r.status === "completed_with_errors");
  const totalErrorMessages = (runs ?? []).reduce(
    (a, r) => a + (Array.isArray(r.errors) ? r.errors.length : 0),
    0,
  );

  const dateLabel = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  const lines: string[] = [
    `<b>📊 Tages-Zusammenfassung – ${dateLabel}</b>`,
    ``,
    `Sync-Runs heute: <b>${totalRuns}</b>`,
    `🆕 Neue Leads: <b>${totalInserted}</b>`,
    `🔁 Duplikate: ${totalDedupe}`,
    `⚠️ Ungültig: ${totalInvalid}`,
    `❌ Fehlgeschlagene Runs: <b>${failedRuns.length}</b>`,
    `⚠️ Runs mit Fehlern: <b>${errorRuns.length}</b> (insgesamt ${totalErrorMessages} Meldungen)`,
  ];

  // Show first error sample if any
  const firstErrSample =
    failedRuns[0]?.errors?.[0] ??
    errorRuns[0]?.errors?.[0] ??
    null;
  if (firstErrSample) {
    lines.push(``, `Letzter Fehler:`, `<code>${String(firstErrSample).slice(0, 280)}</code>`);
  }

  if (totalRuns === 0) {
    lines.push(``, `<i>Keine Sync-Runs heute ausgeführt.</i>`);
  }

  try {
    await sendTelegram(lines.join("\n"));
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      triggered_by: triggeredBy,
      since: sinceISO,
      totals: {
        runs: totalRuns,
        inserted: totalInserted,
        dedupe: totalDedupe,
        invalid: totalInvalid,
        failed_runs: failedRuns.length,
        error_runs: errorRuns.length,
      },
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
