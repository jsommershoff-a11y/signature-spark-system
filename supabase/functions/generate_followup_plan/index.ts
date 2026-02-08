import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate AI-powered followup plan based on lead context
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { lead_id, trigger_event } = await req.json();

    if (!lead_id) {
      return new Response(
        JSON.stringify({ error: 'lead_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating followup plan for lead ${lead_id}, trigger: ${trigger_event}`);

    // 1. Load lead with all context
    const { data: lead, error: leadError } = await supabase
      .from('crm_leads')
      .select(`
        *,
        owner:profiles!crm_leads_owner_user_id_fkey(
          id,
          full_name,
          email
        ),
        pipeline_items(*)
      `)
      .eq('id', lead_id)
      .single();

    if (leadError) throw leadError;

    // 2. Load call history
    const { data: calls } = await supabase
      .from('calls')
      .select(`
        id,
        scheduled_at,
        started_at,
        ended_at,
        status,
        notes,
        ai_analyses(
          primary_type,
          secondary_type,
          purchase_readiness,
          success_probability
        )
      `)
      .eq('lead_id', lead_id)
      .order('created_at', { ascending: false })
      .limit(5);

    // 3. Load existing offers
    const { data: offers } = await supabase
      .from('offers')
      .select('id, status, created_at, offer_json')
      .eq('lead_id', lead_id)
      .order('created_at', { ascending: false })
      .limit(3);

    // 4. Build context for AI
    const context = {
      lead: {
        name: `${lead.first_name} ${lead.last_name || ''}`,
        company: lead.company,
        industry: lead.industry,
        source: lead.source_type,
        icp_score: lead.icp_fit_score,
      },
      pipeline: lead.pipeline_items?.[0],
      recentCalls: calls?.map(c => ({
        date: c.started_at || c.scheduled_at,
        status: c.status,
        notes: c.notes,
        analysis: c.ai_analyses?.[0],
      })),
      offers: offers?.map(o => ({
        status: o.status,
        date: o.created_at,
      })),
      triggerEvent: trigger_event,
    };

    // 5. Generate plan using AI (or fallback to template)
    let planContent;
    
    if (lovableApiKey) {
      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash',
            messages: [
              {
                role: 'system',
                content: `Du bist ein Sales-Stratege. Erstelle einen Followup-Plan basierend auf dem Lead-Kontext. 
Antworte NUR mit validem JSON in diesem Format:
{
  "summary": "Kurze Zusammenfassung des Plans",
  "reasoning": "Begründung für den Ansatz",
  "steps": [
    {"type": "email|whatsapp|call|task", "delay_hours": 0, "content": "Beschreibung"},
    ...
  ],
  "expected_outcome": "Erwartetes Ergebnis",
  "priority": "low|medium|high"
}`
              },
              {
                role: 'user',
                content: `Lead-Kontext:\n${JSON.stringify(context, null, 2)}\n\nErstelle einen passenden Followup-Plan.`
              }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            // Extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              planContent = JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (aiError) {
        console.error('AI generation failed, using template:', aiError);
      }
    }

    // Fallback to template-based plan
    if (!planContent) {
      planContent = generateTemplatePlan(context);
    }

    // 6. Save followup plan
    const { data: plan, error: planError } = await supabase
      .from('followup_plans')
      .insert({
        lead_id,
        triggered_by: trigger_event || 'manual',
        status: 'pending',
        plan_json: planContent,
      })
      .select()
      .single();

    if (planError) throw planError;

    // 7. Create followup steps
    const steps = planContent.steps || [];
    let stepOrder = 1;
    let cumulativeDelay = 0;

    for (const step of steps) {
      cumulativeDelay += step.delay_hours || 0;
      const scheduledAt = new Date(Date.now() + cumulativeDelay * 60 * 60 * 1000);

      await supabase
        .from('followup_steps')
        .insert({
          plan_id: plan.id,
          step_order: stepOrder,
          step_type: step.type || 'task',
          scheduled_at: scheduledAt.toISOString(),
          content_json: step,
          status: 'pending',
        });

      stepOrder++;
    }

    console.log(`Created followup plan ${plan.id} with ${steps.length} steps`);

    return new Response(
      JSON.stringify({
        success: true,
        plan_id: plan.id,
        steps_count: steps.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate followup plan error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateTemplatePlan(context: Record<string, unknown>): Record<string, unknown> {
  const pipeline = context.pipeline as { stage?: string; purchase_readiness?: number } | undefined;
  const stage = pipeline?.stage;
  const purchaseReadiness = pipeline?.purchase_readiness || 50;

  // High readiness = more aggressive follow-up
  const isHighPriority = purchaseReadiness >= 70;

  const basePlan = {
    summary: `Followup-Plan für ${(context.lead as { name?: string })?.name || 'Lead'}`,
    reasoning: 'Automatisch generierter Plan basierend auf Pipeline-Status und Kaufbereitschaft.',
    expected_outcome: 'Nächsten Schritt im Sales-Prozess erreichen',
    priority: isHighPriority ? 'high' : 'medium',
    steps: [] as Array<{ type: string; delay_hours: number; content: string }>,
  };

  switch (stage) {
    case 'new_lead':
      basePlan.steps = [
        { type: 'call', delay_hours: 0, content: 'Erstgespräch führen' },
        { type: 'email', delay_hours: 24, content: 'Follow-up E-Mail mit Zusammenfassung' },
      ];
      break;
    case 'setter_call_done':
    case 'analysis_ready':
      basePlan.steps = [
        { type: 'email', delay_hours: 0, content: 'Analyse-Ergebnisse teilen' },
        { type: 'call', delay_hours: 24, content: 'Analyse besprechen' },
        { type: 'task', delay_hours: 48, content: 'Angebot vorbereiten' },
      ];
      break;
    case 'offer_sent':
      basePlan.steps = [
        { type: 'call', delay_hours: isHighPriority ? 24 : 48, content: 'Angebot nachfassen' },
        { type: 'whatsapp', delay_hours: isHighPriority ? 48 : 72, content: 'Kurze Erinnerung' },
        { type: 'email', delay_hours: isHighPriority ? 96 : 120, content: 'Letzte Chance E-Mail' },
      ];
      break;
    default:
      basePlan.steps = [
        { type: 'call', delay_hours: 24, content: 'Status-Call' },
        { type: 'email', delay_hours: 72, content: 'Follow-up E-Mail' },
      ];
  }

  return basePlan;
}
