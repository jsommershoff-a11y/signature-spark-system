import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WebhookSpec {
  name: string;
  description: string;
  expected_env: string[];
  signature_method: string;
}

const WEBHOOKS: WebhookSpec[] = [
  {
    name: "webhook-payment",
    description: "Stripe / CopeCart Checkout-Session Events",
    expected_env: ["STRIPE_WEBHOOK_SECRET", "COPECART_WEBHOOK_SECRET"],
    signature_method:
      "HMAC-SHA256 (stripe-signature t=/v1=, 5min Toleranz) ODER HMAC-SHA256 hex (x-copecart-signature)",
  },
  {
    name: "stripe-connect-webhook",
    description: "Stripe Connect Affiliate-Payouts",
    expected_env: ["STRIPE_SECRET_KEY", "STRIPE_CONNECT_WEBHOOK_SECRET"],
    signature_method: "stripe.webhooks.constructEventAsync (stripe-signature)",
  },
  {
    name: "webhook-twilio",
    description: "Twilio Voice / SMS Status Updates",
    expected_env: ["TWILIO_AUTH_TOKEN"],
    signature_method: "HMAC-SHA1 (x-twilio-signature, sortierte URL+Params)",
  },
  {
    name: "webhook-zoom",
    description: "Zoom Recording / Meeting Events",
    expected_env: ["ZOOM_WEBHOOK_SECRET"],
    signature_method:
      "HMAC-SHA256 (x-zm-signature v0=, x-zm-request-timestamp) inkl. URL-Validation Challenge",
  },
  {
    name: "sipgate-webhook",
    description: "Sipgate Voice Push (NO signature verification)",
    expected_env: [],
    signature_method: "keine",
  },
  {
    name: "gmail-event-webhook",
    description: "Generic event → branded Gmail notifications",
    expected_env: ["GMAIL_WEBHOOK_SECRET"],
    signature_method:
      "HMAC-SHA256 hex (x-webhook-signature) ODER shared secret (x-webhook-secret), timingSafeEqual",
  },
];

interface EnvCheck {
  name: string;
  configured: boolean;
}

interface HealthCheck {
  name: string;
  description: string;
  status: "ok" | "missing_secrets";
  signature_method: string;
  env: EnvCheck[];
}

serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const checks: HealthCheck[] = WEBHOOKS.map((wh) => {
    const env: EnvCheck[] = wh.expected_env.map((envName) => ({
      name: envName,
      configured: !!Deno.env.get(envName),
    }));
    const all_configured =
      wh.expected_env.length === 0 || env.every((e) => e.configured);
    return {
      name: wh.name,
      description: wh.description,
      status: all_configured ? "ok" : "missing_secrets",
      signature_method: wh.signature_method,
      env,
    };
  });

  const overall = checks.every((c) => c.status === "ok") ? "ok" : "degraded";

  const body = {
    overall,
    timestamp: new Date().toISOString(),
    webhooks: checks,
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
