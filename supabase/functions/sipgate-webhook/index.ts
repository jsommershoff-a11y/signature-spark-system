import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Sipgate sends form-urlencoded data for push API
    const contentType = req.headers.get("content-type") || "";
    let eventData: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        eventData[key] = String(value);
      }
    } else if (contentType.includes("application/json")) {
      eventData = await req.json();
    } else {
      // Try URL params for GET-based webhooks
      const url = new URL(req.url);
      for (const [key, value] of url.searchParams.entries()) {
        eventData[key] = value;
      }
    }

    const eventType = eventData.event; // newCall, answer, hangup
    if (!eventType) {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    console.log(`Sipgate webhook: ${eventType}`, JSON.stringify(eventData));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const remoteNumber = eventData.from || eventData.to || "";
    const direction = eventData.direction; // "in" or "out"
    const callId = eventData.callId;
    const sipgateExternalId = callId ? `sipgate_push_${callId}` : null;

    // Try to match lead by phone
    let leadId: string | null = null;
    if (remoteNumber) {
      const cleanNumber = remoteNumber.replace(/[\s\-()]/g, "");
      const { data: leadMatch } = await supabase
        .from("crm_leads")
        .select("id, owner_user_id")
        .or(`phone.ilike.%${cleanNumber.slice(-8)}%`)
        .limit(1)
        .maybeSingle();

      leadId = leadMatch?.id || null;

      if (eventType === "newCall" && leadMatch) {
        // Check if already exists
        if (sipgateExternalId) {
          const { data: existing } = await supabase
            .from("calls")
            .select("id")
            .eq("external_id", sipgateExternalId)
            .maybeSingle();

          if (!existing) {
            await supabase.from("calls").insert({
              lead_id: leadMatch.id,
              conducted_by: leadMatch.owner_user_id || null,
              provider: "sipgate",
              call_type: "phone",
              status: "in_progress",
              external_id: sipgateExternalId,
              started_at: new Date().toISOString(),
              notes: `${direction === "in" ? "Eingehender" : "Ausgehender"} Sipgate-Anruf: ${eventData.from || "?"} → ${eventData.to || "?"}`,
              meta: {
                sipgate_call_id: callId,
                direction: direction === "in" ? "INCOMING" : "OUTGOING",
                source: eventData.from,
                target: eventData.to,
                user: eventData.user || [],
                webhook_event: eventType,
              },
            });
          }
        }
      }

      if (eventType === "hangup" && sipgateExternalId) {
        const durationSeconds = eventData.duration
          ? Math.floor(parseInt(eventData.duration) / 1000)
          : null;

        const { data: existingCall } = await supabase
          .from("calls")
          .select("id")
          .eq("external_id", sipgateExternalId)
          .maybeSingle();

        if (existingCall) {
          await supabase
            .from("calls")
            .update({
              status: durationSeconds && durationSeconds > 0 ? "completed" : "failed",
              ended_at: new Date().toISOString(),
              duration_seconds: durationSeconds,
              meta: {
                sipgate_call_id: callId,
                direction: direction === "in" ? "INCOMING" : "OUTGOING",
                source: eventData.from,
                target: eventData.to,
                cause: eventData.cause,
                hangup_event: true,
              },
            })
            .eq("id", existingCall.id);

          // Log activity
          if (leadMatch?.owner_user_id) {
            const dirLabel = direction === "in" ? "Eingehender" : "Ausgehender";
            await supabase.from("activities").insert({
              lead_id: leadMatch.id,
              user_id: leadMatch.owner_user_id,
              type: "call",
              content: `${dirLabel} Sipgate-Anruf beendet${durationSeconds ? ` (${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, "0")})` : ""} — ${eventData.cause === "normalClearing" ? "Normal beendet" : eventData.cause || "Unbekannt"}`,
              metadata: {
                source: "sipgate_webhook",
                direction: direction === "in" ? "incoming" : "outgoing",
                duration_seconds: durationSeconds,
                cause: eventData.cause,
                sipgate_call_id: callId,
              },
            });
          }
        }
      }
    }

    // Sipgate expects 200 OK with XML or just OK
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response/>',
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml",
        },
      }
    );
  } catch (e) {
    console.error("sipgate-webhook error:", e);
    // Always return 200 to Sipgate to prevent retries
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response/>',
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/xml" },
      }
    );
  }
});
