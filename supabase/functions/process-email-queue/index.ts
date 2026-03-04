import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Validate cron secret
    const cronSecret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("x-cron-secret");
    if (cronSecret && authHeader !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get queued messages
    const { data: queuedMessages, error: fetchError } = await supabase
      .from("email_messages")
      .select("*, crm_leads!email_messages_lead_id_fkey(email, first_name, last_name, company)")
      .eq("status", "queued")
      .limit(50);

    if (fetchError) throw fetchError;
    if (!queuedMessages || queuedMessages.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    for (const msg of queuedMessages) {
      const lead = (msg as any).crm_leads;
      if (!lead?.email) continue;

      // Replace variables in body
      let body = msg.body_html || '';
      body = body.replace(/\{\{first_name\}\}/g, lead.first_name || '');
      body = body.replace(/\{\{last_name\}\}/g, lead.last_name || '');
      body = body.replace(/\{\{company\}\}/g, lead.company || '');

      let subject = msg.subject || '';
      subject = subject.replace(/\{\{first_name\}\}/g, lead.first_name || '');
      subject = subject.replace(/\{\{company\}\}/g, lead.company || '');

      // Send via the send-campaign-email function
      const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-campaign-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          message_id: msg.id,
          to_email: lead.email,
          subject,
          body_html: body,
        }),
      });

      if (sendRes.ok) processed++;
    }

    return new Response(JSON.stringify({ processed, total: queuedMessages.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-email-queue error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
