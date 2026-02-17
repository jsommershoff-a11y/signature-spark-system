import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

const inputSchema = z.object({
  lead_email: z.string().email().max(255).optional(),
  lead_id: z.string().uuid().optional(),
  subject: z.string().min(1).max(500),
  body: z.string().max(5000).optional(),
  direction: z.enum(['inbound', 'outbound']),
  sent_at: z.string().datetime().optional(),
}).refine(
  data => data.lead_id || data.lead_email,
  { message: 'Either lead_id or lead_email is required' }
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth via API key
    const apiKey = Deno.env.get('CHANNEL_INGEST_API_KEY');
    const requestApiKey = req.headers.get('x-api-key');

    if (!apiKey || requestApiKey !== apiKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse input
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
      return new Response(
        JSON.stringify({ error: 'Invalid input: ' + parseResult.error.issues[0]?.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lead_email, lead_id, subject, body, direction, sent_at } = parseResult.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find lead
    let lead: { id: string; owner_user_id: string | null } | null = null;

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
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build activity
    const dirLabel = direction === 'outbound' ? 'Ausgehende' : 'Eingehende';
    const content = `${dirLabel} E-Mail: ${subject}`;

    const activityUserId = lead.owner_user_id;
    if (!activityUserId) {
      return new Response(
        JSON.stringify({ error: 'Lead has no owner, cannot log activity' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: activity, error: insertError } = await supabase
      .from('activities')
      .insert({
        lead_id: lead.id,
        user_id: activityUserId,
        type: 'email',
        content,
        metadata: {
          source: 'manus_api',
          direction,
          subject,
          ...(body ? { body: body.slice(0, 5000) } : {}),
          sent_at: sent_at || new Date().toISOString(),
        },
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to log email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, activity_id: activity.id, lead_id: lead.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('log-email error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
