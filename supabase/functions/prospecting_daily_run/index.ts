import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

// Daily prospecting run - generates new leads, tasks, and call queues
// This is an internal automation function - requires API key or cron secret
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const cronSecret = Deno.env.get('CRON_SECRET');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authorization - either cron secret or authenticated staff user
    const cronHeader = req.headers.get('x-cron-secret');
    const authHeader = req.headers.get('Authorization');
    
    let isAuthorized = false;
    
    // Check cron secret first (for scheduled jobs)
    if (cronSecret && cronHeader === cronSecret) {
      isAuthorized = true;
      console.log('Authorized via cron secret');
    }
    // Check user authentication (for manual triggers)
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
          .in('role', ['admin', 'vertriebspartner', 'gruppenbetreuer']);
        
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

    const today = new Date().toISOString().split('T')[0];
    console.log(`Starting prospecting daily run for ${today}`);

    // 1. Get all active staff members (Mitarbeiter/Teamleiter)
    const { data: staffProfiles, error: staffError } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        full_name
      `)
      .not('user_id', 'is', null);

    if (staffError) throw staffError;

    // Filter to only staff with mitarbeiter role
    const staffWithRoles = [];
    for (const profile of staffProfiles || []) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.user_id)
        .in('role', ['vertriebspartner', 'gruppenbetreuer', 'admin']);
      
      if (roles && roles.length > 0) {
        staffWithRoles.push(profile);
      }
    }

    console.log(`Found ${staffWithRoles.length} staff members`);

    // 2. Get leads that need follow-up (in active pipeline stages)
    const { data: pipelineItems, error: pipelineError } = await supabase
      .from('pipeline_items')
      .select(`
        id,
        lead_id,
        stage,
        pipeline_priority_score,
        purchase_readiness,
        urgency,
        lead:crm_leads(
          id,
          first_name,
          last_name,
          company,
          email,
          phone,
          owner_user_id
        )
      `)
      .in('stage', ['new_lead', 'setter_call_scheduled', 'analysis_ready', 'offer_draft', 'offer_sent'])
      .order('pipeline_priority_score', { ascending: false })
      .limit(100);

    if (pipelineError) throw pipelineError;

    console.log(`Found ${pipelineItems?.length || 0} active pipeline items`);

    // 3. Create call queues for each staff member
    const queuesCreated = [];
    
    for (const staff of staffWithRoles) {
      // Check if queue already exists for today
      const { data: existingQueue } = await supabase
        .from('call_queues')
        .select('id')
        .eq('assigned_to', staff.id)
        .eq('date', today)
        .single();

      if (existingQueue) {
        // Check if queue is empty - if so, populate it
        const { data: existingItems } = await supabase
          .from('call_queue_items')
          .select('id')
          .eq('queue_id', existingQueue.id)
          .limit(1);
        
        if (existingItems && existingItems.length > 0) {
          console.log(`Queue already exists with items for ${staff.full_name}`);
          continue;
        }
        
        console.log(`Queue exists but empty for ${staff.full_name}, populating...`);
        
        // Get leads owned by this staff member and populate
        const staffLeads = pipelineItems?.filter(
          (item) => (item.lead as { owner_user_id?: string })?.owner_user_id === staff.id
        ) || [];
        
        let rank = 1;
        for (const item of staffLeads.slice(0, 10)) {
          await supabase
            .from('call_queue_items')
            .insert({
              queue_id: existingQueue.id,
              lead_id: item.lead_id,
              priority_rank: rank,
              reason: getCallReason(item.stage),
              context_json: {
                pipeline_stage: item.stage,
                purchase_readiness: item.purchase_readiness,
                urgency: item.urgency,
              },
              status: 'pending',
            });
          rank++;
        }
        
        queuesCreated.push({
          staff: staff.full_name,
          queueId: existingQueue.id,
          itemCount: Math.min(staffLeads.length, 10),
        });
        continue;
      }

      // Create new queue
      const { data: queue, error: queueError } = await supabase
        .from('call_queues')
        .insert({
          assigned_to: staff.id,
          date: today,
          generated_by: 'prospecting_daily_run',
        })
        .select()
        .single();

      if (queueError) {
        console.error(`Error creating queue for ${staff.full_name}:`, queueError);
        continue;
      }

      // Get leads owned by this staff member
      const staffLeads = pipelineItems?.filter(
        (item) => (item.lead as { owner_user_id?: string })?.owner_user_id === staff.id
      ) || [];

      // Create queue items
      let rank = 1;
      for (const item of staffLeads.slice(0, 10)) { // Max 10 per day
        await supabase
          .from('call_queue_items')
          .insert({
            queue_id: queue.id,
            lead_id: item.lead_id,
            priority_rank: rank,
            reason: getCallReason(item.stage),
            context_json: {
              pipeline_stage: item.stage,
              purchase_readiness: item.purchase_readiness,
              urgency: item.urgency,
            },
            status: 'pending',
          });
        rank++;
      }

      queuesCreated.push({
        staff: staff.full_name,
        queueId: queue.id,
        itemCount: Math.min(staffLeads.length, 10),
      });
    }

    console.log(`Created ${queuesCreated.length} call queues`);

    // 4. Create follow-up tasks for high-priority items without recent activity
    const tasksCreated = [];
    
    for (const item of pipelineItems?.slice(0, 20) || []) {
      const lead = item.lead as { 
        id: string; 
        first_name: string; 
        last_name?: string;
        owner_user_id?: string;
      };
      
      if (!lead?.owner_user_id) continue;

      // Check for recent tasks
      const { data: recentTasks } = await supabase
        .from('crm_tasks')
        .select('id')
        .eq('lead_id', lead.id)
        .eq('status', 'open')
        .limit(1);

      if (recentTasks && recentTasks.length > 0) continue;

      // Create follow-up task
      const { data: task, error: taskError } = await supabase
        .from('crm_tasks')
        .insert({
          assigned_user_id: lead.owner_user_id,
          lead_id: lead.id,
          type: 'followup',
          title: `Follow-up: ${lead.first_name} ${lead.last_name || ''}`.slice(0, 100),
          description: `Automatisch generiert basierend auf Pipeline-Priorität (${item.pipeline_priority_score || 0}).`,
          status: 'open',
          due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        })
        .select()
        .single();

      if (!taskError && task) {
        tasksCreated.push(task.id);
      }
    }

    console.log(`Created ${tasksCreated.length} follow-up tasks`);

    return new Response(
      JSON.stringify({
        success: true,
        date: today,
        queuesCreated,
        tasksCreated: tasksCreated.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Prospecting daily run error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getCallReason(stage: string): string {
  switch (stage) {
    case 'new_lead':
      return 'Erstgespräch';
    case 'setter_call_scheduled':
      return 'Geplanter Call';
    case 'analysis_ready':
      return 'Analyse besprechen';
    case 'offer_draft':
      return 'Angebot finalisieren';
    case 'offer_sent':
      return 'Angebot nachfassen';
    default:
      return 'Follow-up';
  }
}
