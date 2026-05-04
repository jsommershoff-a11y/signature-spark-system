// Admin-only status check for the inbound email pipeline.
// Returns:
//  - configured webhook URL + secret presence
//  - configured inbound reply domain
//  - configured notification channels (Resend, Teams)
//  - last 10 ticket activities of type "email_inbound"
//  - last 5 "Needs Review" tickets

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // --- Authn / Authz ---
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401);
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userRes.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    // --- Configured environment ---
    const inboundSecret = !!Deno.env.get("INBOUND_EMAIL_SECRET");
    const replyDomain =
      Deno.env.get("INBOUND_REPLY_DOMAIN") || null;
    const resendOk = !!Deno.env.get("RESEND_API_KEY");
    const teamsOk =
      !!Deno.env.get("MICROSOFT_TEAMS_API_KEY") &&
      !!Deno.env.get("LOVABLE_API_KEY");

    const webhookUrl = `${SUPABASE_URL}/functions/v1/inbound-email-webhook${
      inboundSecret ? "?secret=••••••" : ""
    }`;

    // --- Recent inbound activity ---
    const { data: recentInbound } = await admin
      .from("activities")
      .select("id, content, metadata, created_at, lead_id")
      .eq("type", "email_inbound")
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: needsReview } = await admin
      .from("support_tickets")
      .select("id, subject, status, priority, created_at")
      .ilike("subject", "[Needs Review]%")
      .order("created_at", { ascending: false })
      .limit(5);

    // Inbound-Routes (admin-konfigurierbar)
    const { data: routes } = await admin
      .from("inbound_email_config")
      .select("id, label, local_part, reply_domain, default_priority, is_default, enabled, description, created_at, updated_at")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    const defaultRoute = (routes || []).find((r: any) => r.is_default && r.enabled) || null;
    const sampleAddress = defaultRoute
      ? `${defaultRoute.local_part}+abcd1234@${defaultRoute.reply_domain}`
      : (replyDomain
        ? `ticket+abcd1234@${replyDomain}`
        : "ticket+abcd1234@<INBOUND_REPLY_DOMAIN>");

    // Last successful inbound (for "is the pipeline alive?" indicator)
    const lastInboundAt = recentInbound?.[0]?.created_at ?? null;

    return json({
      webhook: {
        url: webhookUrl,
        secret_configured: inboundSecret,
      },
      reply: {
        domain: defaultRoute?.reply_domain ?? replyDomain,
        domain_configured: !!(defaultRoute || replyDomain),
        sample_address: sampleAddress,
      },
      routes: routes ?? [],
      notifications: {
        resend_configured: resendOk,
        teams_configured: teamsOk,
        team_inbox: "info@krs-signature.de",
      },
      health: {
        last_inbound_at: lastInboundAt,
        recent_inbound_count: recentInbound?.length ?? 0,
        needs_review_open: (needsReview ?? []).filter(
          (t: any) => t.status !== "closed" && t.status !== "resolved",
        ).length,
      },
      recent_inbound: recentInbound ?? [],
      needs_review_tickets: needsReview ?? [],
    });
  } catch (e) {
    console.error("inbound-email-status error", e);
    return json({ error: (e as Error).message ?? "internal_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
