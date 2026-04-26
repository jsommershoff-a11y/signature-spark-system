// Insert an in-app notification + (optional) send a branded email through gmail-event-webhook.
//
// Body:
// {
//   "user_id": "<uuid>",
//   "type": "lead.created" | "payment.received" | "mail.reply" | "system" | ...,
//   "title": "...",
//   "body"?: "...",
//   "link"?: "/app/leads/123",
//   "metadata"?: { ... },
//   "email"?: true,
//   "email_to"?: "override@example.com"
// }
//
// Auth: service-role (callable from other edge functions, n8n, or admin UI with service-role key).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendNotificationInput {
  user_id?: string;
  type?: string;
  title?: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
  email?: boolean;
  email_to?: string;
}

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
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
    const client = createClient(supabaseUrl, serviceRole);

    const input: SendNotificationInput = await req.json().catch(() => ({}));
    if (!input.user_id || !input.type || !input.title) {
      return new Response(
        JSON.stringify({ error: "user_id, type, title required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: notifId, error: rpcErr } = await client.rpc("notify_user", {
      p_user_id: input.user_id,
      p_type: input.type,
      p_title: input.title,
      p_body: input.body ?? null,
      p_link: input.link ?? null,
      p_metadata: input.metadata ?? null,
    });

    if (rpcErr) {
      console.error("notify_user RPC failed", rpcErr);
      return new Response(JSON.stringify({ error: rpcErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let emailResult: unknown = null;
    if (input.email) {
      let emailTo: string | undefined = input.email_to;
      if (!emailTo) {
        const { data: userData } = await client.auth.admin.getUserById(input.user_id);
        emailTo = userData?.user?.email ?? undefined;
      }
      const gmailSecret = Deno.env.get("GMAIL_WEBHOOK_SECRET") ?? "";
      if (emailTo && gmailSecret) {
        const linkAbs = input.link
          ? `https://ki-automationen.io${input.link.startsWith("/") ? "" : "/"}${input.link}`
          : "https://ki-automationen.io/app";
        const body = JSON.stringify({
          event: "notification.generic",
          to: emailTo,
          data: {
            name: emailTo.split("@")[0],
            headline: input.title,
            message: input.body ?? "",
            url: linkAbs,
            cta: "Im System öffnen",
          },
        });
        const sig = await hmacSha256Hex(gmailSecret, body);
        const resp = await fetch(
          `${supabaseUrl}/functions/v1/gmail-event-webhook`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Signature": sig,
            },
            body,
          },
        );
        const json = await resp.json().catch(() => ({}));
        emailResult = { status: resp.status, response: json };
      } else if (input.email && !emailTo) {
        emailResult = { skipped: "no recipient email available" };
      } else if (input.email && !gmailSecret) {
        emailResult = { skipped: "GMAIL_WEBHOOK_SECRET not configured" };
      }
    }

    return new Response(
      JSON.stringify({ notification_id: notifId, email: emailResult }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("send-notification error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
