// generate-draft-preview-pdf
// Erzeugt eine kompakte HTML-Vorschau eines Angebotsentwurfs (Angebotsdaten + Preiserklärung
// + Auffälligkeiten), legt sie als druckbare Datei in 'offer-draft-previews' ab und gibt eine
// signierte URL zurück. Der Berater kann sie via Telegram-Button öffnen und bei Bedarf via
// Browser → "Drucken / Als PDF speichern" archivieren.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const BUCKET = "offer-draft-previews";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 Tage

const esc = (s: unknown) =>
  String(s ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!));
const fmtEur = (n: number | null | undefined) =>
  (Number(n) || 0).toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";

function buildHtml(args: {
  draft: any;
  lead: any;
  flags: string[];
}): string {
  const { draft, lead, flags } = args;
  const ps = draft.pricing_strategy || {};
  const breakdown: any[] = Array.isArray(draft.price_breakdown) ? draft.price_breakdown : [];
  const connectors: any[] = Array.isArray(draft.required_connectors) ? draft.required_connectors : [];
  const benefits: any[] = Array.isArray(draft.benefit_analysis?.key_benefits)
    ? draft.benefit_analysis.key_benefits
    : [];
  const pains: string[] = Array.isArray(draft.problem_analysis?.pain_points)
    ? draft.problem_analysis.pain_points
    : [];
  const openQs: string[] = Array.isArray(draft.qa_checks?.open_questions) ? draft.qa_checks.open_questions : [];
  const inputs = draft.client_inputs_required || {};

  const breakdownRows = breakdown.map((p) => {
    const isCatalog = p.kind === "catalog_item";
    const adj = p.adjustment_percent
      ? `${p.adjustment_percent > 0 ? "+" : ""}${p.adjustment_percent}%`
      : "—";
    return `
      <tr>
        <td>
          <div class="line-name">${esc(p.label)}${
            isCatalog ? ` <span class="badge badge-cat">Katalog${p.catalog_code ? " · " + esc(p.catalog_code) : ""}</span>` : ` <span class="badge badge-cust">Custom</span>`
          }</div>
          ${p.adjustment_reason ? `<div class="line-reason">${esc(p.adjustment_reason)}</div>` : ""}
        </td>
        <td class="num">${esc(p.quantity ?? 1)}</td>
        <td class="num">${isCatalog ? fmtEur(p.base_price_eur) : "—"}</td>
        <td class="num">${isCatalog ? adj : "—"}</td>
        <td class="num strong">${fmtEur(p.line_total_eur)}</td>
      </tr>`;
  }).join("");

  const flagsHtml = flags.length
    ? `<ul class="flags">${flags.map((f) => `<li>${f}</li>`).join("")}</ul>`
    : `<p class="muted">Keine Auffälligkeiten erkannt.</p>`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Angebotsentwurf · Vorschau · ${esc(`${lead.first_name || ""} ${lead.last_name || ""}`).trim()}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a2e; line-height: 1.5; max-width: 820px; margin: 0 auto; padding: 24px; background: #fff; font-size: 13.5px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .6px; color: #6b7280; margin: 24px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  .meta { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
  .kv { display: flex; justify-content: space-between; border-bottom: 1px dashed #e5e7eb; padding: 4px 0; }
  .kv .k { color: #6b7280; }
  .kv .v { font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #6b7280; border-bottom: 2px solid #1a1a2e; padding: 6px 8px; }
  td { padding: 8px; border-bottom: 1px solid #eef0f3; vertical-align: top; }
  td.num { text-align: right; white-space: nowrap; }
  .strong { font-weight: 700; }
  .line-name { font-weight: 600; }
  .line-reason { font-size: 11.5px; color: #6b7280; margin-top: 2px; }
  .badge { display: inline-block; font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 600; vertical-align: middle; margin-left: 4px; }
  .badge-cat { background: #eef4ff; color: #1e40af; }
  .badge-cust { background: #fef3c7; color: #92400e; }
  ul { margin: 4px 0 4px 18px; padding: 0; }
  ul li { margin-bottom: 3px; }
  .totals { margin-top: 12px; background: #f9fafb; border-radius: 6px; padding: 12px 14px; }
  .totals .row { display: flex; justify-content: space-between; padding: 3px 0; }
  .totals .total { font-size: 16px; font-weight: 800; border-top: 2px solid #1a1a2e; padding-top: 6px; margin-top: 6px; }
  .flags { background: #fff7ed; border-left: 3px solid #f59e0b; padding: 10px 14px 10px 28px; border-radius: 4px; }
  .flags li { color: #9a3412; }
  .muted { color: #6b7280; font-style: italic; }
  .pill { display: inline-block; background: #eef0f3; padding: 2px 8px; border-radius: 999px; font-size: 11.5px; margin: 2px 4px 2px 0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a1a2e; padding-bottom: 12px; margin-bottom: 8px; }
  .qa { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; }
  .qa.ok { background: #d1fae5; color: #065f46; }
  .qa.warn { background: #fee2e2; color: #991b1b; }
  .print-hint { position: fixed; top: 12px; right: 12px; background: #1a1a2e; color: #fff; padding: 8px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; }
  @media print { .print-hint { display: none; } body { padding: 0; } }
</style>
</head>
<body>
  <button class="print-hint" onclick="window.print()">📄 Als PDF drucken</button>

  <div class="header">
    <div>
      <h1>Angebotsentwurf · Vorschau</h1>
      <div class="meta">Interner Berater-Review · nicht versendet</div>
    </div>
    <div style="text-align:right">
      <div class="qa ${draft.qa_passed ? "ok" : "warn"}">${draft.qa_passed ? "QA bestanden" : "QA: Korrektur nötig"}</div>
      <div class="meta" style="margin-top:6px">Erstellt ${new Date(draft.created_at || Date.now()).toLocaleString("de-DE")}</div>
    </div>
  </div>

  <h2>Lead</h2>
  <div class="grid">
    <div class="kv"><span class="k">Name</span><span class="v">${esc(`${lead.first_name || ""} ${lead.last_name || ""}`).trim() || "—"}</span></div>
    <div class="kv"><span class="k">Firma</span><span class="v">${esc(lead.company || "—")}</span></div>
    <div class="kv"><span class="k">E-Mail</span><span class="v">${esc(lead.email || "—")}</span></div>
    <div class="kv"><span class="k">Branche</span><span class="v">${esc(lead.industry || "—")}</span></div>
  </div>

  <h2>Lösung</h2>
  <div style="font-weight:700;font-size:15px">${esc(draft.solution_concept?.title || "—")}</div>
  <div style="margin-top:4px">${esc(draft.solution_concept?.description || "")}</div>
  ${draft.solution_concept?.target_process ? `<div class="meta" style="margin-top:6px"><b>Zielprozess:</b> ${esc(draft.solution_concept.target_process)}</div>` : ""}

  <h2>Problem & Pain Points</h2>
  <div>${esc(draft.problem_analysis?.current_situation || "—")}</div>
  ${pains.length ? `<ul>${pains.slice(0, 6).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
  ${draft.problem_analysis?.economic_impact ? `<div class="meta" style="margin-top:4px"><b>Wirtschaftliche Auswirkung:</b> ${esc(draft.problem_analysis.economic_impact)}</div>` : ""}

  ${benefits.length ? `<h2>Kern-Nutzen</h2><ul>${benefits.slice(0, 5).map((b: any) => `<li>${esc(typeof b === "string" ? b : b?.text || b?.title || JSON.stringify(b))}</li>`).join("")}</ul>` : ""}

  <h2>Connectoren</h2>
  <div>${connectors.length ? connectors.map((c: any) => `<span class="pill">${esc(typeof c === "string" ? c : c?.name || "")}</span>`).join("") : `<span class="muted">keine</span>`}</div>

  <h2>Preisherleitung</h2>
  <table>
    <thead>
      <tr><th>Position</th><th class="num">Menge</th><th class="num">Katalog-Basis</th><th class="num">Anpassung</th><th class="num">Gesamt</th></tr>
    </thead>
    <tbody>${breakdownRows || `<tr><td colspan="5" class="muted">Keine Positionen.</td></tr>`}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Katalog-Basis</span><span>${fmtEur(ps.catalog_subtotal_eur)}</span></div>
    <div class="row"><span>Aufschläge</span><span>${fmtEur(ps.adjustments_subtotal_eur)}</span></div>
    <div class="row"><span>Custom-Anteil</span><span>${fmtEur(ps.custom_subtotal_eur)}</span></div>
    <div class="row total"><span>Vorschlagspreis</span><span>${fmtEur(ps.suggested_price_eur)}</span></div>
    <div class="row meta"><span>Min-Preis</span><span>${fmtEur(ps.min_price_eur)}</span></div>
    ${ps.margin_percent != null ? `<div class="row meta"><span>Marge</span><span>${esc(ps.margin_percent)} %</span></div>` : ""}
    ${ps.retainer_monthly_eur ? `<div class="row meta"><span>Retainer / Monat</span><span>${fmtEur(ps.retainer_monthly_eur)}</span></div>` : ""}
    ${ps.payment_terms ? `<div class="row meta"><span>Zahlungsbedingungen</span><span>${esc(ps.payment_terms)}</span></div>` : ""}
  </div>
  ${ps.rationale ? `<div class="meta" style="margin-top:8px"><b>Begründung:</b> ${esc(ps.rationale)}</div>` : ""}

  <h2>Auffälligkeiten</h2>
  ${flagsHtml}

  ${openQs.length ? `<h2>Offene Fragen</h2><ul>${openQs.slice(0, 8).map((q) => `<li>${esc(q)}</li>`).join("")}</ul>` : ""}

  ${inputs.mandatory?.length || inputs.optional?.length ? `<h2>Kunden-Inputs nötig</h2>
    ${inputs.mandatory?.length ? `<div><b>Pflicht:</b><ul>${inputs.mandatory.map((x: string) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
    ${inputs.optional?.length ? `<div><b>Optional:</b><ul>${inputs.optional.map((x: string) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}` : ""}

  <div class="meta" style="margin-top:24px;text-align:center">Draft-ID: ${esc(draft.id)} · Modell: ${esc(draft.ai_model || "—")}</div>
</body>
</html>`;
}

function computeFlags(draft: any): string[] {
  const ps = draft.pricing_strategy || {};
  const breakdown: any[] = Array.isArray(draft.price_breakdown) ? draft.price_breakdown : [];
  const out: string[] = [];
  const big = breakdown.filter((p) => Math.abs(p.adjustment_percent || 0) >= 25);
  if (big.length) out.push(`${big.length} Position(en) mit Aufschlag ≥ 25 %`);
  const customShare = (ps.custom_subtotal_eur || 0) / Math.max(1, ps.suggested_price_eur || 0);
  if (customShare > 0.4) out.push(`Custom-Anteil ${Math.round(customShare * 100)} % (hoch)`);
  if (ps.margin_percent != null && ps.margin_percent < 50) out.push(`Marge ${ps.margin_percent} % unter Zielkorridor (60–75 %)`);
  if (draft.is_custom_solution) out.push("Komplett-Custom-Lösung (kein Standardprodukt)");
  if (ps.suggested_price_eur && ps.min_price_eur && ps.suggested_price_eur < ps.min_price_eur * 1.1) {
    out.push(`Vorschlag nur ${Math.round(((ps.suggested_price_eur / ps.min_price_eur) - 1) * 100)} % über Min-Preis`);
  }
  if (Array.isArray(draft.qa_checks?.open_questions) && draft.qa_checks.open_questions.length) {
    out.push(`${draft.qa_checks.open_questions.length} offene Frage(n)`);
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const cronHeader = req.headers.get("x-cron-secret");
  const isInternal = CRON_SECRET && cronHeader === CRON_SECRET;

  if (!isInternal) {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: u } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!u?.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
  }

  try {
    const { draft_id } = await req.json();
    if (!draft_id || typeof draft_id !== "string") {
      return new Response(JSON.stringify({ error: "draft_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: draft, error: dErr } = await supabase
      .from("offer_drafts")
      .select("*")
      .eq("id", draft_id)
      .single();
    if (dErr || !draft) throw new Error("Draft not found");

    const { data: lead } = await supabase
      .from("crm_leads")
      .select("id, first_name, last_name, company, email, industry")
      .eq("id", draft.lead_id)
      .single();

    const flags = computeFlags(draft);
    const html = buildHtml({ draft, lead: lead || {}, flags });

    const path = `${draft.lead_id}/${draft_id}.html`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, new Blob([html], { type: "text/html; charset=utf-8" }), {
        upsert: true,
        contentType: "text/html; charset=utf-8",
      });
    if (upErr) throw new Error(`upload failed: ${upErr.message}`);

    const { data: signed, error: sErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
    if (sErr || !signed?.signedUrl) throw new Error(`sign failed: ${sErr?.message || "no url"}`);

    await supabase
      .from("offer_drafts")
      .update({ preview_pdf_path: path, preview_generated_at: new Date().toISOString() })
      .eq("id", draft_id);

    return new Response(
      JSON.stringify({ ok: true, path, signed_url: signed.signedUrl, expires_in: SIGNED_URL_TTL_SECONDS }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("generate-draft-preview-pdf error:", e);
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
