// Optional helper for logging incoming webhook events to public.webhook_events.
// Use from any webhook edge function to enable the admin replay UI at /app/webhooks.
//
// Usage pattern:
//   import { logWebhook, markProcessed, markFailed } from "../_shared/webhook-logger.ts";
//
//   const eventId = await logWebhook({
//     source: "stripe",
//     payload: parsedJson,
//     signature: req.headers.get("stripe-signature"),
//     signatureValid: true,
//     headers: { "stripe-signature": req.headers.get("stripe-signature") ?? "" },
//     eventType: event.type,
//   });
//   try {
//     // ...process event...
//     await markProcessed(eventId);
//   } catch (e) {
//     await markFailed(eventId, e instanceof Error ? e.message : String(e));
//     throw e;
//   }

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    _client = createClient(url, key);
  }
  return _client;
}

export interface LogWebhookInput {
  source: string;
  payload: unknown;
  signature?: string | null;
  signatureValid?: boolean | null;
  headers?: Record<string, string> | null;
  eventType?: string | null;
}

/**
 * Insert a new row into webhook_events. Returns the row id, or null on failure.
 * Failures are logged but do NOT throw — logging must never break webhook processing.
 */
export async function logWebhook(input: LogWebhookInput): Promise<string | null> {
  try {
    const status = input.signatureValid === false ? "signature_invalid" : "received";
    const { data, error } = await getClient()
      .from("webhook_events")
      .insert({
        source: input.source,
        event_type: input.eventType ?? null,
        payload: input.payload,
        signature: input.signature ?? null,
        signature_valid: input.signatureValid ?? null,
        headers: input.headers ?? null,
        status,
      })
      .select("id")
      .single();
    if (error) {
      console.error("webhook-logger: insert failed", error);
      return null;
    }
    return data?.id ?? null;
  } catch (e) {
    console.error("webhook-logger: exception", e);
    return null;
  }
}

export async function markProcessed(id: string | null): Promise<void> {
  if (!id) return;
  try {
    await getClient()
      .from("webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("id", id);
  } catch (e) {
    console.error("webhook-logger: markProcessed failed", e);
  }
}

export async function markFailed(id: string | null, error: string): Promise<void> {
  if (!id) return;
  try {
    await getClient()
      .from("webhook_events")
      .update({ status: "failed", error })
      .eq("id", id);
  } catch (e) {
    console.error("webhook-logger: markFailed failed", e);
  }
}
