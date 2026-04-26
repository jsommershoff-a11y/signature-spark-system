import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- Internal-only authentication ---
    // This function must only be called by process-email-queue (server-side).
    // Validate via CRON_SECRET header or service_role JWT.
    const internalSecret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization");
    const cronHeader = req.headers.get("x-cron-secret");

    const isServiceRole = authHeader?.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "__none__");
    const isCronAuth = internalSecret && cronHeader === internalSecret;

    if (!isServiceRole && !isCronAuth) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message_id, to_email, subject, body_html, enrollment_id, lead_id } = await req.json();
    
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Add tracking pixel
    const trackingPixelUrl = `${supabaseUrl}/functions/v1/email-tracker?mid=${message_id}&event=opened`;
    let htmlWithTracking = body_html + `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none" />`;

    // Add unsubscribe link for sequence emails
    if (enrollment_id || lead_id) {
      const unsubParams = new URLSearchParams();
      if (enrollment_id) unsubParams.set("eid", enrollment_id);
      if (lead_id) unsubParams.set("lid", lead_id);
      const unsubscribeUrl = `${supabaseUrl}/functions/v1/email-unsubscribe?${unsubParams.toString()}`;
      
      htmlWithTracking += `
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e5e5;text-align:center;font-size:12px;color:#999;">
          <p>Du möchtest keine weiteren E-Mails erhalten?<br>
          <a href="${unsubscribeUrl}" style="color:#16613b;text-decoration:underline;">Hier abmelden</a></p>
        </div>`;
    }

    // Send via Resend
    const headers: Record<string, string> = {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    };

    const resendBody: Record<string, unknown> = {
      from: "KI-Automationen <hi-there@ki-automationen.io>",
      to: [to_email],
      subject,
      html: htmlWithTracking,
    };

    // Add List-Unsubscribe header for email clients
    if (enrollment_id || lead_id) {
      const unsubParams = new URLSearchParams();
      if (enrollment_id) unsubParams.set("eid", enrollment_id);
      if (lead_id) unsubParams.set("lid", lead_id);
      const unsubscribeUrl = `${supabaseUrl}/functions/v1/email-unsubscribe?${unsubParams.toString()}`;
      resendBody.headers = {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify(resendBody),
    });

    const resData = await res.json();
    
    if (!res.ok) {
      await supabase.from("email_messages").update({ status: "failed" }).eq("id", message_id);
      throw new Error(resData.message || "Resend error");
    }

    // Update message status to sent
    await supabase.from("email_messages").update({
      status: "sent",
      sent_at: new Date().toISOString(),
      resend_message_id: resData.id,
    }).eq("id", message_id);

    return new Response(JSON.stringify({ success: true, resend_id: resData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-campaign-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
