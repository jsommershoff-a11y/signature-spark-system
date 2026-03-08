import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function sipgateAuth(): string {
  const tokenId = Deno.env.get("SIPGATE_TOKEN_ID");
  const token = Deno.env.get("SIPGATE_TOKEN");
  if (!tokenId || !token) throw new Error("Sipgate credentials not configured");
  return "Basic " + btoa(`${tokenId}:${token}`);
}

async function sipgateFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`https://api.sipgate.com/v2${path}`, {
    ...options,
    headers: {
      Authorization: sipgateAuth(),
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sipgate API error [${res.status}]: ${body}`);
  }
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: require authenticated user with min mitarbeiter role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Check role
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleCheck } = await serviceSupabase.rpc("has_min_role", {
      _user_id: userId,
      _min_role: "mitarbeiter",
    });

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      // ─── Click-to-Call ───────────────────────────────────
      case "initiate_call": {
        const { caller, callee, callerId } = params;
        if (!caller || !callee) {
          return new Response(
            JSON.stringify({ error: "caller and callee are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate phone number format
        const phoneRegex = /^\+?[0-9\s\-()]{6,20}$/;
        if (!phoneRegex.test(callee)) {
          return new Response(
            JSON.stringify({ error: "Invalid phone number format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const callData = await sipgateFetch("/sessions/calls", {
          method: "POST",
          body: JSON.stringify({
            caller,
            callee,
            callerId: callerId || caller,
          }),
        });

        return new Response(JSON.stringify({ success: true, sessionId: callData.sessionId }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ─── Get User Devices (for caller selection) ────────
      case "get_devices": {
        const data = await sipgateFetch(`/authorization/userinfo`);
        const userSub = data.sub;

        // Get devices for user
        const devicesData = await sipgateFetch(`/${userSub}/devices`);

        return new Response(JSON.stringify({ devices: devicesData.items || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ─── Call History ───────────────────────────────────
      case "get_history": {
        const limit = Math.min(params.limit || 50, 100);
        const offset = params.offset || 0;
        const types = params.types || ["CALL"];
        const directions = params.directions || ["INCOMING", "OUTGOING", "MISSED_INCOMING"];

        const queryParams = new URLSearchParams({
          limit: String(limit),
          offset: String(offset),
        });
        types.forEach((t: string) => queryParams.append("types", t));
        directions.forEach((d: string) => queryParams.append("directions", d));

        const historyData = await sipgateFetch(`/history?${queryParams.toString()}`);

        return new Response(JSON.stringify(historyData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ─── Sync History to DB ─────────────────────────────
      case "sync_history": {
        const syncLimit = Math.min(params.limit || 50, 100);
        const queryParams = new URLSearchParams({
          limit: String(syncLimit),
          offset: "0",
        });
        ["CALL"].forEach((t) => queryParams.append("types", t));
        ["INCOMING", "OUTGOING", "MISSED_INCOMING"].forEach((d) =>
          queryParams.append("directions", d)
        );

        const history = await sipgateFetch(`/history?${queryParams.toString()}`);
        const items = history.items || [];

        let synced = 0;
        let skipped = 0;

        for (const item of items) {
          // Check if already synced by external_id
          const externalId = `sipgate_${item.id}`;
          const { data: existing } = await serviceSupabase
            .from("calls")
            .select("id")
            .eq("external_id", externalId)
            .maybeSingle();

          if (existing) {
            skipped++;
            continue;
          }

          // Try to match lead by phone number
          const remoteNumber = item.source || item.target;
          let leadId: string | null = null;

          if (remoteNumber) {
            // Clean the number for matching
            const cleanNumber = remoteNumber.replace(/[\s\-()]/g, "");
            const { data: leadMatch } = await serviceSupabase
              .from("crm_leads")
              .select("id")
              .or(`phone.ilike.%${cleanNumber.slice(-8)}%`)
              .limit(1)
              .maybeSingle();

            leadId = leadMatch?.id || null;
          }

          if (!leadId) {
            skipped++;
            continue; // Skip calls we can't match to a lead
          }

          // Get profile_id for the conducting user
          const { data: profileData } = await serviceSupabase
            .rpc("get_user_profile_id", { _user_id: userId });

          const duration = item.duration
            ? Math.floor(item.duration / 1000)
            : null;

          const startTime = item.created ? new Date(item.created).toISOString() : null;
          const endTime =
            startTime && duration
              ? new Date(new Date(startTime).getTime() + duration * 1000).toISOString()
              : null;

          await serviceSupabase.from("calls").insert({
            lead_id: leadId,
            conducted_by: profileData || null,
            provider: "sipgate",
            call_type: "phone",
            status: duration && duration > 0 ? "completed" : "failed",
            external_id: externalId,
            scheduled_at: startTime,
            started_at: startTime,
            ended_at: endTime,
            duration_seconds: duration,
            recording_url: item.recordingUrl || null,
            notes: `Sipgate ${item.direction}: ${item.source || "?"} → ${item.target || "?"}`,
            meta: {
              sipgate_id: item.id,
              direction: item.direction,
              source: item.source,
              target: item.target,
              labels: item.labels || [],
            },
          });

          // Also log as activity if lead found
          if (leadId && profileData) {
            const dirLabel = item.direction === "OUTGOING" ? "Ausgehend" : "Eingehend";
            await serviceSupabase.from("activities").insert({
              lead_id: leadId,
              user_id: profileData,
              type: "call",
              content: `${dirLabel}er Sipgate-Anruf: ${item.source || "?"} → ${item.target || "?"}${duration ? ` (${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")})` : ""}`,
              metadata: {
                source: "sipgate_sync",
                direction: item.direction?.toLowerCase(),
                duration_seconds: duration,
                sipgate_id: item.id,
              },
            });
          }

          synced++;
        }

        return new Response(
          JSON.stringify({
            success: true,
            synced,
            skipped,
            total: items.length,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ─── Get Recording URL ──────────────────────────────
      case "get_recording": {
        const { recordingUrl } = params;
        if (!recordingUrl) {
          return new Response(
            JSON.stringify({ error: "recordingUrl is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Proxy the recording through our function (Sipgate requires auth)
        const recordingRes = await fetch(recordingUrl, {
          headers: { Authorization: sipgateAuth() },
        });

        if (!recordingRes.ok) {
          throw new Error(`Recording fetch failed: ${recordingRes.status}`);
        }

        const audioData = await recordingRes.arrayBuffer();
        return new Response(audioData, {
          headers: {
            ...corsHeaders,
            "Content-Type": recordingRes.headers.get("Content-Type") || "audio/wav",
            "Content-Disposition": 'inline; filename="recording.wav"',
          },
        });
      }

      // ─── Connection Test ────────────────────────────────
      case "test_connection": {
        const info = await sipgateFetch("/authorization/userinfo");
        return new Response(
          JSON.stringify({
            success: true,
            user: info.sub,
            masterSipId: info.masterSipId,
            locale: info.locale,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (e) {
    console.error("sipgate-api error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
