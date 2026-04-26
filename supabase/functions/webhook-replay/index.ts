// Admin-only edge function that replays a previously logged webhook event.
// Re-POSTs the original payload to the original webhook function and updates
// the row in webhook_events with replayed_at, replayed_count and status.
//
// Auth: caller must pass a valid JWT (Authorization: Bearer ...) and have role 'admin'.
//
// Body: { "event_id": "<uuid>" }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SOURCE_TO_FUNCTION: Record<string, string> = {
  "stripe": "webhook-payment",
  "stripe-connect": "stripe-connect-webhook",
  "twilio": "webhook-twilio",
  "zoom": "webhook-zoom",
  "sipgate": "sipgate-webhook",
  "gmail": "gmail-event-webhook",
};

function inferSignatureHeaderName(source: string): string | null {
  switch (source) {
    case "stripe":
    case "stripe-connect":
      return "stripe-signature";
    case "twilio":
      return "x-twilio-signature";
    case "zoom":
      return "x-zm-signature";
    case "gmail":
      return "x-webhook-signature";
    default:
      return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const adminClient = createClient(supabaseUrl, serviceRole);

    // Authenticate the calling user via JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role via existing RPC
    const { data: isAdmin, error: roleErr } = await adminClient
      .rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (roleErr) {
      console.error("webhook-replay role check failed", roleErr);
      return new Response(JSON.stringify({ error: "Role check failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const eventId = body?.event_id as string | undefined;
    if (!eventId) {
      return new Response(JSON.stringify({ error: "event_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load event using service_role (bypasses RLS)
    const { data: event, error: loadErr } = await adminClient
      .from("webhook_events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle();
    if (loadErr || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetFn = SOURCE_TO_FUNCTION[event.source as string];
    if (!targetFn) {
      return new Response(
        JSON.stringify({ error: `Unknown source: ${event.source}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Re-POST payload to the original webhook function
    const targetUrl = `${supabaseUrl}/functions/v1/${targetFn}`;
    const replayHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Replayed": "true",
      "X-Replayed-Event-Id": eventId,
    };
    const sigHeader = inferSignatureHeaderName(event.source as string);
    if (sigHeader && event.signature) {
      replayHeaders[sigHeader] = event.signature as string;
    }

    const replayResp = await fetch(targetUrl, {
      method: "POST",
      headers: replayHeaders,
      body: JSON.stringify(event.payload),
    });
    const replayStatus = replayResp.status;
    const replayBody = await replayResp.text().catch(() => "");

    const newStatus = replayStatus >= 200 && replayStatus < 300 ? "replayed" : "failed";
    await adminClient
      .from("webhook_events")
      .update({
        replayed_at: new Date().toISOString(),
        replayed_count: ((event.replayed_count as number) ?? 0) + 1,
        status: newStatus,
        error: newStatus === "failed" ? replayBody.slice(0, 500) : null,
      })
      .eq("id", eventId);

    return new Response(
      JSON.stringify({
        replayed: true,
        target: targetFn,
        replay_status: replayStatus,
        replay_body: replayBody.slice(0, 500),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("webhook-replay error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
