// send-push: Versendet eine Push-Notification an einen User
// - Liest Tokens aus public.push_tokens
// - Prüft public.should_send_push(user_id, category) (globaler Schalter, Kategorie, Ruhezeiten)
// - Verwendet FCM HTTP v1 (Service Account JSON in FCM_SERVICE_ACCOUNT_JSON)
// - Räumt ungültige Tokens automatisch ab
//
// Body:
// {
//   "user_id": "<uuid>",
//   "category": "admin_alerts" | "member_alerts" | "incoming_calls" | "lifecycle",
//   "title": "...",
//   "body"?: "...",
//   "link"?: "/app/...",
//   "data"?: { ... },
//   "force"?: false  // wenn true: ignoriert push_settings (z.B. für sicherheitskritische Alerts)
// }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Category = "admin_alerts" | "member_alerts" | "incoming_calls" | "lifecycle";

interface SendPushInput {
  user_id?: string;
  category?: Category;
  title?: string;
  body?: string;
  link?: string;
  data?: Record<string, string>;
  force?: boolean;
  log_id?: string;
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

// ---- FCM v1 OAuth (Service Account -> Access Token) -----------------------

let cachedToken: { token: string; exp: number } | null = null;

async function getFcmAccessToken(sa: ServiceAccount): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() / 1000 + 60) {
    return cachedToken.token;
  }
  const pem = sa.private_key.replace(/\\n/g, "\n");
  const key = await importPkcs8(pem);

  const jwt = await create(
    { alg: "RS256", typ: "JWT" },
    {
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 60),
    },
    key,
  );

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(`FCM token failed: ${JSON.stringify(json)}`);
  cachedToken = {
    token: json.access_token,
    exp: Math.floor(Date.now() / 1000) + (json.expires_in ?? 3600),
  };
  return cachedToken.token;
}

async function importPkcs8(pem: string): Promise<CryptoKey> {
  const b64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

// ---- Versand --------------------------------------------------------------

async function sendToToken(
  accessToken: string,
  projectId: string,
  token: string,
  payload: { title: string; body?: string; link?: string; data?: Record<string, string> },
): Promise<{ ok: boolean; status: number; error?: string }> {
  const message = {
    message: {
      token,
      notification: { title: payload.title, body: payload.body ?? "" },
      data: {
        ...(payload.data ?? {}),
        ...(payload.link ? { link: payload.link } : {}),
      },
      android: { priority: "HIGH" },
      apns: {
        headers: { "apns-priority": "10" },
        payload: { aps: { sound: "default" } },
      },
    },
  };
  const resp = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    },
  );
  if (resp.ok) {
    await resp.text();
    return { ok: true, status: resp.status };
  }
  const text = await resp.text();
  return { ok: false, status: resp.status, error: text };
}

// ---- Handler --------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const client = createClient(supabaseUrl, serviceRole);

    const input: SendPushInput = await req.json().catch(() => ({}));
    const allowedCats: Category[] = [
      "admin_alerts",
      "member_alerts",
      "incoming_calls",
      "lifecycle",
    ];
    if (
      !input.user_id ||
      !input.title ||
      !input.category ||
      !allowedCats.includes(input.category)
    ) {
      return new Response(
        JSON.stringify({ error: "user_id, title, category required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 1) push_settings prüfen (es sei denn force = true)
    if (!input.force) {
      const { data: allowed, error: rpcErr } = await client.rpc(
        "should_send_push",
        { _user_id: input.user_id, _category: input.category },
      );
      if (rpcErr) {
        console.error("should_send_push failed", rpcErr);
        return new Response(JSON.stringify({ error: rpcErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!allowed) {
        return new Response(
          JSON.stringify({ skipped: "user push settings", sent: 0 }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // 2) Tokens laden
    const { data: tokens, error: tokErr } = await client
      .from("push_tokens")
      .select("id, token, platform")
      .eq("user_id", input.user_id);
    if (tokErr) {
      return new Response(JSON.stringify({ error: tokErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ skipped: "no tokens", sent: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 3) FCM Service Account
    const saRaw = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON");
    if (!saRaw) {
      return new Response(
        JSON.stringify({
          error: "FCM_SERVICE_ACCOUNT_JSON not configured",
          tokens: tokens.length,
        }),
        {
          status: 200, // soft-fail damit Trigger nicht crashen
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const sa = JSON.parse(saRaw) as ServiceAccount;
    const accessToken = await getFcmAccessToken(sa);

    // 4) Senden
    let sent = 0;
    const invalid: string[] = [];
    const errors: Array<{ token: string; status: number; error?: string }> = [];

    for (const t of tokens) {
      const r = await sendToToken(accessToken, sa.project_id, t.token, {
        title: input.title!,
        body: input.body,
        link: input.link,
        data: input.data,
      });
      if (r.ok) {
        sent++;
      } else {
        // 404 / UNREGISTERED / INVALID_ARGUMENT => Token entfernen
        if (
          r.status === 404 ||
          (r.error && /UNREGISTERED|INVALID_ARGUMENT|NOT_FOUND/i.test(r.error))
        ) {
          invalid.push(t.id);
        }
        errors.push({ token: t.token.slice(0, 12) + "…", status: r.status, error: r.error });
      }
    }

    if (invalid.length > 0) {
      await client.from("push_tokens").delete().in("id", invalid);
    }

    // last_seen_at refresh
    if (sent > 0) {
      await client
        .from("push_tokens")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("user_id", input.user_id);
    }

    return new Response(
      JSON.stringify({
        sent,
        total: tokens.length,
        invalid_removed: invalid.length,
        errors: errors.slice(0, 5),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("send-push error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
