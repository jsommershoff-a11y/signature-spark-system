import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { platform, content_type, goal, topic, tonality, cta } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Du bist ein Social-Media-Content-Stratege für KI-Automationen, eine Premium-Unternehmensberatung für Handwerk, Praxen und Dienstleister. 
Du erstellst conversionstarken Content auf Deutsch. Tonalität: ${tonality}. Zielgruppe: Unternehmer und Geschäftsführer.`;

    const userPrompt = `Erstelle Content für ${platform} (${content_type}).
Ziel: ${goal}
Thema: ${topic}
${cta ? `Call-to-Action: ${cta}` : ''}

Nutze die generate_content Funktion um strukturierten Output zu liefern.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_content",
            description: "Generate structured social media content",
            parameters: {
              type: "object",
              properties: {
                hooks: { type: "array", items: { type: "string" }, description: "5 hook variants" },
                caption: { type: "string", description: "Full caption text with emojis and formatting" },
                hashtags: { type: "array", items: { type: "string" }, description: "10-15 relevant hashtags without #" },
                story_script: { type: "string", description: "Story script if content_type is story, null otherwise" },
                posting_time: { type: "string", description: "Recommended posting time e.g. 'Dienstag 18:00'" },
              },
              required: ["hooks", "caption", "hashtags", "posting_time"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_content" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit erreicht, bitte später erneut versuchen." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Guthaben aufgebraucht. Bitte Credits aufladen." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-social-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
