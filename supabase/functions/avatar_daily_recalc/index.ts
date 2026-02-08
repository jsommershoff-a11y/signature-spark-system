import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Daily recalculation of customer avatar (PCA) based on closed customers
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];
    console.log(`Starting avatar daily recalc for ${today}`);

    // 1. Load all closed customer snapshots
    const { data: snapshots, error: snapshotError } = await supabase
      .from('closed_customer_snapshots')
      .select('*')
      .order('created_at', { ascending: false });

    if (snapshotError) throw snapshotError;

    if (!snapshots || snapshots.length === 0) {
      console.log('No customer snapshots found, skipping avatar generation');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No snapshots to analyze',
          sample_size: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${snapshots.length} customer snapshots`);

    // 2. Get current version
    const { data: currentModel } = await supabase
      .from('customer_avatar_models')
      .select('version')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const newVersion = (currentModel?.version || 0) + 1;

    // 3. Aggregate data for analysis
    const aggregatedData = {
      industries: {} as Record<string, number>,
      sources: {} as Record<string, number>,
      companySizes: [] as string[],
      avgIcpScore: 0,
      avgPurchaseReadiness: 0,
      painPoints: [] as string[],
      objections: [] as string[],
    };

    let totalIcp = 0;
    let totalReadiness = 0;

    for (const snapshot of snapshots) {
      const data = snapshot.snapshot_json as {
        lead?: {
          industry?: string;
          source_type?: string;
          company?: string;
          icp_fit_score?: number;
          icp_fit_reason?: { pain_points?: string[]; objections?: string[] };
        };
        analysis?: {
          purchase_readiness?: number;
        };
      };
      
      // Industry
      if (data.lead?.industry) {
        aggregatedData.industries[data.lead.industry] = 
          (aggregatedData.industries[data.lead.industry] || 0) + 1;
      }

      // Source
      if (data.lead?.source_type) {
        aggregatedData.sources[data.lead.source_type] = 
          (aggregatedData.sources[data.lead.source_type] || 0) + 1;
      }

      // ICP Score
      if (data.lead?.icp_fit_score) {
        totalIcp += data.lead.icp_fit_score;
      }

      // Purchase Readiness
      if (data.analysis?.purchase_readiness) {
        totalReadiness += data.analysis.purchase_readiness;
      }

      // Pain Points from ICP fit reason
      if (data.lead?.icp_fit_reason?.pain_points) {
        aggregatedData.painPoints.push(...data.lead.icp_fit_reason.pain_points);
      }

      // Objections
      if (data.lead?.icp_fit_reason?.objections) {
        aggregatedData.objections.push(...data.lead.icp_fit_reason.objections);
      }
    }

    aggregatedData.avgIcpScore = Math.round(totalIcp / snapshots.length);
    aggregatedData.avgPurchaseReadiness = Math.round(totalReadiness / snapshots.length);

    // 4. Generate avatar using AI or template
    let avatarJson;

    if (lovableApiKey && snapshots.length >= 5) {
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
                content: `Du analysierst Kundendaten und erstellst einen idealen Kunden-Avatar (ICP).
Antworte NUR mit validem JSON in diesem Format:
{
  "summary": "2-3 Sätze Zusammenfassung des idealen Kunden",
  "demographics": {
    "typical_company_size": "z.B. 10-50 Mitarbeiter",
    "industries": ["Top-Branchen"],
    "locations": ["Regionen"]
  },
  "psychographics": {
    "pain_points": ["Top 3-5 Pain Points"],
    "goals": ["Top 3 Ziele"],
    "objections": ["Häufige Einwände"],
    "decision_factors": ["Kaufentscheidungsfaktoren"]
  },
  "behavior": {
    "typical_sales_cycle_days": 14,
    "preferred_channels": ["Kanäle"],
    "peak_activity_times": ["Zeiten"]
  }
}`
              },
              {
                role: 'user',
                content: `Analysiere diese ${snapshots.length} Kunden-Daten und erstelle einen ICP:\n${JSON.stringify(aggregatedData, null, 2)}`
              }
            ],
            temperature: 0.5,
            max_tokens: 1000,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              avatarJson = JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (aiError) {
        console.error('AI avatar generation failed:', aiError);
      }
    }

    // Fallback to template-based avatar
    if (!avatarJson) {
      const topIndustries = Object.entries(aggregatedData.industries)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([ind]) => ind);

      const topSources = Object.entries(aggregatedData.sources)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([src]) => src);

      // Get unique pain points
      const uniquePainPoints = [...new Set(aggregatedData.painPoints)].slice(0, 5);

      avatarJson = {
        summary: `Basierend auf ${snapshots.length} Kunden-Analysen. Durchschnittlicher ICP-Score: ${aggregatedData.avgIcpScore}, Kaufbereitschaft: ${aggregatedData.avgPurchaseReadiness}%.`,
        demographics: {
          typical_company_size: 'Mittelstand (10-250 MA)',
          industries: topIndustries.length > 0 ? topIndustries : ['Diverse'],
          locations: ['DACH-Region'],
        },
        psychographics: {
          pain_points: uniquePainPoints.length > 0 ? uniquePainPoints : ['Effizienzprobleme', 'Wachstumsbarrieren'],
          goals: ['Umsatzsteigerung', 'Prozessoptimierung', 'Wettbewerbsvorteil'],
          objections: ['Budget', 'Timing', 'Entscheidungsprozess'],
          decision_factors: ['ROI', 'Referenzen', 'Persönliche Beratung'],
        },
        behavior: {
          typical_sales_cycle_days: 21,
          preferred_channels: topSources.length > 0 ? topSources : ['Direktkontakt'],
          peak_activity_times: ['Dienstag-Donnerstag', '10-12 Uhr'],
        },
      };
    }

    // 5. Save new avatar model
    const { data: newModel, error: modelError } = await supabase
      .from('customer_avatar_models')
      .insert({
        version: newVersion,
        model_date: today,
        avatar_json: avatarJson,
        sample_size: snapshots.length,
        confidence_score: Math.min(100, snapshots.length * 5), // More samples = higher confidence
      })
      .select()
      .single();

    if (modelError) throw modelError;

    console.log(`Created avatar model v${newVersion} based on ${snapshots.length} customers`);

    return new Response(
      JSON.stringify({
        success: true,
        model_id: newModel.id,
        version: newVersion,
        sample_size: snapshots.length,
        confidence_score: newModel.confidence_score,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Avatar daily recalc error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
