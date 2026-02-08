import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ANALYSIS_TOOL = {
  type: "function",
  function: {
    name: "submit_analysis",
    description: "Submit structured sales call analysis results",
    parameters: {
      type: "object",
      properties: {
        summary: {
          type: "object",
          properties: {
            key_points: { type: "array", items: { type: "string" } },
            call_quality: { type: "string", enum: ["excellent", "good", "average", "poor"] },
            next_steps_recommended: { type: "array", items: { type: "string" } },
          },
          required: ["key_points", "call_quality", "next_steps_recommended"],
        },
        problems: {
          type: "object",
          properties: {
            identified: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string", enum: ["high", "medium", "low"] },
                  quote: { type: "string" },
                },
                required: ["category", "description", "severity"],
              },
            },
            pain_intensity: { type: "number", minimum: 0, maximum: 100 },
          },
          required: ["identified", "pain_intensity"],
        },
        objections: {
          type: "object",
          properties: {
            raised: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["price", "timing", "trust", "need", "authority", "other"] },
                  description: { type: "string" },
                  handled: { type: "boolean" },
                  response_quality: { type: "string", enum: ["excellent", "good", "average", "poor"] },
                },
                required: ["type", "description", "handled"],
              },
            },
            objection_handling_score: { type: "number", minimum: 0, maximum: 100 },
          },
          required: ["raised", "objection_handling_score"],
        },
        buying_signals: {
          type: "object",
          properties: {
            positive: { type: "array", items: { type: "string" } },
            negative: { type: "array", items: { type: "string" } },
            strength: { type: "number", minimum: 0, maximum: 100 },
          },
          required: ["positive", "negative", "strength"],
        },
        structogram: {
          type: "object",
          properties: {
            primary_color: { type: "string", enum: ["red", "green", "blue"] },
            secondary_color: { type: "string", enum: ["red", "green", "blue"] },
            confidence: { type: "number", minimum: 0, maximum: 100 },
            indicators: {
              type: "object",
              properties: {
                red_traits: { type: "array", items: { type: "string" } },
                green_traits: { type: "array", items: { type: "string" } },
                blue_traits: { type: "array", items: { type: "string" } },
              },
              required: ["red_traits", "green_traits", "blue_traits"],
            },
            communication_tips: { type: "array", items: { type: "string" } },
          },
          required: ["primary_color", "confidence", "indicators", "communication_tips"],
        },
        conversation_quality: {
          type: "object",
          properties: {
            talk_ratio: {
              type: "object",
              properties: {
                seller_percentage: { type: "number" },
                buyer_percentage: { type: "number" },
              },
              required: ["seller_percentage", "buyer_percentage"],
            },
            engagement_score: { type: "number", minimum: 0, maximum: 100 },
            rapport_score: { type: "number", minimum: 0, maximum: 100 },
          },
          required: ["talk_ratio", "engagement_score", "rapport_score"],
        },
        recommendations: {
          type: "object",
          properties: {
            immediate_actions: { type: "array", items: { type: "string" } },
            follow_up_timing: { type: "string" },
            offer_adjustments: { type: "array", items: { type: "string" } },
          },
          required: ["immediate_actions", "follow_up_timing", "offer_adjustments"],
        },
        scores: {
          type: "object",
          properties: {
            purchase_readiness: { type: "number", minimum: 0, maximum: 100 },
            success_probability: { type: "number", minimum: 0, maximum: 100 },
          },
          required: ["purchase_readiness", "success_probability"],
        },
      },
      required: ["summary", "problems", "objections", "buying_signals", "structogram", "conversation_quality", "recommendations", "scores"],
    },
  },
};

