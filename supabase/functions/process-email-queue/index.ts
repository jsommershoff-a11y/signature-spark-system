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

    // ========================================
    // PART A — Generate queued emails from active enrollments
    // ========================================
    let generated = 0;

    const { data: enrollments, error: enrollErr } = await supabase
      .from("lead_sequence_enrollments")
      .select("*, email_sequences!inner(status)")
      .eq("status", "active")
      .eq("email_sequences.status", "active");

    if (enrollErr) {
      console.error("Error fetching enrollments:", enrollErr);
    }

    if (enrollments && enrollments.length > 0) {
      for (const enrollment of enrollments) {
        const nextStepOrder = (enrollment.current_step || 0) + 1;

        // Get the next step for this sequence
        const { data: step, error: stepErr } = await supabase
          .from("email_sequence_steps")
          .select("*, email_templates(*)")
          .eq("sequence_id", enrollment.sequence_id)
          .eq("step_order", nextStepOrder)
          .single();

        if (stepErr || !step) {
          // No more steps → mark enrollment as completed
          if (enrollment.current_step > 0) {
            await supabase
              .from("lead_sequence_enrollments")
              .update({ status: "completed", completed_at: new Date().toISOString() })
              .eq("id", enrollment.id);
          }
          continue;
        }

        // Calculate scheduled_at based on enrolled_at + delay_minutes
        const enrolledAt = new Date(enrollment.enrolled_at || enrollment.created_at);
        const delayMs = (step.delay_minutes || 0) * 60 * 1000;
        const scheduledAt = new Date(enrolledAt.getTime() + delayMs);

        // Only generate if scheduled time has passed
        if (scheduledAt > new Date()) continue;

        // Check if message already exists for this enrollment + step
        const { data: existing } = await supabase
          .from("email_messages")
          .select("id")
          .eq("enrollment_id", enrollment.id)
          .eq("template_id", step.template_id)
          .limit(1);

        if (existing && existing.length > 0) {
          // Already generated, advance step and continue
          await supabase
            .from("lead_sequence_enrollments")
            .update({ current_step: nextStepOrder })
            .eq("id", enrollment.id);
          continue;
        }

        // Get template content (fallback to subject_override)
        const template = step.email_templates;
        const subject = template?.subject || step.subject_override || "Kein Betreff";
        const bodyHtml = template?.body_html || "<p>Kein Inhalt</p>";

        // Insert queued email message
        const { error: insertErr } = await supabase
          .from("email_messages")
          .insert({
            enrollment_id: enrollment.id,
            template_id: step.template_id,
            lead_id: enrollment.lead_id,
            subject,
            body_html: bodyHtml,
            status: "queued",
            scheduled_at: scheduledAt.toISOString(),
            message_type: "sequence",
          });

        if (!insertErr) {
          generated++;
          // Advance current_step
          const { data: totalSteps } = await supabase
            .from("email_sequence_steps")
            .select("id")
            .eq("sequence_id", enrollment.sequence_id);

          const isLastStep = nextStepOrder >= (totalSteps?.length || 0);

          await supabase
            .from("lead_sequence_enrollments")
            .update({
              current_step: nextStepOrder,
              ...(isLastStep
                ? { status: "completed", completed_at: new Date().toISOString() }
                : {}),
            })
            .eq("id", enrollment.id);
        }
      }
    }

    // ========================================
    // PART B — Send queued emails where scheduled_at <= now
    // ========================================
    const { data: queuedMessages, error: fetchError } = await supabase
      .from("email_messages")
      .select("*, crm_leads!email_messages_lead_id_fkey(email, first_name, last_name, company)")
      .eq("status", "queued")
      .lte("scheduled_at", new Date().toISOString())
      .limit(50);

    if (fetchError) throw fetchError;
    if (!queuedMessages || queuedMessages.length === 0) {
      return new Response(JSON.stringify({ generated, processed: 0 }), {
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

    return new Response(JSON.stringify({ generated, processed, total_queued: queuedMessages.length }), {
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
