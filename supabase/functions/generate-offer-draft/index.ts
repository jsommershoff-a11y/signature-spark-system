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

async function sendTelegram(text: string, replyMarkup?: Record<string, unknown>): Promise<{ message_id?: number; chat_id?: number } | null> {
  if (!TELEGRAM_API_KEY || !TELEGRAM_NOTIFY_CHAT_ID) return null;
  try {
    const r = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
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
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("Telegram failed:", data);
      return null;
    }
    return { message_id: data?.result?.message_id, chat_id: data?.result?.chat?.id };
  } catch (e) {
    console.error("Telegram failed:", e);
    return null;
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

    // Load active catalog products (full pricing context)
    const { data: catalog } = await supabase
      .from("catalog_products")
      .select("id, code, name, subtitle, description, category, mode, price_net_cents, price_period_label, term_label, required_connectors, optional_connectors")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .limit(80);

    // Build AI prompt
    const sys = `Du bist Senior Sales Engineer für ein deutsches KI-Automatisierungsunternehmen.
Du erstellst strukturierte Angebotsentwürfe (NICHT versendet, intern für Berater-Review).

REGELN PREISFINDUNG (transparent & nachvollziehbar):
1. Mappe IMMER zuerst eine ODER mehrere Katalog-Positionen, die zur Lösung passen (per id).
2. Für jede gewählte Katalog-Position gib an:
   - base_price_eur (Netto-Preis aus Katalog)
   - adjustment_percent (Aufschlag in % gegenüber Katalog, z.B. +25 für komplexere Variante, -10 für Volumenrabatt)
   - adjustment_reason (z.B. "Mehraufwand durch 3 Standorte", "Sonderkonnektor sevDesk", "Erweiterte Auswertungslogik")
   - quantity (Standard 1)
3. Wenn Lösungsbestandteile NICHT im Katalog: füge "custom_addon"-Positionen hinzu mit cost_eur + rationale.
4. Aufschläge sollen REALISTISCH und ARGUMENTIERBAR sein (Komplexität, Datenvolumen, Sonder-APIs, Risiko, Compliance).
5. Marge = (final_price - internal_cost) / final_price · 100. Ziel 60-75%, min 45%.
6. Konnektoren: nur die wirklich nötigen (Email/Calendar/CRM/Drive/OneDrive/Zoom/sevDesk/Supabase/n8n/APIs/Webhooks).
7. Antworte AUSSCHLIESSLICH via Tool-Call.`;

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

VERFÜGBARER KATALOG (id | code | name | mode | netto-preis):
${(catalog || []).map((p: any) => {
  const price = p.price_net_cents ? `${(p.price_net_cents / 100).toFixed(0)}€${p.price_period_label ? "/" + p.price_period_label : ""}` : "individuell";
  return `[${p.id}] ${p.code || "—"} · ${p.name} (${p.mode || "—"}, ${p.category || "—"}) — ${price}${p.subtitle ? " · " + p.subtitle : ""}`;
}).join("\n")}`;

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
                price_breakdown: {
                  type: "array",
                  description: "Transparente Preisherleitung: jede Position zeigt Katalog-Basis + Aufschlag mit Begründung ODER Custom-Add-on.",
                  items: {
                    type: "object",
                    properties: {
                      kind: { type: "string", enum: ["catalog_item", "custom_addon"] },
                      catalog_product_id: { type: "string", description: "Nur bei kind=catalog_item, exakte id aus Katalog-Liste" },
                      catalog_code: { type: "string" },
                      label: { type: "string", description: "Anzeige-Name der Position" },
                      quantity: { type: "number" },
                      base_price_eur: { type: "number", description: "Bei catalog_item: Netto-Katalogpreis. Bei custom_addon: 0" },
                      adjustment_percent: { type: "number", description: "+25 = +25% Aufschlag, -10 = 10% Rabatt. 0 wenn keiner" },
                      adjustment_eur: { type: "number", description: "Absoluter Aufschlag/Rabatt zusätzlich (kann 0 sein)" },
                      adjustment_reason: { type: "string", description: "Klare Begründung für jeden Aufschlag/Rabatt" },
                      cost_eur: { type: "number", description: "Bei custom_addon: voller Preis dieser Position" },
                      line_total_eur: { type: "number", description: "Endpreis dieser Position nach Anpassung × Menge" },
                    },
                    required: ["kind", "label", "quantity", "line_total_eur"],
                  },
                },
                pricing_strategy: {
                  type: "object",
                  properties: {
                    catalog_subtotal_eur: { type: "number", description: "Summe Katalog-Basispreise vor Aufschlägen" },
                    adjustments_subtotal_eur: { type: "number", description: "Summe aller Aufschläge auf Katalog-Positionen" },
                    custom_subtotal_eur: { type: "number", description: "Summe der Custom-Add-ons" },
                    suggested_price_eur: { type: "number", description: "Endpreis = catalog_subtotal + adjustments + custom" },
                    min_price_eur: { type: "number" },
                    margin_percent: { type: "number" },
                    retainer_monthly_eur: { type: "number", description: "Optional, 0 wenn keiner" },
                    payment_terms: { type: "string" },
                    rationale: { type: "string", description: "Gesamtbegründung der Preisstrategie" },
                  },
                  required: ["catalog_subtotal_eur", "adjustments_subtotal_eur", "custom_subtotal_eur", "suggested_price_eur", "min_price_eur", "margin_percent", "rationale"],
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
                "required_connectors", "internal_cost_analysis", "price_breakdown", "pricing_strategy",
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

    const ps = draft.pricing_strategy || {};
    const breakdown = Array.isArray(draft.price_breakdown) ? draft.price_breakdown : [];

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
        pricing_strategy: ps,
        price_breakdown: breakdown,
        catalog_subtotal_cents: Math.round((ps.catalog_subtotal_eur || 0) * 100),
        adjustments_subtotal_cents: Math.round((ps.adjustments_subtotal_eur || 0) * 100),
        custom_subtotal_cents: Math.round((ps.custom_subtotal_eur || 0) * 100),
        suggested_price_cents: Math.round((ps.suggested_price_eur || 0) * 100),
        min_price_cents: Math.round((ps.min_price_eur || 0) * 100),
        margin_percent: ps.margin_percent,
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

    // Telegram-Push an Berater — kompakte Entscheidungs-Vorschau
    const leadName = `${lead.first_name} ${lead.last_name || ""}`.trim();
    const fmt = (n: number) => (n || 0).toLocaleString("de-DE", { maximumFractionDigits: 0 });
    const truncate = (s: string, n: number) => {
      if (!s) return "";
      const clean = String(s).replace(/\s+/g, " ").trim();
      return clean.length > n ? clean.slice(0, n - 1) + "…" : clean;
    };
    const escape = (s: string) => String(s || "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));

    const breakdownLines = breakdown.slice(0, 6).map((p: any) => {
      if (p.kind === "catalog_item") {
        const adj = p.adjustment_percent ? ` ${p.adjustment_percent > 0 ? "+" : ""}${p.adjustment_percent}%` : "";
        const reason = p.adjustment_reason ? ` <i>(${escape(truncate(p.adjustment_reason, 60))})</i>` : "";
        return `• ${escape(p.label)}: ${fmt(p.base_price_eur)}€${adj} → <b>${fmt(p.line_total_eur)}€</b>${reason}`;
      }
      return `• ${escape(p.label)} <i>(custom)</i>: <b>${fmt(p.line_total_eur)}€</b>${p.adjustment_reason ? " — " + escape(truncate(p.adjustment_reason, 60)) : ""}`;
    }).join("\n");

    // Problem (1-2 Sätze) & Top-Benefits (max 3)
    const problemSummary = truncate(
      draft.problem_analysis?.summary || draft.problem_analysis?.core_problem || "—",
      220,
    );
    const benefits: string[] = Array.isArray(draft.benefit_analysis?.key_benefits)
      ? draft.benefit_analysis.key_benefits
      : Array.isArray(draft.benefit_analysis)
      ? draft.benefit_analysis
      : [];
    const benefitsBlock = benefits.slice(0, 3).map((b: any) => `• ${escape(truncate(typeof b === "string" ? b : b?.text || b?.title || JSON.stringify(b), 90))}`).join("\n");

    // Connectoren
    const connectors: string[] = Array.isArray(draft.required_connectors)
      ? draft.required_connectors.map((c: any) => (typeof c === "string" ? c : c?.name || c?.connector || "")).filter(Boolean)
      : [];
    const connectorsLine = connectors.length ? connectors.slice(0, 8).map((c) => `<code>${escape(c)}</code>`).join(" · ") : "—";

    // Auffällige Änderungen / Risiken
    const flags: string[] = [];
    const bigAdjustments = breakdown.filter((p: any) => Math.abs(p.adjustment_percent || 0) >= 25);
    if (bigAdjustments.length) {
      flags.push(`⚠️ <b>${bigAdjustments.length} Position(en) mit Aufschlag ≥25%</b>`);
    }
    const customShare = (ps.custom_subtotal_eur || 0) / Math.max(1, ps.suggested_price_eur || 0);
    if (customShare > 0.4) {
      flags.push(`⚠️ Custom-Anteil <b>${Math.round(customShare * 100)}%</b> (hoch — schwer skalierbar)`);
    }
    if (ps.margin_percent != null && ps.margin_percent < 50) {
      flags.push(`⚠️ Marge <b>${ps.margin_percent}%</b> unter Zielkorridor (60–75%)`);
    }
    if (draft.is_custom_solution) {
      flags.push(`ℹ️ Komplett-Custom-Lösung (kein Standardprodukt)`);
    }
    if (ps.suggested_price_eur && ps.min_price_eur && ps.suggested_price_eur < ps.min_price_eur * 1.1) {
      flags.push(`⚠️ Vorschlag nur ${Math.round(((ps.suggested_price_eur / ps.min_price_eur) - 1) * 100)}% über Min-Preis`);
    }
    const openQuestions: string[] = Array.isArray(draft.qa_checks?.open_questions) ? draft.qa_checks.open_questions : [];
    if (openQuestions.length) {
      flags.push(`❓ ${openQuestions.length} offene Frage(n)`);
    }
    const clientInputs: string[] = Array.isArray(draft.client_inputs_required) ? draft.client_inputs_required : [];
    if (clientInputs.length) {
      flags.push(`📥 ${clientInputs.length} Kunden-Input(s) nötig vor Start`);
    }

    const flagsBlock = flags.length ? `\n<b>Auffällig:</b>\n${flags.join("\n")}\n` : "";
    const openQBlock = openQuestions.length
      ? `\n<b>Offene Fragen:</b>\n${openQuestions.slice(0, 3).map((q: string) => `• ${escape(truncate(q, 100))}`).join("\n")}\n`
      : "";

    const draftId = inserted!.id;

    // Kompakte HTML-Vorschau erzeugen (Angebotsdaten + Preiserklärung + Auffälligkeiten)
    let previewUrl: string | null = null;
    try {
      const pv = await fetch(`${SUPABASE_URL}/functions/v1/generate-draft-preview-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(CRON_SECRET ? { "x-cron-secret": CRON_SECRET } : {}),
        },
        body: JSON.stringify({ draft_id: draftId }),
      });
      const pvJson = await pv.json().catch(() => ({}));
      if (pv.ok && pvJson?.signed_url) previewUrl = pvJson.signed_url;
      else console.warn("Preview generation failed:", pvJson);
    } catch (e) {
      console.warn("Preview call error:", e);
    }

    const previewBtn = previewUrl ? [{ text: "📄 Vorschau (PDF) ansehen", url: previewUrl }] : null;
    const inlineKb = qaPassed
      ? {
          inline_keyboard: [
            ...(previewBtn ? [previewBtn] : []),
            [
              { text: "✅ Freigeben", callback_data: `offer:approve:${draftId}` },
              { text: "🔁 Nachverhandeln", callback_data: `offer:negotiate:${draftId}` },
            ],
            [
              { text: "❓ Rückfrage", callback_data: `offer:info:${draftId}` },
              { text: "❌ Ablehnen", callback_data: `offer:reject:${draftId}` },
            ],
            [{ text: "→ Im CRM öffnen", url: `${APP_URL}/app/leads` }],
          ],
        }
      : {
          inline_keyboard: [
            ...(previewBtn ? [previewBtn] : []),
            [
              { text: "🔁 Nachverhandeln", callback_data: `offer:negotiate:${draftId}` },
              { text: "❓ Rückfrage", callback_data: `offer:info:${draftId}` },
            ],
            [{ text: "❌ Ablehnen", callback_data: `offer:reject:${draftId}` }],
            [{ text: "→ Im CRM korrigieren", url: `${APP_URL}/app/leads` }],
          ],
        };

    const message =
      `📝 <b>Neuer Angebotsentwurf</b>\n` +
      `Lead: <b>${escape(leadName)}</b>${lead.company ? " · " + escape(lead.company) : ""}\n` +
      `Lösung: <b>${escape(draft.solution_concept.title)}</b>\n\n` +
      `<b>Problem:</b> ${escape(problemSummary)}\n` +
      (benefitsBlock ? `\n<b>Kern-Nutzen:</b>\n${benefitsBlock}\n` : "") +
      `\n<b>Connectoren:</b> ${connectorsLine}\n` +
      `\n<b>Preisherleitung:</b>\n${breakdownLines || "—"}\n\n` +
      `Katalog-Basis: ${fmt(ps.catalog_subtotal_eur)}€\n` +
      `Aufschläge: ${fmt(ps.adjustments_subtotal_eur)}€\n` +
      `Custom: ${fmt(ps.custom_subtotal_eur)}€\n` +
      `<b>Vorschlag: ${fmt(ps.suggested_price_eur)}€</b>` +
      (ps.min_price_eur ? ` (Min: ${fmt(ps.min_price_eur)}€)` : "") +
      (ps.margin_percent != null ? ` · Marge ${ps.margin_percent}%` : "") + `\n` +
      flagsBlock +
      openQBlock +
      `\nQA: ${qaPassed ? "✅ bestanden — bereit zur Freigabe" : "⚠️ Korrektur nötig"}` +
      (previewUrl ? `\n\n📄 <a href="${previewUrl}">Kompakte Vorschau (PDF) öffnen</a>` : "");

    const tgRes = await sendTelegram(message, inlineKb);

    if (tgRes?.message_id) {
      await supabase
        .from("offer_drafts")
        .update({ telegram_message_id: tgRes.message_id, telegram_chat_id: tgRes.chat_id })
        .eq("id", draftId);
    }


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
