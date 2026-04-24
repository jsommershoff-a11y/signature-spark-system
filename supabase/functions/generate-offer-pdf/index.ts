import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OfferLineItem {
  name: string;
  description?: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function generateOfferHTML(offer: any): string {
  const json = offer.offer_json || {};
  const lead = offer.crm_leads || {};
  const lineItems: OfferLineItem[] = json.line_items || [];
  const isVariable = json.offer_mode === "variable";
  const variableData = json.variable_offer_data;

  const painPointsHtml = json.discovery_data?.pain_points
    ?.filter((p: any) => p.selected)
    .map((p: any) => `<li>${p.label}</li>`)
    .join("") || "";

  const lineItemsHtml = lineItems
    .map(
      (item) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;">
        <strong>${item.name}</strong>
        ${item.description ? `<br/><span style="color:#6b7280;font-size:13px;">${item.description}</span>` : ""}
      </td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCents(item.unit_price_cents)}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${formatCents(item.total_cents)}</td>
    </tr>`
    )
    .join("");

  const valuePropsHtml = json.ai_generated?.value_propositions
    ?.map((v: string) => `<li style="margin-bottom:4px;">✓ ${v}</li>`)
    .join("") || "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${json.title || "Angebot"} - KI-Automationen</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
      @page { margin: 15mm; size: A4; }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a2e;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 24px;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #1a1a2e;
    }
    .logo { font-size: 28px; font-weight: 800; color: #1a1a2e; }
    .meta { text-align: right; color: #6b7280; font-size: 14px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #1a1a2e; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 8px; text-align: left; border-bottom: 2px solid #1a1a2e; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .totals { text-align: right; margin-top: 16px; }
    .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
    .totals .total { font-size: 20px; font-weight: 800; color: #1a1a2e; border-top: 2px solid #1a1a2e; padding-top: 8px; margin-top: 8px; }
    .highlight-box { background: #f0f4ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 16px 0; }
    .pain-points { columns: 2; gap: 16px; }
    .pain-points li { margin-bottom: 4px; font-size: 14px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
    .print-btn { position: fixed; bottom: 24px; right: 24px; background: #1a1a2e; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .print-btn:hover { background: #2d2d4e; }
    .intro { font-style: italic; color: #4b5563; background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
    .variable-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .variable-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .variable-card .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .variable-card .value { font-size: 20px; font-weight: 700; color: #1a1a2e; margin-top: 4px; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">📄 Als PDF speichern</button>

  <div class="header">
    <div>
      <div class="logo">KI-Automationen</div>
      ${json.company_info ? `<div style="font-size:12px;color:#6b7280;margin-top:4px;">${json.company_info.address || ""}<br/>${json.company_info.ust_id || ""}</div>` : ""}
    </div>
    <div class="meta">
      <div>${isVariable ? "Kurzangebot" : "Angebot"}</div>
      <div>Gültig bis: ${json.valid_until || "—"}</div>
      ${offer.created_at ? `<div>Erstellt: ${new Date(offer.created_at).toLocaleDateString("de-DE")}</div>` : ""}
    </div>
  </div>

  <div class="section">
    <div style="color:#6b7280;font-size:13px;">Erstellt für:</div>
    <div style="font-size:18px;font-weight:700;">${json.customer?.name || `${lead.first_name || ""} ${lead.last_name || ""}`}</div>
    ${json.customer?.company ? `<div style="color:#6b7280;">${json.customer.company}</div>` : ""}
    <div style="color:#6b7280;">${json.customer?.email || lead.email || ""}</div>
  </div>

  ${json.ai_generated?.personalized_intro ? `<div class="intro">${json.ai_generated.personalized_intro}</div>` : ""}

  ${painPointsHtml ? `
  <div class="section">
    <div class="section-title">Identifizierte Herausforderungen</div>
    <ul class="pain-points">${painPointsHtml}</ul>
  </div>` : ""}

  <div class="section">
    <div class="section-title">${json.title || "Angebot"}</div>
    ${json.subtitle ? `<div style="color:#6b7280;margin-bottom:12px;">${json.subtitle}</div>` : ""}
  </div>

  ${isVariable && variableData ? `
  <div class="section">
    <div class="section-title">Erwartete Leistung</div>
    <p style="white-space:pre-wrap;">${variableData.expected_service || ""}</p>
    <div class="variable-grid" style="margin-top:16px;">
      <div class="variable-card">
        <div class="label">Geschätzte Kosten</div>
        <div class="value">${formatCents(variableData.estimated_cost_cents || 0)}</div>
        <div style="font-size:12px;color:#6b7280;">zzgl. MwSt</div>
      </div>
      <div class="variable-card">
        <div class="label">Voraussichtliche Fertigstellung</div>
        <div class="value" style="font-size:16px;">${variableData.estimated_completion || "—"}</div>
      </div>
    </div>
    ${variableData.additional_cost_note ? `
    <div class="highlight-box" style="margin-top:16px;">
      <strong>Hinweis zu Mehrkosten:</strong><br/>
      ${variableData.additional_cost_note}
    </div>` : ""}
  </div>` : `
  ${lineItemsHtml ? `
  <div class="section">
    <table>
      <thead>
        <tr>
          <th>Leistung</th>
          <th style="text-align:right;">Menge</th>
          <th style="text-align:right;">Preis</th>
          <th style="text-align:right;">Gesamt</th>
        </tr>
      </thead>
      <tbody>${lineItemsHtml}</tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Zwischensumme:</span><span>${formatCents(json.subtotal_cents || 0)}</span></div>
      ${json.discount_cents ? `<div class="row" style="color:#3b82f6;"><span>Rabatt${json.discount_reason ? ` (${json.discount_reason})` : ""}:</span><span>-${formatCents(json.discount_cents)}</span></div>` : ""}
      <div class="row"><span>MwSt (${json.tax_rate || 19}%):</span><span>${formatCents(json.tax_cents || 0)}</span></div>
      <div class="row total"><span>Gesamt:</span><span>${formatCents(json.total_cents || 0)}</span></div>
      ${json.payment_terms?.type === "installments" && json.payment_terms.installments ? `<div style="font-size:13px;color:#6b7280;margin-top:4px;">in ${json.payment_terms.installments} Raten</div>` : ""}
    </div>
  </div>` : ""}
  `}

  ${valuePropsHtml ? `
  <div class="highlight-box">
    <div class="section-title" style="margin-bottom:8px;">Ihre Vorteile</div>
    <ul style="list-style:none;padding:0;">${valuePropsHtml}</ul>
  </div>` : ""}

  ${json.ai_generated?.urgency_message ? `
  <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;text-align:center;margin:24px 0;">
    <strong>${json.ai_generated.urgency_message}</strong>
  </div>` : ""}

  ${json.service_description ? `
  <div class="section" style="margin-top:32px;">
    <div class="section-title">Leistungsbeschreibung</div>
    <p style="font-size:13px;white-space:pre-wrap;">${json.service_description}</p>
  </div>` : ""}

  ${json.terms_and_conditions ? `
  <div class="section">
    <div class="section-title">Allgemeine Geschäftsbedingungen</div>
    <p style="font-size:12px;color:#6b7280;white-space:pre-wrap;">${json.terms_and_conditions}</p>
  </div>` : ""}

  <div class="footer">
    <p>KI-Automationen${json.company_info ? ` · ${json.company_info.geschaeftsfuehrer || ""} · ${json.company_info.hrb || ""}` : ""}</p>
    <p>Dieses Angebot wurde digital erstellt.</p>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { offer_id, public_token } = await req.json();

    if (!offer_id && !public_token) {
      return new Response(
        JSON.stringify({ error: "offer_id or public_token required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from("offers")
      .select(`*, crm_leads (id, first_name, last_name, email, company)`);

    if (offer_id) {
      query = query.eq("id", offer_id);
    } else {
      query = query.eq("public_token", public_token);
    }

    const { data: offer, error } = await query.single();

    if (error || !offer) {
      return new Response(
        JSON.stringify({ error: "Offer not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = generateOfferHTML(offer);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
