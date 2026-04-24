import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate JWT and check role
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Use service role client for DB operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check role
    const { data: hasRole } = await adminClient.rpc("has_min_role", {
      _user_id: userId,
      _min_role: "mitarbeiter",
    });

    if (!hasRole) {
      return new Response(JSON.stringify({ error: "Insufficient role" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse body
    let parsedBody: unknown;
    try {
      parsedBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const offer_id = (parsedBody as Record<string, unknown>)?.offer_id;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!offer_id || typeof offer_id !== 'string' || !UUID_REGEX.test(offer_id)) {
      return new Response(
        JSON.stringify({ error: "Valid offer_id (UUID) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load offer + lead
    const { data: offer, error: offerError } = await adminClient
      .from("offers")
      .select(
        `*, crm_leads!inner(id, first_name, last_name, email, company)`
      )
      .eq("id", offer_id)
      .single();

    if (offerError || !offer) {
      return new Response(
        JSON.stringify({ error: "Offer not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const lead = offer.crm_leads as {
      first_name: string;
      last_name: string | null;
      email: string;
      company: string | null;
    };

    if (!lead.email) {
      return new Response(
        JSON.stringify({ error: "Lead has no email address" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build public link
    const siteUrl = "https://signature-spark-system.lovable.app";
    const publicLink = `${siteUrl}/offer/${offer.public_token}`;
    const expiresDate = offer.expires_at
      ? new Date(offer.expires_at).toLocaleDateString("de-DE")
      : null;

    const leadName = [lead.first_name, lead.last_name]
      .filter(Boolean)
      .join(" ");

    // HTML email
    const htmlBody = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px 40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">KI-Automationen System</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="font-size:16px;color:#18181b;margin:0 0 16px;">Hallo ${leadName},</p>
          <p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 24px;">
            wir haben ein individuelles Angebot für ${lead.company ? lead.company : "Sie"} erstellt.
            Klicken Sie auf den Button unten, um Ihr Angebot einzusehen und bei Interesse direkt digital zu unterschreiben.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px;">
            <a href="${publicLink}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;">
              Angebot ansehen
            </a>
          </td></tr></table>
          ${expiresDate ? `<p style="font-size:14px;color:#71717a;margin:0 0 24px;">⏰ Dieses Angebot ist gültig bis zum <strong>${expiresDate}</strong>.</p>` : ""}
          <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;" />
          <p style="font-size:13px;color:#a1a1aa;margin:0;line-height:1.5;">
            Bei Fragen erreichen Sie uns jederzeit.<br/>
            Mit freundlichen Grüßen,<br/>
            <strong>Ihr KRS Team</strong>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "KI-Automationen System <onboarding@resend.dev>",
        to: [lead.email],
        subject: `Ihr Angebot von KRS${lead.company ? ` für ${lead.company}` : ""}`,
        html: htmlBody,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", errText);
      return new Response(
        JSON.stringify({ error: "Email sending failed", details: errText }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resendData = await resendRes.json();
    return new Response(
      JSON.stringify({ success: true, email_id: resendData.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("send-offer-email error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
