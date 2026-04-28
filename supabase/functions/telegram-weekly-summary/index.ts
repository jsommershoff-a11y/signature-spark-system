// Edge Function: telegram-weekly-summary
// Sendet sonntags 18:00 Europe/Berlin eine 7-Tage-Zusammenfassung:
// - Neue Leads gesamt + pro Quelle
// - Conversion crm_leads -> customer (created in 7d)
// - Fehlgeschlagene Runs gesamt
// Auth: x-cron-secret oder Admin-JWT.

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

function berlinParts(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  return { weekday: parts.weekday, hour: Number(parts.hour) };
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

  // Cron gating: only run on Sunday 18:00 Berlin
  if (triggeredBy === "cron") {
    const { weekday, hour } = berlinParts(new Date());
    if (weekday !== "Sun" || hour !== 18) {
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: `${weekday} ${hour}h Berlin` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Aggregate runs in the last 7 days
  const { data: runs, error: runsErr } = await supabase
    .from("drive_sync_runs")
    .select("inserted, skipped_dedupe, skipped_invalid, status, errors")
    .gte("started_at", since);

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
  const failedRuns = (runs ?? []).filter((r) => r.status === "failed").length;
  const errorRuns = (runs ?? []).filter((r) => r.status === "completed_with_errors").length;

  // New crm_leads in last 7d, grouped by source_type
  const { data: leads } = await supabase
    .from("crm_leads")
    .select("source_type, status, created_at")
    .gte("created_at", since);

  const bySource = new Map<string, number>();
  let convertedCount = 0;
  for (const l of leads ?? []) {
    const k = (l as any).source_type ?? "unknown";
    bySource.set(k, (bySource.get(k) ?? 0) + 1);
    if (((l as any).status ?? "").toLowerCase() === "customer") convertedCount++;
  }
  const sourceLines = Array.from(bySource.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([s, n]) => `  • ${s}: ${n}`);

  const lines: string[] = [
    `<b>📈 Wochen-Zusammenfassung (7 Tage)</b>`,
    ``,
    `Sync-Runs: <b>${totalRuns}</b>`,
    `🆕 Neue Leads (sync): <b>${totalInserted}</b>`,
    `🔁 Duplikate: ${totalDedupe} · ⚠️ Ungültig: ${totalInvalid}`,
    `❌ Fehlgeschlagen: <b>${failedRuns}</b> · ⚠️ mit Fehlern: ${errorRuns}`,
    ``,
    `<b>Neue crm_leads gesamt:</b> ${leads?.length ?? 0}`,
    `<b>Davon Customer-Conversion:</b> ${convertedCount}`,
  ];
  if (sourceLines.length > 0) {
    lines.push(``, `<b>Top Quellen:</b>`, ...sourceLines);
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
      since,
      totals: {
        runs: totalRuns,
        inserted: totalInserted,
        leads_total: leads?.length ?? 0,
        converted: convertedCount,
        failed_runs: failedRuns,
        error_runs: errorRuns,
      },
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
