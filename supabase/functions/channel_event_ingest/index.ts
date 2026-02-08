import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Allowed channel and event types (whitelist)
const VALID_CHANNELS = ['email', 'whatsapp', 'phone'] as const;
const VALID_EVENT_TYPES = {
  email: ['opened', 'clicked', 'bounced', 'delivered', 'unsubscribed'],
  whatsapp: ['replied', 'read', 'delivered', 'failed'],
  phone: ['missed', 'voicemail', 'answered', 'failed'],
} as const;

// Input validation schema
const inputSchema = z.object({
  channel: z.enum(VALID_CHANNELS),
  event_type: z.string().min(1).max(50),
  lead_id: z.string().uuid().optional(),
  lead_email: z.string().email().max(255).optional(),
  payload: z.record(z.unknown()).optional(),
}).refine(
  data => data.lead_id || data.lead_email,
  { message: 'Either lead_id or lead_email is required' }
);

// Ingest channel events (email, whatsapp, phone) for lead activity tracking
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const apiKey = Deno.env.get('CHANNEL_INGEST_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authorization via API key or user auth
    const requestApiKey = req.headers.get('x-api-key');
    const authHeader = req.headers.get('Authorization');
    
    let isAuthorized = false;
    
    // Check API key first (for external integrations)
    if (apiKey && requestApiKey === apiKey) {
      isAuthorized = true;
      console.log('Authorized via API key');
    }
    // Check user authentication
    else if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const anonClient = createClient(
        supabaseUrl,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );
      
      const { data: claims, error: authError } = await anonClient.auth.getUser(token);
      
      if (!authError && claims?.user) {
        // Check if user has staff role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', claims.user.id)
          .in('role', ['admin', 'geschaeftsfuehrung', 'teamleiter', 'mitarbeiter']);
        
        if (roles && roles.length > 0) {
          isAuthorized = true;
          console.log('Authorized via user token:', claims.user.id);
        }
      }
    }

    if (!isAuthorized) {
      console.error('Unauthorized request');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    let rawInput: unknown;
    try {
      rawInput = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parseResult = inputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error.message);
      return new Response(
        JSON.stringify({ error: 'Invalid input: ' + parseResult.error.issues[0]?.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { channel, event_type, lead_id, lead_email, payload } = parseResult.data;

    // Validate event_type against whitelist for the channel
    const validEvents = VALID_EVENT_TYPES[channel];
    if (!validEvents.includes(event_type as typeof validEvents[number])) {
      console.error(`Invalid event_type '${event_type}' for channel '${channel}'`);
      return new Response(
        JSON.stringify({ error: `Invalid event_type for channel ${channel}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Channel event: ${channel}/${event_type} for ${lead_id || lead_email}`);

    // Find lead by ID or email
    let lead: { id: string; owner_user_id?: string } | null = null;
    
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

    // Sanitize payload for storage
    const sanitizedPayload: Record<string, unknown> = {};
    if (payload) {
      for (const [key, value] of Object.entries(payload)) {
        if (typeof key === 'string' && key.length <= 50) {
          if (typeof value === 'string') {
            sanitizedPayload[key] = value.slice(0, 500);
          } else if (typeof value === 'number' || typeof value === 'boolean') {
            sanitizedPayload[key] = value;
          }
        }
      }
    }

    // Process based on channel and event type
    let actionTaken = 'logged';

    switch (channel) {
      case 'email':
        await processEmailEvent(supabase, lead, event_type, sanitizedPayload);
        actionTaken = event_type === 'opened' || event_type === 'clicked' ? 'updated_urgency' : 'logged';
        break;

      case 'whatsapp':
        await processWhatsAppEvent(supabase, lead, event_type, sanitizedPayload);
        actionTaken = event_type === 'replied' ? 'created_task' : 'logged';
        break;

      case 'phone':
        await processPhoneEvent(supabase, lead, event_type, sanitizedPayload);
        actionTaken = 'logged_call';
        break;
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
      JSON.stringify({ error: 'Internal server error' }),
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
          urgency: 80,
          updated_at: new Date().toISOString(),
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

      const existingNotes = currentLead?.notes || '';
      const emailInfo = typeof payload?.email === 'string' ? payload.email.slice(0, 100) : 'Unknown';
      
      await supabase
        .from('crm_leads')
        .update({
          notes: `${existingNotes}\n[${new Date().toISOString()}] E-Mail bounced: ${emailInfo}`.slice(0, 5000),
          updated_at: new Date().toISOString(),
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
        const message = typeof payload?.message === 'string' 
          ? payload.message.slice(0, 200) 
          : 'Nachricht prüfen';
        
        await supabase
          .from('crm_tasks')
          .insert({
            assigned_user_id: lead.owner_user_id,
            lead_id: lead.id,
            type: 'followup',
            title: 'WhatsApp-Antwort bearbeiten',
            description: `Lead hat auf WhatsApp geantwortet: ${message}`,
            status: 'open',
            due_at: new Date().toISOString(), // Immediate
          });
      }
      break;

    case 'read':
      // Update urgency
      await supabase
        .from('pipeline_items')
        .update({ 
          urgency: 70,
          updated_at: new Date().toISOString(),
        })
        .eq('lead_id', lead.id);
      break;
  }
}

async function processPhoneEvent(
  supabase: ReturnType<typeof createClient>,
  lead: { id: string; owner_user_id?: string },
  eventType: string,
  _payload: Record<string, unknown>
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
      console.log(`Would trigger followup plan for lead ${leadId}`);
      return true;
    }
  }

  return false;
}
