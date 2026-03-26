import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const inputSchema = z.object({
  plan_id: z.string().regex(UUID_REGEX, 'Invalid plan_id format'),
  approve: z.boolean(),
  reason: z.string().max(500).optional(),
});

// Approve or reject a followup plan
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Validate token via getClaims
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check role - require at least teamleiter
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'gruppenbetreuer']);

    if (!roles || roles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Teamleiter or higher required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      return new Response(
        JSON.stringify({ error: 'Invalid input: ' + parseResult.error.issues[0]?.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { plan_id, approve, reason } = parseResult.data;

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`${approve ? 'Approving' : 'Rejecting'} plan ${plan_id} by user ${userId}`);

    // Get the plan
    const { data: plan, error: planError } = await supabase
      .from('followup_plans')
      .select('*, steps:followup_steps(*)')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (plan.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Plan is not pending' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();

    if (approve) {
      // Update plan to approved
      await supabase
        .from('followup_plans')
        .update({
          status: 'approved',
          approved_by: profile.id,
          approved_at: now,
        })
        .eq('id', plan_id);

      // Create tasks/calls from steps
      for (const step of plan.steps || []) {
        if (step.step_type === 'call') {
          await supabase
            .from('calls')
            .insert({
              lead_id: plan.lead_id,
              provider: 'manual',
              call_type: 'phone',
              scheduled_at: step.scheduled_at,
              status: 'scheduled',
              notes: (typeof step.content_json?.content === 'string' ? step.content_json.content : 'Automatisch geplant').slice(0, 500),
            });
        } else if (step.step_type === 'task') {
          const { data: lead } = await supabase
            .from('crm_leads')
            .select('owner_user_id')
            .eq('id', plan.lead_id)
            .single();

          if (lead?.owner_user_id) {
            await supabase
              .from('crm_tasks')
              .insert({
                assigned_user_id: lead.owner_user_id,
                lead_id: plan.lead_id,
                type: 'followup',
                title: (typeof step.content_json?.content === 'string' ? step.content_json.content : 'Followup-Aufgabe').slice(0, 100),
                status: 'open',
                due_at: step.scheduled_at,
              });
          }
        }
      }

      console.log(`Plan ${plan_id} approved, created ${plan.steps?.length || 0} items`);

      return new Response(
        JSON.stringify({
          success: true,
          plan_id,
          status: 'approved',
          items_created: plan.steps?.length || 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // Reject the plan
      await supabase
        .from('followup_plans')
        .update({
          status: 'rejected',
          approved_by: profile.id,
          approved_at: now,
          execution_result: { rejection_reason: reason || 'Abgelehnt' },
        })
        .eq('id', plan_id);

      console.log(`Plan ${plan_id} rejected`);

      return new Response(
        JSON.stringify({
          success: true,
          plan_id,
          status: 'rejected',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Approve followup plan error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
