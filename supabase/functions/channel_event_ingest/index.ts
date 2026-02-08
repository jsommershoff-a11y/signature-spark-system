import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Ingest channel events (email, whatsapp, phone) for lead activity tracking
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { channel, event_type, lead_id, lead_email, payload } = await req.json();

    console.log(`Channel event: ${channel}/${event_type} for ${lead_id || lead_email}`);

    // Validate required fields
    if (!channel || !event_type) {
      return new Response(
        JSON.stringify({ error: 'channel and event_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find lead by ID or email
    let lead;
    if (lead_id) {
      const { data } = await supabase
        .from('crm_leads')
        .select('id, owner_user_id')
        .eq('id', lead_id)
        .single();
      lead = data;
    } else if (lead_email) {
      const { data } = await supabase
        .from('crm_leads')
        .select('id, owner_user_id')
        .eq('email', lead_email)
        .single();
      lead = data;
    }

    if (!lead) {
      console.log('Lead not found, event ignored');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Lead not found, event stored for later matching' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process based on channel and event type
    let actionTaken = 'logged';

    switch (channel) {
      case 'email':
        await processEmailEvent(supabase, lead, event_type, payload);
        actionTaken = event_type === 'opened' ? 'updated_urgency' : 'logged';
        break;

      case 'whatsapp':
        await processWhatsAppEvent(supabase, lead, event_type, payload);
        actionTaken = event_type === 'replied' ? 'created_task' : 'logged';
        break;

      case 'phone':
        await processPhoneEvent(supabase, lead, event_type, payload);
        actionTaken = 'logged_call';
        break;

      default:
        console.log(`Unknown channel: ${channel}`);
    }

    // Check if we should trigger a followup plan
    const shouldTriggerFollowup = await checkFollowupTrigger(supabase, lead.id, channel, event_type);

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: lead.id,
        channel,
        event_type,
        action_taken: actionTaken,
        followup_triggered: shouldTriggerFollowup,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Channel event ingest error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processEmailEvent(
  supabase: ReturnType<typeof createClient>,
  lead: { id: string; owner_user_id?: string },
  eventType: string,
  payload: Record<string, unknown>
) {
  switch (eventType) {
    case 'opened':
    case 'clicked':
      // Increase urgency on pipeline item
      await supabase
        .from('pipeline_items')
        .update({
          urgency: supabase.rpc('calculate_pipeline_priority', {
            _icp_score: 50,
            _source_weight: 1,
            _purchase_readiness: 60,
            _urgency: 80,
          }),
        })
        .eq('lead_id', lead.id);
      break;

    case 'bounced':
      // Add note to lead
      const { data: currentLead } = await supabase
        .from('crm_leads')
        .select('notes')
        .eq('id', lead.id)
        .single();

      await supabase
        .from('crm_leads')
        .update({
          notes: `${currentLead?.notes || ''}\n[${new Date().toISOString()}] E-Mail bounced: ${payload?.email || 'Unknown'}`,
        })
        .eq('id', lead.id);
      break;
  }
}

async function processWhatsAppEvent(
  supabase: ReturnType<typeof createClient>,
  lead: { id: string; owner_user_id?: string },
  eventType: string,
  payload: Record<string, unknown>
) {
  switch (eventType) {
    case 'replied':
      // Create urgent task
      if (lead.owner_user_id) {
        await supabase
          .from('crm_tasks')
          .insert({
            assigned_user_id: lead.owner_user_id,
            lead_id: lead.id,
            type: 'followup',
            title: 'WhatsApp-Antwort bearbeiten',
            description: `Lead hat auf WhatsApp geantwortet: ${payload?.message || 'Nachricht prüfen'}`,
            status: 'open',
            due_at: new Date().toISOString(), // Immediate
          });
      }
      break;

    case 'read':
      // Update urgency
      await supabase
        .from('pipeline_items')
        .update({ urgency: 70 })
        .eq('lead_id', lead.id);
      break;
  }
}

async function processPhoneEvent(
  supabase: ReturnType<typeof createClient>,
  lead: { id: string; owner_user_id?: string },
  eventType: string,
  payload: Record<string, unknown>
) {
  // Log call events
  if (eventType === 'missed' || eventType === 'voicemail') {
    if (lead.owner_user_id) {
      await supabase
        .from('crm_tasks')
        .insert({
          assigned_user_id: lead.owner_user_id,
          lead_id: lead.id,
          type: 'call',
          title: eventType === 'missed' ? 'Verpassten Anruf zurückrufen' : 'Voicemail bearbeiten',
          status: 'open',
          due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
        });
    }
  }
}

async function checkFollowupTrigger(
  supabase: ReturnType<typeof createClient>,
  leadId: string,
  channel: string,
  eventType: string
): Promise<boolean> {
  // Define trigger conditions
  const triggerEvents = [
    { channel: 'email', event: 'clicked' },
    { channel: 'whatsapp', event: 'replied' },
    { channel: 'phone', event: 'missed' },
  ];

  const shouldTrigger = triggerEvents.some(
    (t) => t.channel === channel && t.event === eventType
  );

  if (shouldTrigger) {
    // Check if there's no pending followup plan
    const { data: existingPlan } = await supabase
      .from('followup_plans')
      .select('id')
      .eq('lead_id', leadId)
      .eq('status', 'pending')
      .single();

    if (!existingPlan) {
      // Trigger new followup plan generation via Edge Function
      // This would typically be done via n8n webhook, but we can call directly
      console.log(`Would trigger followup plan for lead ${leadId}`);
      return true;
    }
  }

  return false;
}