const SYSTEM_PROMPT = `Du bist ein erfahrener Vertriebsanalyse-Experte. Analysiere das folgende Verkaufsgespräch und liefere strukturierte Insights.

ANALYSE-KATEGORIEN:

1. ZUSAMMENFASSUNG
- Extrahiere die wichtigsten Gesprächspunkte
- Bewerte die Gesprächsqualität (excellent/good/average/poor)
- Empfehle konkrete nächste Schritte

2. PROBLEME & SCHMERZEN
- Identifiziere die Probleme und Schmerzpunkte des Kunden
- Bewerte die Schwere (high/medium/low)
- Zitiere relevante Aussagen
- Bewerte die Schmerzintensität (0-100)

3. EINWÄNDE
- Liste alle erhobenen Einwände
- Kategorisiere nach Typ (price/timing/trust/need/authority/other)
- Bewerte ob und wie gut sie behandelt wurden
- Berechne einen Objection Handling Score (0-100)

4. KAUFSIGNALE
- Identifiziere positive Signale (Interesse, Dringlichkeit, Budget)
- Identifiziere negative Signale (Zögern, Ausweichen, Ablehnung)
- Bewerte die Kaufsignal-Stärke (0-100)

5. STRUCTOGRAM (Persönlichkeitsanalyse)
Analysiere den Kommunikationsstil und ordne ihn den Farben zu:
- ROT: Dominant, direkt, ergebnisorientiert, "Ich will", schnelle Entscheidungen
- GRÜN: Beziehungsorientiert, "Wir", emotional, teamfokussiert, harmoniebedürftig
- BLAU: Analytisch, detailorientiert, fragt nach Zahlen, vorsichtig, braucht Zeit
Gib die primäre und sekundäre Farbe an mit Konfidenz.

6. GESPRÄCHSQUALITÄT
- Berechne das Talk Ratio (Verkäufer vs Käufer)
- Bewerte Engagement und Rapport

7. EMPFEHLUNGEN
- Gib konkrete sofort umsetzbare Aktionen
- Empfehle optimales Follow-up Timing
- Schlage Angebotsanpassungen vor

8. SCORING
- Purchase Readiness (0-100): Wie kaufbereit ist der Kunde?
- Success Probability (0-100): Wie wahrscheinlich ist ein Abschluss?

WICHTIG: Liefere NUR strukturierte Daten über die Tool-Funktion. Keine Fließtexte.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { call_id } = await req.json();

    if (!call_id) {
      return new Response(
        JSON.stringify({ error: "call_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch call and transcript
    const { data: call, error: callError } = await supabase
      .from("calls")
      .select("*, lead:crm_leads(id, first_name, last_name, company)")
      .eq("id", call_id)
      .single();

    if (callError || !call) {
      console.error("Call not found:", callError);
      return new Response(
        JSON.stringify({ error: "Call not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: transcript } = await supabase
      .from("transcripts")
      .select("*")
      .eq("call_id", call_id)
      .eq("status", "done")
      .single();

    if (!transcript?.text) {
      console.error("No transcript available for call:", call_id);
      return new Response(
        JSON.stringify({ error: "No transcript available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling Lovable AI Gateway for analysis...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analysiere dieses Verkaufsgespräch:

Kunde: ${call.lead?.first_name || "Unbekannt"} ${call.lead?.last_name || ""} ${call.lead?.company ? `(${call.lead.company})` : ""}

TRANSKRIPT:
${transcript.text}

Führe eine vollständige Analyse durch und liefere die Ergebnisse über die submit_analysis Funktion.`,
          },
        ],
        tools: [ANALYSIS_TOOL],
        tool_choice: { type: "function", function: { name: "submit_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    // Extract the tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call response from AI");
    }

    const analysisResult = JSON.parse(toolCall.function.arguments);
    console.log("Analysis result parsed successfully");

    // Store the analysis
    const { data: analysis, error: insertError } = await supabase
      .from("ai_analyses")
      .insert({
        call_id: call_id,
        lead_id: call.lead?.id,
        analysis_json: analysisResult,
        purchase_readiness: analysisResult.scores.purchase_readiness,
        success_probability: analysisResult.scores.success_probability,
        primary_type: analysisResult.structogram.primary_color,
        secondary_type: analysisResult.structogram.secondary_color || null,
        model_version: "v1",
        status: "completed",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing analysis:", insertError);
      throw insertError;
    }

    // Update call status
    await supabase
      .from("calls")
      .update({ status: "analyzed" })
      .eq("id", call_id);

    console.log("Analysis stored successfully:", analysis.id);

    return new Response(
      JSON.stringify({ success: true, analysis_id: analysis.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-call error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
