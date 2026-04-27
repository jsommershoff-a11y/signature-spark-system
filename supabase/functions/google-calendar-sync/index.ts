// Google Calendar Sync via Connector Gateway (Single-Account: Owner-Kalender)
// Holt 'busy' Slots aus dem primary Kalender und spiegelt sie in availability_slots.
// Aufruf: POST { profile_id: uuid, days_ahead?: number, calendar_id?: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL =
  "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

interface GEvent {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  transparency?: string; // "transparent" = free
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startedAt = Date.now();
  let logCtx: {
    profile_id?: string;
    calendar_id?: string;
    triggered_by?: string;
    window_from?: string;
    window_to?: string;
  } = {};
  let supabaseForLog: any = null;
  const meta: {
    google_api: {
      status?: number;
      ok?: boolean;
      url?: string;
      total_items?: number;
      busy_items?: number;
      response_sample?: any;
      error_body?: any;
    };
    events: {
      synced_event_ids: string[];
      cancelled_event_ids: string[];
      skipped_event_ids: string[];
    };
    errors: Array<{ event_id?: string; phase: string; message: string }>;
    stack?: string;
  } = {
    google_api: {},
    events: { synced_event_ids: [], cancelled_event_ids: [], skipped_event_ids: [] },
    errors: [],
  };

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GCAL_KEY = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!GCAL_KEY) throw new Error("GOOGLE_CALENDAR_API_KEY not configured");

    const body = await req.json().catch(() => ({}));
    const profile_id: string | undefined = body.profile_id;
    const days_ahead: number = Math.min(Math.max(body.days_ahead ?? 30, 1), 90);
    const calendar_id: string = body.calendar_id ?? "primary";
    if (!profile_id) {
      return new Response(JSON.stringify({ error: "profile_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    supabaseForLog = supabase;

    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + days_ahead * 86400_000).toISOString();
    logCtx = {
      profile_id,
      calendar_id,
      triggered_by: body.triggered_by,
      window_from: timeMin,
      window_to: timeMax,
    };

    // Events lesen
    const url = new URL(
      `${GATEWAY_URL}/calendars/${encodeURIComponent(calendar_id)}/events`,
    );
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("timeMax", timeMax);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "250");

    const gRes = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GCAL_KEY,
      },
    });
    const gJson = await gRes.json();
    meta.google_api.status = gRes.status;
    meta.google_api.ok = gRes.ok;
    meta.google_api.url = url.toString();
    if (!gRes.ok) {
      meta.google_api.error_body = gJson;
      throw new Error(
        `Google Calendar API failed [${gRes.status}]: ${JSON.stringify(gJson).slice(0, 1000)}`,
      );
    }

    const events: GEvent[] = gJson.items ?? [];
    meta.google_api.total_items = events.length;
    meta.google_api.response_sample = {
      kind: gJson.kind,
      summary: gJson.summary,
      timeZone: gJson.timeZone,
      updated: gJson.updated,
      nextSyncToken: gJson.nextSyncToken ? "[present]" : null,
      first_item: events[0]
        ? {
            id: events[0].id,
            summary: events[0].summary,
            status: events[0].status,
            start: events[0].start,
            end: events[0].end,
          }
        : null,
    };
    const busy = events.filter(
      (e) =>
        e.status !== "cancelled" &&
        e.transparency !== "transparent" &&
        e.start?.dateTime &&
        e.end?.dateTime,
    );
    meta.google_api.busy_items = busy.length;
    for (const e of events) {
      if (!busy.includes(e)) meta.events.skipped_event_ids.push(e.id);
    }

    let upserts = 0;
    let cancelled = 0;
    const seenEventIds: string[] = [];

    for (const ev of busy) {
      seenEventIds.push(ev.id);
      const start_at = ev.start!.dateTime!;
      const end_at = ev.end!.dateTime!;

      // Upsert per (profile_id, google_event_id)
      const { data: existing } = await supabase
        .from("availability_slots")
        .select("id")
        .eq("profile_id", profile_id)
        .eq("google_event_id", ev.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("availability_slots")
          .update({
            start_at,
            end_at,
            google_event_summary: ev.summary ?? null,
            google_calendar_id: calendar_id,
            notes: ev.description ?? null,
            status: "blocked",
            source: "google_busy",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("availability_slots").insert({
          profile_id,
          start_at,
          end_at,
          status: "blocked",
          source: "google_busy",
          google_event_id: ev.id,
          google_event_summary: ev.summary ?? null,
          google_calendar_id: calendar_id,
          notes: ev.description ?? null,
        });
      }
      upserts++;
    }

    // Gelöschte/abgesagte Events: Slots im Zeitraum, die nicht mehr in Google sind
    const { data: orphan } = await supabase
      .from("availability_slots")
      .select("id, google_event_id")
      .eq("profile_id", profile_id)
      .eq("source", "google_busy")
      .gte("start_at", timeMin)
      .lte("start_at", timeMax);

    for (const row of orphan ?? []) {
      if (row.google_event_id && !seenEventIds.includes(row.google_event_id)) {
        await supabase
          .rpc("release_slot_for_google_event", {
            _profile_id: profile_id,
            _google_event_id: row.google_event_id,
            _reason: "Google-Event nicht mehr im Zeitfenster",
          })
          .then(() => cancelled++);
      }
    }

    await supabase.from("google_calendar_sync_logs").insert({
      profile_id: logCtx.profile_id,
      triggered_by: logCtx.triggered_by ?? null,
      calendar_id: logCtx.calendar_id,
      window_from: logCtx.window_from,
      window_to: logCtx.window_to,
      status: "success",
      synced_count: upserts,
      cancelled_count: cancelled,
      duration_ms: Date.now() - startedAt,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        synced: upserts,
        cancelled,
        window: { from: logCtx.window_from, to: logCtx.window_to },
        calendar_id: logCtx.calendar_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[google-calendar-sync]", msg);
    if (supabaseForLog && logCtx.profile_id) {
      await supabaseForLog.from("google_calendar_sync_logs").insert({
        profile_id: logCtx.profile_id,
        triggered_by: logCtx.triggered_by ?? null,
        calendar_id: logCtx.calendar_id,
        window_from: logCtx.window_from,
        window_to: logCtx.window_to,
        status: "error",
        error_message: msg,
        duration_ms: Date.now() - startedAt,
      }).then(() => {}, () => {});
    }
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
