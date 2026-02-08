import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Approve or reject a followup plan
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { plan_id, approve, reason } = await req.json();

    if (!plan_id) {
      return new Response(
        JSON.stringify({ error: 'plan_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`${approve ? 'Approving' : 'Rejecting'} plan ${plan_id} by user ${user.id}`);

    // Get the plan
    const { data: plan, error: planError } = await supabase
      .from('followup_plans')
      .select('*, steps:followup_steps(*)')
      .eq('id', plan_id)
      .single();

    if (planError) throw planError;

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
          // Create a scheduled call
          await supabase
            .from('calls')
            .insert({
              lead_id: plan.lead_id,
              provider: 'manual',
              call_type: 'phone',
              scheduled_at: step.scheduled_at,
              status: 'scheduled',
              notes: step.content_json?.content || 'Automatisch geplant',
            });
        } else if (step.step_type === 'task') {
          // Create a task
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
                title: step.content_json?.content || 'Followup-Aufgabe',
                status: 'open',
                due_at: step.scheduled_at,
              });
          }
        }
        // Email/WhatsApp steps would typically be handled by n8n automation
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
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
