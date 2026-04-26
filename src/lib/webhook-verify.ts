// Webhook-Signatur-Verifikation — Cross-Runtime (Deno + Node).
// Logik 1:1 übernommen aus den Edge Functions:
//   - supabase/functions/webhook-payment/index.ts (Stripe + CopeCart)
//   - supabase/functions/webhook-twilio/index.ts
//   - supabase/functions/webhook-zoom/index.ts
//   - supabase/functions/gmail-event-webhook/index.ts
//
// Diese Datei lebt in src/lib damit Vitest sie findet (vitest.config.ts include: src/**/*.{test,spec}.{ts,tsx}).
// Sie nutzt ausschließlich Web Crypto API — funktioniert daher in Deno und in Node.js (≥ v19).

const encoder = new TextEncoder();

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

async function hmacSign(
  secret: string,
  data: string,
  hash: "SHA-256" | "SHA-1",
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return new Uint8Array(sig);
}

/** Konstantzeit-String-Vergleich (gleiche Implementierung wie in gmail-event-webhook). */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Stripe Signature (HMAC-SHA256).
 * Header-Format: "t=1492774577,v1=hex_signature[,...]".
 * Lehnt ab, wenn Timestamp älter als 5 Minuten ist.
 */
export async function verifyStripeSignature(
  payload: string,
  signature: string | null,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  if (!signature || !secret) return false;
  try {
    const parts = signature.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
    const sig = parts.find((p) => p.startsWith("v1="))?.slice(3);
    if (!timestamp || !sig) return false;
    const age = Math.abs(nowSeconds - parseInt(timestamp, 10));
    if (age > 300) return false;
    const signedPayload = `${timestamp}.${payload}`;
    const bytes = await hmacSign(secret, signedPayload, "SHA-256");
    return sig === bytesToHex(bytes);
  } catch {
    return false;
  }
}

/**
 * CopeCart Signature: hex(HMAC-SHA256(secret, rawBody)).
 */
export async function verifyCopeCartSignature(
  payload: string,
  signature: string | null,
  secret: string,
): Promise<boolean> {
  if (!signature || !secret) return false;
  try {
    const bytes = await hmacSign(secret, payload, "SHA-256");
    return signature === bytesToHex(bytes);
  } catch {
    return false;
  }
}

/**
 * Twilio Signature (HMAC-SHA1, base64).
 * data = url + sort(params).map(k => k + value).join("")
 */
export async function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string | null,
  authToken: string,
): Promise<boolean> {
  if (!signature || !authToken) return false;
  try {
    const sortedKeys = Object.keys(params).sort();
    let data = url;
    for (const key of sortedKeys) data += key + params[key];
    const bytes = await hmacSign(authToken, data, "SHA-1");
    const expected = bytesToBase64(bytes);
    return signature === expected;
  } catch {
    return false;
  }
}

/**
 * Zoom Signature.
 * Erwartung: x-zm-signature: "v0=<hex>", x-zm-request-timestamp: "<unix>".
 * message = "v0:" + timestamp + ":" + payload, hash = HMAC-SHA256.
 */
export async function verifyZoomSignature(
  payload: string,
  signature: string | null,
  timestamp: string | null,
  secret: string,
): Promise<boolean> {
  if (!signature || !timestamp || !secret) return false;
  try {
    const message = `v0:${timestamp}:${payload}`;
    const bytes = await hmacSign(secret, message, "SHA-256");
    const expected = "v0=" + bytesToHex(bytes);
    return signature === expected;
  } catch {
    return false;
  }
}

/**
 * Zoom URL-validation Challenge.
 * Für event="endpoint.url_validation" gibt die Edge Function
 * { plainToken, encryptedToken } zurück — encryptedToken = hex(hmac_sha256(secret, plainToken)).
 */
export async function zoomChallengeToken(plainToken: string, secret: string): Promise<string> {
  const bytes = await hmacSign(secret, plainToken, "SHA-256");
  return bytesToHex(bytes);
}

/**
 * Gmail Event Webhook — prefer X-Webhook-Signature (HMAC-SHA256 hex), fallback X-Webhook-Secret.
 * Verwendet timingSafeEqual.
 */
export async function verifyGmailWebhook(
  payload: string,
  sigHeader: string | null,
  secretHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!secret) return false;
  try {
    if (sigHeader) {
      const bytes = await hmacSign(secret, payload, "SHA-256");
      const expected = bytesToHex(bytes);
      return timingSafeEqual(sigHeader.toLowerCase(), expected);
    }
    if (secretHeader) {
      return timingSafeEqual(secretHeader, secret);
    }
    return false;
  } catch {
    return false;
  }
}
