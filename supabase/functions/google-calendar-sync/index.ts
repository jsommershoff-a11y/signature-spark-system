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

    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + days_ahead * 86400_000).toISOString();

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
    if (!gRes.ok) {
      throw new Error(
        `Google Calendar API failed [${gRes.status}]: ${JSON.stringify(gJson)}`,
      );
    }

    const events: GEvent[] = gJson.items ?? [];
    const busy = events.filter(
      (e) =>
        e.status !== "cancelled" &&
        e.transparency !== "transparent" &&
        e.start?.dateTime &&
        e.end?.dateTime,
    );

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

    return new Response(
      JSON.stringify({
        ok: true,
        synced: upserts,
        cancelled,
        window: { from: timeMin, to: timeMax },
        calendar_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[google-calendar-sync]", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
