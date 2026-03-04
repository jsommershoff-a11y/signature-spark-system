import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message_id, to_email, subject, body_html } = await req.json();
    
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Add tracking pixel
    const trackingPixelUrl = `${supabaseUrl}/functions/v1/email-tracker?mid=${message_id}&event=opened`;
    const htmlWithTracking = body_html + `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none" />`;

    // Send via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "KRS Signature <info@krs-signature.de>",
        to: [to_email],
        subject,
        html: htmlWithTracking,
      }),
    });

    const resData = await res.json();
    
    if (!res.ok) {
      // Update message status to failed
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
