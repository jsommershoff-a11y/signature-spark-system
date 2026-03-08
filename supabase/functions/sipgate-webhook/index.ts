import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Normalize a phone number to pure digits with country prefix.
 * Handles: +49..., 0049..., 0..., spaces, dashes, parentheses.
 * Returns normalized string like "49171234567" or null if invalid.
 */
function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Strip all non-digit characters except leading +
  let cleaned = raw.replace(/[\s\-()\/]/g, "");
  // Handle + prefix
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }
  // Handle 00 international prefix
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }
  // Handle German local format (0...)
  if (cleaned.startsWith("0")) {
    cleaned = "49" + cleaned.slice(1);
  }
  // Must have at least 8 digits to be a valid phone
  if (cleaned.length < 8 || !/^\d+$/.test(cleaned)) {
    return null;
  }
  return cleaned;
}

/**
 * Extract the last N digits for fuzzy matching.
 */
function phoneMatchSuffix(normalized: string, digits = 8): string {
  return normalized.slice(-digits);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().slice(0, 8);

  try {
    // Parse incoming data
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
      const url = new URL(req.url);
      for (const [key, value] of url.searchParams.entries()) {
        eventData[key] = value;
      }
    }

    const eventType = eventData.event;
    if (!eventType) {
      console.log(`[${requestId}] No event type in payload, returning OK`);
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    console.log(`[${requestId}] Sipgate webhook: ${eventType}`, JSON.stringify(eventData));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const direction = eventData.direction; // "in" or "out"
    const callId = eventData.callId;
    const sipgateExternalId = callId ? `sipgate_push_${callId}` : null;

    // Determine the remote number based on direction
    const remoteNumber = direction === "in" ? eventData.from : eventData.to;
    const normalizedRemote = normalizePhone(remoteNumber);

    console.log(`[${requestId}] Remote number: ${remoteNumber} → normalized: ${normalizedRemote}`);

    // --- Lead Matching ---
    let leadId: string | null = null;
    let leadOwnerId: string | null = null;

    if (normalizedRemote) {
      const suffix = phoneMatchSuffix(normalizedRemote);

      // Use DB function that strips non-digits before matching
      // This handles spaces, dashes, parentheses in stored phone numbers
      const { data: leadMatches, error: matchError } = await supabase
        .rpc("match_lead_by_phone", { search_suffix: suffix });

      if (matchError) {
        console.error(`[${requestId}] Lead matching query failed:`, matchError.message);
      } else if (leadMatches && leadMatches.length > 0) {
        // Prioritize: exact normalized match first, then suffix match
        let bestMatch = null;

        for (const lead of leadMatches) {
          const leadNormalized = normalizePhone(lead.phone);
          if (leadNormalized === normalizedRemote) {
            bestMatch = lead;
            break; // Exact match, stop searching
          }
        }

        // Fallback to first suffix match
        if (!bestMatch) {
          bestMatch = leadMatches[0];
        }

        if (leadMatches.length > 1) {
          console.warn(
            `[${requestId}] Multiple leads matched for ${suffix}: ${leadMatches.map((l) => `${l.id} (${l.first_name} ${l.last_name})`).join(", ")}. Using: ${bestMatch!.id}`
          );
        }

        leadId = bestMatch!.id;
        leadOwnerId = bestMatch!.owner_user_id;
        console.log(`[${requestId}] Matched lead: ${leadId} (${bestMatch!.first_name} ${bestMatch!.last_name})`);
      } else {
        console.log(`[${requestId}] No lead found for suffix ${suffix} — treating as unknown contact`);
      }
    } else {
      console.warn(`[${requestId}] Could not normalize remote number: ${remoteNumber}`);
    }

    // --- Handle newCall Event ---
    if (eventType === "newCall") {
      if (!sipgateExternalId) {
        console.warn(`[${requestId}] newCall without callId, skipping insert`);
      } else {
        // Check for duplicate
        const { data: existing } = await supabase
          .from("calls")
          .select("id")
          .eq("external_id", sipgateExternalId)
          .maybeSingle();

        if (existing) {
          console.log(`[${requestId}] Call ${sipgateExternalId} already exists (${existing.id}), skipping`);
        } else {
          const dirLabel = direction === "in" ? "Eingehender" : "Ausgehender";

          const insertPayload: Record<string, unknown> = {
            conducted_by: leadOwnerId || null,
            provider: "sipgate",
            call_type: "phone",
            status: "in_progress",
            external_id: sipgateExternalId,
            started_at: new Date().toISOString(),
            notes: `${dirLabel} Sipgate-Anruf: ${eventData.from || "?"} → ${eventData.to || "?"}`,
            meta: {
              sipgate_call_id: callId,
              direction: direction === "in" ? "INCOMING" : "OUTGOING",
              source: eventData.from,
              target: eventData.to,
              user: eventData.user || [],
              webhook_event: eventType,
              unknown_contact: !leadId,
              normalized_remote: normalizedRemote,
            },
          };

          // Only set lead_id if we have a match
          if (leadId) {
            insertPayload.lead_id = leadId;
          }

          const { error: insertError } = await supabase.from("calls").insert(insertPayload);

          if (insertError) {
            console.error(`[${requestId}] Failed to insert call:`, insertError.message);
          } else {
            console.log(`[${requestId}] Call inserted: ${sipgateExternalId}, lead: ${leadId || "UNKNOWN"}`);
          }
        }
      }
    }

    // --- Handle hangup Event ---
    if (eventType === "hangup" && sipgateExternalId) {
      const durationSeconds = eventData.duration
        ? Math.floor(parseInt(eventData.duration) / 1000)
        : null;

      const { data: existingCall, error: fetchError } = await supabase
        .from("calls")
        .select("id, lead_id")
        .eq("external_id", sipgateExternalId)
        .maybeSingle();

      if (fetchError) {
        console.error(`[${requestId}] Failed to fetch call for hangup:`, fetchError.message);
      } else if (!existingCall) {
        console.warn(`[${requestId}] hangup for unknown call: ${sipgateExternalId}`);
      } else {
        const callReached = durationSeconds !== null && durationSeconds > 0;
        const callStatus = callReached ? "completed" : "failed";

        const { error: updateError } = await supabase
          .from("calls")
          .update({
            status: callStatus,
            ended_at: new Date().toISOString(),
            duration_seconds: durationSeconds,
            meta: {
              sipgate_call_id: callId,
              direction: direction === "in" ? "INCOMING" : "OUTGOING",
              source: eventData.from,
              target: eventData.to,
              cause: eventData.cause,
              hangup_event: true,
              unknown_contact: !existingCall.lead_id,
              normalized_remote: normalizedRemote,
              call_reached: callReached,
            },
          })
          .eq("id", existingCall.id);

        if (updateError) {
          console.error(`[${requestId}] Failed to update call on hangup:`, updateError.message);
        } else {
          console.log(`[${requestId}] Call ${existingCall.id} updated to ${callStatus} (duration: ${durationSeconds}s)`);
        }

        // --- Activity + Follow-up only if lead matched ---
        const hangupLeadId = existingCall.lead_id;
        if (hangupLeadId) {
          // Fetch owner for this lead (might differ from initial match if lead was reassigned)
          const { data: leadData } = await supabase
            .from("crm_leads")
            .select("owner_user_id")
            .eq("id", hangupLeadId)
            .maybeSingle();

          const ownerId = leadData?.owner_user_id;

          if (ownerId) {
            const dirLabel = direction === "in" ? "Eingehender" : "Ausgehender";

            // Create structured activity
            const { error: activityError } = await supabase.from("activities").insert({
              lead_id: hangupLeadId,
              user_id: ownerId,
              type: "anruf",
              content: `${dirLabel} Sipgate-Anruf beendet${durationSeconds ? ` (${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, "0")})` : ""} — ${eventData.cause === "normalClearing" ? "Normal beendet" : eventData.cause || "Unbekannt"}`,
              metadata: {
                source: "sipgate_webhook",
                direction: direction === "in" ? "incoming" : "outgoing",
                duration_seconds: durationSeconds,
                cause: eventData.cause,
                sipgate_call_id: callId,
                call_id: existingCall.id,
                call_reached: callReached,
                follow_up_needed: callReached, // default: reached calls need follow-up
                call_outcome: callReached ? "reached" : "not_reached",
              },
            });

            if (activityError) {
              console.error(`[${requestId}] Failed to create activity:`, activityError.message);
            } else {
              console.log(`[${requestId}] Activity created for lead ${hangupLeadId}`);
            }

            // Auto-create follow-up task if none exists (only for reached calls)
            if (callReached) {
              const { data: existingTask, error: taskQueryError } = await supabase
                .from("crm_tasks")
                .select("id")
                .eq("lead_id", hangupLeadId)
                .eq("status", "open")
                .eq("type", "followup")
                .maybeSingle();

              if (taskQueryError) {
                console.error(`[${requestId}] Failed to check existing tasks:`, taskQueryError.message);
              } else if (!existingTask) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(9, 0, 0, 0);

                const { error: taskError } = await supabase.from("crm_tasks").insert({
                  title: "Follow-up nach Telefonat",
                  description: `Automatisch erstellt nach ${dirLabel.toLowerCase()}m Sipgate-Anruf.`,
                  lead_id: hangupLeadId,
                  assigned_user_id: ownerId,
                  type: "follow_up",
                  status: "open",
                  due_at: tomorrow.toISOString(),
                  meta: {
                    auto_generated: true,
                    source: "sipgate_webhook",
                    call_id: existingCall.id,
                    sipgate_call_id: callId,
                  },
                });

                if (taskError) {
                  console.error(`[${requestId}] Failed to create follow-up task:`, taskError.message);
                } else {
                  console.log(`[${requestId}] Follow-up task created for lead ${hangupLeadId}`);
                }
              } else {
                console.log(`[${requestId}] Follow-up task already exists (${existingTask.id}), skipping`);
              }
            } else {
              console.log(`[${requestId}] Call not reached (duration: ${durationSeconds}s), skipping follow-up task`);
            }
          } else {
            console.warn(`[${requestId}] Lead ${hangupLeadId} has no owner, skipping activity/task creation`);
          }
        } else {
          console.log(`[${requestId}] No lead associated with call ${existingCall.id}, skipping activity/task`);
        }
      }
    }

    // Sipgate expects 200 OK
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response/>',
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/xml" },
      }
    );
  } catch (e) {
    console.error(`[${requestId}] sipgate-webhook UNHANDLED ERROR:`, e instanceof Error ? e.message : String(e), e instanceof Error ? e.stack : "");
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response/>',
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/xml" },
      }
    );
  }
});
