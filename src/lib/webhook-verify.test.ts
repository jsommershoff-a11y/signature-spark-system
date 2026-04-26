import { describe, it, expect } from "vitest";
import {
  verifyStripeSignature,
  verifyCopeCartSignature,
  verifyTwilioSignature,
  verifyZoomSignature,
  zoomChallengeToken,
  verifyGmailWebhook,
  timingSafeEqual,
} from "./webhook-verify";

const SECRET = "whsec_test_secret_12345";

async function hmacHex(
  secret: string,
  data: string,
  hash: "SHA-256" | "SHA-1" = "SHA-256",
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacBase64(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  let bin = "";
  for (const b of new Uint8Array(sig)) bin += String.fromCharCode(b);
  return btoa(bin);
}

describe("verifyStripeSignature", () => {
  it("akzeptiert gültige Signatur innerhalb von 5min", async () => {
    const payload = '{"type":"checkout.session.completed","data":{"object":{"id":"sess_1"}}}';
    const ts = Math.floor(Date.now() / 1000);
    const expected = await hmacHex(SECRET, `${ts}.${payload}`);
    const header = `t=${ts},v1=${expected}`;
    expect(await verifyStripeSignature(payload, header, SECRET, ts)).toBe(true);
  });

  it("lehnt Timestamp älter als 5min ab (Replay-Schutz)", async () => {
    const payload = "test";
    const ts = Math.floor(Date.now() / 1000) - 400;
    const expected = await hmacHex(SECRET, `${ts}.${payload}`);
    const header = `t=${ts},v1=${expected}`;
    expect(await verifyStripeSignature(payload, header, SECRET)).toBe(false);
  });

  it("lehnt falsche Signatur ab", async () => {
    const payload = "test";
    const ts = Math.floor(Date.now() / 1000);
    const header = `t=${ts},v1=deadbeef0000000000000000000000000000000000000000000000000000000000`;
    expect(await verifyStripeSignature(payload, header, SECRET, ts)).toBe(false);
  });

  it("lehnt unvollständigen Header ab", async () => {
    expect(await verifyStripeSignature("p", "t=123", SECRET)).toBe(false);
    expect(await verifyStripeSignature("p", "v1=abc", SECRET)).toBe(false);
  });

  it("lehnt null-Signatur und leeren Secret ab", async () => {
    expect(await verifyStripeSignature("p", null, SECRET)).toBe(false);
    expect(await verifyStripeSignature("p", "t=1,v1=2", "")).toBe(false);
  });
});

describe("verifyCopeCartSignature", () => {
  it("akzeptiert gültigen Hex-HMAC-SHA256", async () => {
    const payload = '{"event_type":"order.completed"}';
    const expected = await hmacHex(SECRET, payload);
    expect(await verifyCopeCartSignature(payload, expected, SECRET)).toBe(true);
  });

  it("lehnt manipulierten Payload ab", async () => {
    const payload = "real";
    const expected = await hmacHex(SECRET, "fake");
    expect(await verifyCopeCartSignature(payload, expected, SECRET)).toBe(false);
  });

  it("lehnt null-Signatur ab", async () => {
    expect(await verifyCopeCartSignature("p", null, SECRET)).toBe(false);
  });
});

describe("verifyTwilioSignature", () => {
  it("akzeptiert gültige Signatur mit sortierten Params", async () => {
    const url = "https://example.com/webhook";
    const params = { CallSid: "CA1234", From: "+491234", To: "+495678" };
    const sortedKeys = Object.keys(params).sort();
    let data = url;
    for (const key of sortedKeys) data += key + (params as Record<string, string>)[key];
    const expected = await hmacBase64(SECRET, data);
    expect(await verifyTwilioSignature(url, params, expected, SECRET)).toBe(true);
  });

  it("lehnt fehlende Signatur ab", async () => {
    expect(await verifyTwilioSignature("https://x", {}, null, SECRET)).toBe(false);
  });

  it("lehnt leeren authToken ab", async () => {
    expect(await verifyTwilioSignature("https://x", {}, "abc=", "")).toBe(false);
  });

  it("erzwingt alphabetische Param-Sortierung", async () => {
    const url = "https://example.com";
    const params = { B: "2", A: "1" };
    const wrongOrder = await hmacBase64(SECRET, url + "B2A1");
    expect(await verifyTwilioSignature(url, params, wrongOrder, SECRET)).toBe(false);
  });
});

describe("verifyZoomSignature", () => {
  it("akzeptiert gültige v0-Signatur", async () => {
    const payload = '{"event":"recording.completed"}';
    const ts = String(Math.floor(Date.now() / 1000));
    const message = `v0:${ts}:${payload}`;
    const expected = "v0=" + (await hmacHex(SECRET, message));
    expect(await verifyZoomSignature(payload, expected, ts, SECRET)).toBe(true);
  });

  it("lehnt fehlenden v0=-Prefix ab", async () => {
    const payload = "p";
    const ts = "1700000000";
    const expected = await hmacHex(SECRET, `v0:${ts}:${payload}`);
    expect(await verifyZoomSignature(payload, expected, ts, SECRET)).toBe(false);
  });

  it("lehnt null-Timestamp ab", async () => {
    expect(await verifyZoomSignature("p", "v0=abc", null, SECRET)).toBe(false);
  });

  it("zoomChallengeToken erzeugt hex-HMAC", async () => {
    const plain = "plain_token_xyz";
    const expected = await hmacHex(SECRET, plain);
    expect(await zoomChallengeToken(plain, SECRET)).toBe(expected);
  });
});

describe("verifyGmailWebhook", () => {
  it("akzeptiert gültige X-Webhook-Signature (hex)", async () => {
    const payload = '{"event":"lead.created","to":"x@y.de"}';
    const sig = await hmacHex(SECRET, payload);
    expect(await verifyGmailWebhook(payload, sig, null, SECRET)).toBe(true);
  });

  it("akzeptiert gültigen X-Webhook-Secret als Fallback", async () => {
    expect(await verifyGmailWebhook("anything", null, SECRET, SECRET)).toBe(true);
  });

  it("lehnt ab, wenn beide Header fehlen", async () => {
    expect(await verifyGmailWebhook("p", null, null, SECRET)).toBe(false);
  });

  it("lehnt falschen shared secret ab", async () => {
    expect(await verifyGmailWebhook("p", null, "wrong_secret", SECRET)).toBe(false);
  });

  it("lehnt leeres Secret-ENV ab", async () => {
    expect(await verifyGmailWebhook("p", "abc", null, "")).toBe(false);
  });
});

describe("timingSafeEqual", () => {
  it("true für gleiche Strings", () => {
    expect(timingSafeEqual("abc123", "abc123")).toBe(true);
  });

  it("false für unterschiedliche Länge", () => {
    expect(timingSafeEqual("a", "ab")).toBe(false);
  });

  it("false für gleiche Länge, anderen Inhalt", () => {
    expect(timingSafeEqual("abcdef", "abcxyz")).toBe(false);
  });
});
