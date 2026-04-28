// generate-offer-draft
// Erstellt KI-generierten Angebotsentwurf aus Zoom-Summary + Lead + Katalog.
// Nutzt bestehenden Katalog als Basis, KI ergänzt Custom-Anteile + Preisaufschlag.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
const TELEGRAM_NOTIFY_CHAT_ID = Deno.env.get("TELEGRAM_NOTIFY_CHAT_ID");
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = "https://www.ki-automationen.io";

async function sendTelegram(text: string) {
  if (!TELEGRAM_API_KEY || !TELEGRAM_NOTIFY_CHAT_ID) return;
  try {
    await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_NOTIFY_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error("Telegram failed:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const cronHeader = req.headers.get("x-cron-secret");
  const isInternal = CRON_SECRET && cronHeader === CRON_SECRET;

  let userId: string | null = null;
  if (!isInternal) {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: u } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!u?.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
    userId = u.user.id;
  }

  try {
    const body = await req.json();
    const { lead_id, zoom_summary_id } = body;
    if (!lead_id) throw new Error("lead_id required");

    // Load lead
    const { data: lead } = await supabase
      .from("crm_leads")
      .select("*")
      .eq("id", lead_id)
      .single();
    if (!lead) throw new Error("Lead not found");

    // Load zoom summary if linked
    let summary: any = null;
    if (zoom_summary_id) {
      const { data } = await supabase
        .from("zoom_summaries")
        .select("*")
        .eq("id", zoom_summary_id)
        .maybeSingle();
      summary = data;
    }

    // Load active catalog products
    const { data: catalog } = await supabase
      .from("catalog_products")
      .select("id, name, description, price_cents, category")
      .eq("status", "active")
      .limit(50);

    // Build AI prompt
    const sys = `Du bist Senior Sales Engineer für ein deutsches KI-Automatisierungsunternehmen.
Du erstellst strukturierte Angebotsentwürfe (NICHT versendet, intern für Berater-Review).

REGELN:
1. Nutze IMMER zuerst passende Produkte aus dem Katalog. Match per Name/Kategorie/Beschreibung.
2. Wenn keines passt: erstelle "Individueller Entwurf" und markiere is_custom_solution=true.
3. Kalkuliere INTERNE Kosten realistisch (Setup, Tools, API, Wartung, Risiko).
4. Verkaufspreis = interne Kosten × (2.5–4× Marge je nach Komplexität).
5. Mindestpreis = interne Kosten × 1.8.
6. Alle Preise als VORSCHLAG. Berater entscheidet final.
7. Konnektoren-Liste: nur die wirklich nötigen (Email/Calendar/CRM/Drive/OneDrive/Zoom/sevDesk/Supabase/n8n/APIs/Webhooks).
8. Antworte AUSSCHLIESSLICH via Tool-Call.`;

    const userMsg = `LEAD:
Name: ${lead.first_name} ${lead.last_name || ""}
Firma: ${lead.company || "—"}
Branche: ${lead.industry || "—"}
Email: ${lead.email}
Notizen: ${lead.notes || "—"}

${summary ? `ZOOM-CALL EXTRAKTION:
Thema: ${summary.meeting_topic || "—"}
Zusammenfassung: ${summary.ai_extraction?.summary || ""}
Pain Points: ${(summary.ai_extraction?.pain_points || []).join(" | ")}
Gewünschte Leistungen: ${(summary.ai_extraction?.desired_services || []).join(" | ")}
Einwände: ${(summary.ai_extraction?.objections || []).join(" | ")}
Nächste Schritte: ${(summary.ai_extraction?.next_steps || []).join(" | ")}
Abschlusswahrscheinlichkeit: ${summary.ai_extraction?.close_probability || "?"}%
Dringlichkeit: ${summary.ai_extraction?.urgency || "?"}
Budget-Signal: ${summary.ai_extraction?.budget_signal || "—"}
Entscheider anwesend: ${summary.ai_extraction?.decision_maker_present ? "ja" : "nein"}` : "Keine Call-Daten — erstelle Entwurf basierend auf Lead-Info."}

VERFÜGBARER KATALOG (Auswahl):
${(catalog || []).map((p: any) => `- ${p.name} (${p.category || "—"}): ${(p.description || "").slice(0, 120)} | Preis: ${p.price_cents ? (p.price_cents / 100).toFixed(0) + "€" : "individuell"}`).join("\n")}`;

    const r = await fetch(AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userMsg },
        ],
        tools: [{
          type: "function",
          function: {
            name: "build_offer_draft",
            description: "Strukturierter Angebotsentwurf",
            parameters: {
              type: "object",
              properties: {
                problem_analysis: {
                  type: "object",
                  properties: {
                    current_situation: { type: "string" },
                    pain_points: { type: "array", items: { type: "string" } },
                    bottlenecks: { type: "array", items: { type: "string" } },
                    economic_impact: { type: "string" },
                    priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  },
                  required: ["current_situation", "pain_points", "priority"],
                },
                solution_concept: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    target_process: { type: "string" },
                    automations: { type: "array", items: { type: "string" } },
                    key_features: { type: "array", items: { type: "string" } },
                  },
                  required: ["title", "description", "target_process"],
                },
                matched_catalog_product_ids: { type: "array", items: { type: "string" } },
                is_custom_solution: { type: "boolean" },
                required_connectors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      reason: { type: "string" },
                    },
                    required: ["name", "reason"],
                  },
                },
                internal_cost_analysis: {
                  type: "object",
                  properties: {
                    setup_hours: { type: "number" },
                    setup_cost_eur: { type: "number" },
                    tools_api_monthly_eur: { type: "number" },
                    maintenance_monthly_eur: { type: "number" },
                    risk_buffer_eur: { type: "number" },
                    total_internal_cost_eur: { type: "number" },
                    cost_range_min_eur: { type: "number" },
                    cost_range_max_eur: { type: "number" },
                    rationale: { type: "string" },
                  },
                  required: ["total_internal_cost_eur", "rationale"],
                },
                pricing_strategy: {
                  type: "object",
                  properties: {
                    suggested_price_eur: { type: "number" },
                    min_price_eur: { type: "number" },
                    margin_percent: { type: "number" },
                    retainer_monthly_eur: { type: "number", description: "Optional, 0 wenn keiner" },
                    payment_terms: { type: "string" },
                    rationale: { type: "string" },
                  },
                  required: ["suggested_price_eur", "min_price_eur", "margin_percent", "rationale"],
                },
                benefit_analysis: {
                  type: "object",
                  properties: {
                    time_saving_hours_per_month: { type: "number" },
                    cost_saving_eur_per_year: { type: "number" },
                    efficiency_gain_percent: { type: "number" },
                    error_reduction_percent: { type: "number" },
                    scalability_note: { type: "string" },
                    monetary_value_summary: { type: "string" },
                  },
                  required: ["monetary_value_summary"],
                },
                client_inputs_required: {
                  type: "object",
                  properties: {
                    mandatory: { type: "array", items: { type: "string" } },
                    optional: { type: "array", items: { type: "string" } },
                    later: { type: "array", items: { type: "string" } },
                  },
                  required: ["mandatory"],
                },
                qa_checks: {
                  type: "object",
                  properties: {
                    contact_complete: { type: "boolean" },
                    product_clear: { type: "boolean" },
                    info_complete: { type: "boolean" },
                    price_plausible: { type: "boolean" },
                    connectors_correct: { type: "boolean" },
                    open_questions: { type: "array", items: { type: "string" } },
                  },
                  required: ["contact_complete", "product_clear", "info_complete", "price_plausible", "connectors_correct"],
                },
              },
              required: [
                "problem_analysis", "solution_concept", "is_custom_solution",
                "required_connectors", "internal_cost_analysis", "pricing_strategy",
                "benefit_analysis", "client_inputs_required", "qa_checks",
              ],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "build_offer_draft" } },
      }),
    });

    if (!r.ok) {
      if (r.status === 429) throw new Error("AI rate-limited (429)");
      if (r.status === 402) throw new Error("AI credits exhausted (402)");
      throw new Error(`AI ${r.status}: ${await r.text()}`);
    }

    const data = await r.json();
    const argsStr = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!argsStr) throw new Error("AI returned no tool call");
    const draft = JSON.parse(argsStr);

    const qaPassed = Object.entries(draft.qa_checks)
      .filter(([k]) => k !== "open_questions")
      .every(([, v]) => v === true);

    const status = qaPassed ? "review_required" : "correction";

    const { data: inserted } = await supabase
      .from("offer_drafts")
      .insert({
        lead_id,
        zoom_summary_id: zoom_summary_id || null,
        status,
        problem_analysis: draft.problem_analysis,
        solution_concept: draft.solution_concept,
        matched_catalog_product_ids: draft.matched_catalog_product_ids || [],
        is_custom_solution: draft.is_custom_solution,
        required_connectors: draft.required_connectors,
        internal_cost_analysis: draft.internal_cost_analysis,
        pricing_strategy: draft.pricing_strategy,
        suggested_price_cents: Math.round((draft.pricing_strategy.suggested_price_eur || 0) * 100),
        min_price_cents: Math.round((draft.pricing_strategy.min_price_eur || 0) * 100),
        margin_percent: draft.pricing_strategy.margin_percent,
        benefit_analysis: draft.benefit_analysis,
        client_inputs_required: draft.client_inputs_required,
        qa_checks: draft.qa_checks,
        qa_passed: qaPassed,
        ai_model: "openai/gpt-5",
        ai_tokens_used: data.usage?.total_tokens,
      })
      .select("id")
      .single();

    if (zoom_summary_id) {
      await supabase
        .from("zoom_summaries")
        .update({ offer_draft_id: inserted!.id })
        .eq("id", zoom_summary_id);
    }

    // Telegram-Push an Berater
    const leadName = `${lead.first_name} ${lead.last_name || ""}`.trim();
    const price = (draft.pricing_strategy.suggested_price_eur || 0).toLocaleString("de-DE");
    await sendTelegram(
      `📝 <b>Neuer Angebotsentwurf</b>\n` +
      `Lead: <b>${leadName}</b>${lead.company ? " · " + lead.company : ""}\n` +
      `Lösung: ${draft.solution_concept.title}\n` +
      `Vorschlag: <b>${price} €</b> (Marge ${draft.pricing_strategy.margin_percent}%)\n` +
      `QA: ${qaPassed ? "✅ bestanden" : "⚠️ Korrektur nötig"}\n` +
      `<a href="${APP_URL}/app/leads">→ Im CRM öffnen</a>`,
    );

    return new Response(JSON.stringify({ ok: true, draft_id: inserted!.id, qa_passed: qaPassed, status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-offer-draft error:", e);
    await sendTelegram(`🚨 <b>Angebots-Generator FEHLER</b>\n${e.message}`);
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
