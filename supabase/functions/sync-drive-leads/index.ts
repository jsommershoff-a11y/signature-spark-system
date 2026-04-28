// Edge Function: sync-drive-leads
// Liest Leads aus einem Google Sheet und legt neue Datensaetze in crm_leads an.
// - Insert-only (bestehende Leads werden nie ueberschrieben)
// - Dedupe per E-Mail (lower) und normalisierter Telefonnummer
// - Schreibt nach Verarbeitung Status zurueck in Sheet-Spalte "CRM-Status"
// - Auth: x-cron-secret ODER eingeloggter Admin

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SHEETS_GW = "https://connector-gateway.lovable.dev/google_sheets/v4";

const HEADER_MAP: Record<string, string> = {
  // crm_leads field <- normalized header
  email: "email",
  "e-mail": "email",
  "e-mail-adresse": "email",
  mail: "email",
  vorname: "first_name",
  "first name": "first_name",
  firstname: "first_name",
  nachname: "last_name",
  "last name": "first_name",
  lastname: "last_name",
  geschaeftsfuehrer: "last_name", // Fullname goes to last_name, split below
  "geschäftsführer": "last_name",
  ansprechpartner: "last_name",
  telefon: "phone",
  telefonnummer: "phone",
  phone: "phone",
  handy: "phone",
  handynummer: "phone_mobile",
  mobile: "phone_mobile",
  firma: "company",
  firmenname: "company",
  unternehmen: "company",
  company: "company",
  website: "website_url",
  url: "website_url",
  domain: "website_url",
  branche: "industry",
  unternehmensbereich: "industry",
  industry: "industry",
  ort: "location",
  stadt: "location",
  city: "location",
  adresse: "location",
  location: "location",
  quelle: "source_label",
  "quelle ueber den kontakt": "source_label",
  "quelle über den kontakt": "source_label",
  source: "source_label",
  notiz: "notes",
  notes: "notes",
  kommentar: "notes",
  "infos über das unternehmen": "notes_company",
  "infos ueber das unternehmen": "notes_company",
  "inhaltliche vorschläge für eine personalisierte ansprache": "notes_pitch",
  "inhaltliche vorschlaege fuer eine personalisierte ansprache": "notes_pitch",
};

function normalizeHeader(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ");
}

function normalizePhone(p?: string | null): string {
  if (!p) return "";
  return p.replace(/[^0-9]/g, "");
}

function splitFullName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: "", last: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

const RowSchema = z
  .object({
    email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
    phone: z.string().optional(),
  })
  .refine((v) => !!v.email || !!(v.phone && normalizePhone(v.phone).length >= 5), {
    message: "Weder gueltige E-Mail noch Telefonnummer",
  });

const BodySchema = z
  .object({
    sheet_id: z.string().min(10).optional(),
    triggered_by: z.string().max(40).optional(),
    dry_run: z.boolean().optional(),
  })
  .default({});

async function callSheets(path: string, init?: RequestInit) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GOOGLE_SHEETS_API_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  if (!GOOGLE_SHEETS_API_KEY) throw new Error("GOOGLE_SHEETS_API_KEY missing");
  const res = await fetch(`${SHEETS_GW}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Sheets API ${res.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : {};
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST")
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const cronSecret = Deno.env.get("CRON_SECRET");

  // Auth: cron secret OR admin JWT
  const headerSecret = req.headers.get("x-cron-secret");
  let authorized = false;
  let triggeredBy = "unknown";
  if (cronSecret && headerSecret && headerSecret === cronSecret) {
    authorized = true;
    triggeredBy = "cron";
  } else {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (userData?.user?.id) {
        const adminClient = createClient(supabaseUrl, serviceKey);
        const { data: roleOk } = await adminClient.rpc("has_min_role", {
          _user_id: userData.user.id,
          _min_role: "admin",
        });
        if (roleOk === true) {
          authorized = true;
          triggeredBy = "manual";
        }
      }
    }
  }
  if (!authorized) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  let body: z.infer<typeof BodySchema>;
  try {
    const raw = req.headers.get("content-length") === "0" ? {} : await req.json().catch(() => ({}));
    body = BodySchema.parse(raw);
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "invalid_body", detail: String(e) }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (body.triggered_by) triggeredBy = body.triggered_by;

  // Determine which sheets to sync
  let sheetsToSync: { sheet_id: string; tab_name: string }[] = [];
  if (body.sheet_id) {
    const { data } = await supabase
      .from("drive_sync_state")
      .select("sheet_id, tab_name, enabled")
      .eq("sheet_id", body.sheet_id)
      .maybeSingle();
    if (!data || !data.enabled)
      return new Response(JSON.stringify({ error: "sheet_not_enabled" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    sheetsToSync = [{ sheet_id: data.sheet_id, tab_name: data.tab_name }];
  } else {
    const { data } = await supabase
      .from("drive_sync_state")
      .select("sheet_id, tab_name")
      .eq("enabled", true);
    sheetsToSync = data ?? [];
  }

  const results: any[] = [];
  for (const cfg of sheetsToSync) {
    const r = await syncOneSheet(supabase, cfg.sheet_id, cfg.tab_name, triggeredBy, !!body.dry_run);
    results.push(r);
  }

  // Telegram notify: only when new leads or errors
  try {
    const totalInserted = results.reduce((a, r) => a + (r.inserted ?? 0), 0);
    const failed = results.filter((r) => r.status === "failed" || r.status === "completed_with_errors");
    if (!body.dry_run && (totalInserted > 0 || failed.length > 0)) {
      const lines = [
        `<b>📥 Drive-Sync (${triggeredBy})</b>`,
        `Sheets: ${results.length} · Neu: <b>${totalInserted}</b>`,
      ];
      for (const r of results) {
        lines.push(
          `• <code>${(r.sheet_id ?? "").slice(0, 10)}…</code> ${r.status} · ins:${r.inserted ?? 0} dup:${r.skippedDedupe ?? 0} inv:${r.skippedInvalid ?? 0}`,
        );
        if (r.errors?.length) lines.push(`  ⚠️ ${String(r.errors[0]).slice(0, 160)}`);
        if (r.error) lines.push(`  ❌ ${String(r.error).slice(0, 160)}`);
      }
      await sendTelegram(lines.join("\n"));
    }
  } catch (e) {
    console.error("telegram notify failed:", e);
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

async function syncOneSheet(
  supabase: any,
  sheetId: string,
  tabName: string,
  triggeredBy: string,
  dryRun: boolean,
) {
  const { data: runRow } = await supabase
    .from("drive_sync_runs")
    .insert({ sheet_id: sheetId, triggered_by: triggeredBy, status: "running" })
    .select("id")
    .single();
  const runId = runRow?.id;

  const errors: string[] = [];
  let inserted = 0;
  let skippedDedupe = 0;
  let skippedInvalid = 0;
  let rowsTotal = 0;

  try {
    // 1) Read all data including header
    const range = `${tabName}!A1:Z2000`;
    const sheetData = await callSheets(`/spreadsheets/${sheetId}/values/${range}`);
    const values: string[][] = sheetData.values ?? [];
    if (values.length < 2) throw new Error("Sheet ist leer oder hat keine Datenzeilen");

    const headerRaw = values[0];
    const dataRows = values.slice(1);
    rowsTotal = dataRows.length;

    // Find/append CRM-Status column
    const statusColName = "CRM-Status";
    let statusIdx = headerRaw.findIndex((h) => normalizeHeader(h) === normalizeHeader(statusColName));
    if (statusIdx === -1) {
      statusIdx = headerRaw.length;
      if (!dryRun) {
        const a1Col = colIndexToA1(statusIdx);
        await callSheets(
          `/spreadsheets/${sheetId}/values/${tabName}!${a1Col}1?valueInputOption=RAW`,
          { method: "PUT", body: JSON.stringify({ values: [[statusColName]] }) },
        );
      }
    }

    // 2) Map header -> field
    const fieldByCol: (string | null)[] = headerRaw.map((h) => HEADER_MAP[normalizeHeader(h)] ?? null);

    // 3) Process rows, batch status writes
    const statusWrites: { row: number; value: string }[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const sheetRowNumber = i + 2; // 1-based + header
      const obj: Record<string, string> = {};
      for (let c = 0; c < headerRaw.length; c++) {
        const field = fieldByCol[c];
        const val = (row[c] ?? "").toString().trim();
        if (!val) continue;
        // Special: combine multiple notes columns
        if (field === "notes_company" || field === "notes_pitch") {
          obj.notes = (obj.notes ? obj.notes + "\n\n" : "") + val;
          continue;
        }
        if (field === "phone_mobile") {
          if (!obj.phone) obj.phone = val;
          continue;
        }
        if (field === "source_label") {
          obj.source_label = val;
          continue;
        }
        if (field) obj[field] = val;
      }

      // Skip fully empty rows silently (no status write)
      if (Object.keys(obj).length === 0) continue;

      // Resolve name field: if "last_name" looks like a full name and no first_name set
      if (obj.last_name && !obj.first_name && obj.last_name.includes(" ")) {
        const sp = splitFullName(obj.last_name);
        obj.first_name = sp.first;
        obj.last_name = sp.last;
      }

      // Validate
      const parsed = RowSchema.safeParse({ email: obj.email, phone: obj.phone });
      if (!parsed.success) {
        skippedInvalid++;
        statusWrites.push({
          row: sheetRowNumber,
          value: `invalid: ${parsed.error.issues.map((x) => x.message).join("; ")}`,
        });
        continue;
      }

      // Dedupe
      const emailNorm = obj.email ? obj.email.toLowerCase() : null;
      const phoneNorm = normalizePhone(obj.phone);

      let existing: any = null;
      if (emailNorm) {
        const { data } = await supabase
          .from("crm_leads")
          .select("id")
          .ilike("email", emailNorm)
          .limit(1)
          .maybeSingle();
        existing = data;
      }
      if (!existing && phoneNorm.length >= 5) {
        // Match by last 8 digits to handle formatting differences
        const suffix = phoneNorm.slice(-8);
        const { data } = await supabase.rpc("match_lead_by_phone", { search_suffix: suffix });
        if (data && data.length > 0) existing = data[0];
      }
      if (existing) {
        skippedDedupe++;
        statusWrites.push({ row: sheetRowNumber, value: "duplicate" });
        continue;
      }

      if (dryRun) {
        inserted++;
        statusWrites.push({ row: sheetRowNumber, value: "would_import" });
        continue;
      }

      // Insert
      const insertPayload: Record<string, unknown> = {
        first_name: obj.first_name || (obj.email ? obj.email.split("@")[0] : "Unbekannt"),
        last_name: obj.last_name || null,
        email: obj.email || `noemail+${sheetId.slice(0, 6)}-r${sheetRowNumber}@drive-import.local`,
        phone: obj.phone || null,
        company: obj.company || null,
        website_url: obj.website_url || null,
        industry: obj.industry || null,
        location: obj.location || null,
        notes: obj.notes || null,
        source_type: "inbound_organic",
        source_detail: `drive_sheet:${sheetId}${obj.source_label ? ` | ${obj.source_label}` : ""}`,
        discovered_by: "manual",
        status: "new",
        enrichment_json: {
          origin: "google_drive_sheet",
          drive_sheet_id: sheetId,
          drive_tab_name: tabName,
          drive_row_index: sheetRowNumber,
          drive_source_label: obj.source_label ?? null,
          drive_raw_row: Object.fromEntries(
            headerRaw.map((h, idx) => [h, (row[idx] ?? "").toString()]),
          ),
        },
      };

      const { error: insErr } = await supabase.from("crm_leads").insert(insertPayload);
      if (insErr) {
        errors.push(`Row ${sheetRowNumber}: ${insErr.message}`);
        statusWrites.push({ row: sheetRowNumber, value: `error: ${insErr.message.slice(0, 80)}` });
        continue;
      }
      inserted++;
      statusWrites.push({ row: sheetRowNumber, value: `imported ${new Date().toISOString().slice(0, 10)}` });
    }

    // Write status column back (batched per row, but we use a single batchUpdate)
    if (!dryRun && statusWrites.length > 0) {
      const a1Col = colIndexToA1(statusIdx);
      const data = statusWrites.map((w) => ({
        range: `${tabName}!${a1Col}${w.row}`,
        values: [[w.value]],
      }));
      // Chunk to avoid huge payloads
      const CHUNK = 200;
      for (let i = 0; i < data.length; i += CHUNK) {
        const slice = data.slice(i, i + CHUNK);
        try {
          await callSheets(`/spreadsheets/${sheetId}/values:batchUpdate`, {
            method: "POST",
            body: JSON.stringify({ valueInputOption: "RAW", data: slice }),
          });
        } catch (e) {
          errors.push(`status_writeback chunk@${i}: ${String(e).slice(0, 200)}`);
        }
      }
    }

    // Finalize run + state
    const status = errors.length > 0 ? "completed_with_errors" : "completed";
    if (runId) {
      await supabase
        .from("drive_sync_runs")
        .update({
          finished_at: new Date().toISOString(),
          inserted,
          skipped_dedupe: skippedDedupe,
          skipped_invalid: skippedInvalid,
          rows_total: rowsTotal,
          errors,
          status,
        })
        .eq("id", runId);
    }
    await supabase
      .from("drive_sync_state")
      .update({
        last_sync_at: new Date().toISOString(),
        last_status: status,
        last_error: errors[0] ?? null,
        total_inserted: undefined as any, // keep current total
      })
      .eq("sheet_id", sheetId);
    // Increment total_inserted separately
    if (inserted > 0) {
      const { data: cur } = await supabase
        .from("drive_sync_state")
        .select("total_inserted")
        .eq("sheet_id", sheetId)
        .single();
      await supabase
        .from("drive_sync_state")
        .update({ total_inserted: (cur?.total_inserted ?? 0) + inserted })
        .eq("sheet_id", sheetId);
    }

    return { sheet_id: sheetId, inserted, skippedDedupe, skippedInvalid, rowsTotal, errors, status };
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e).slice(0, 1000);
    if (runId) {
      await supabase
        .from("drive_sync_runs")
        .update({
          finished_at: new Date().toISOString(),
          inserted,
          skipped_dedupe: skippedDedupe,
          skipped_invalid: skippedInvalid,
          rows_total: rowsTotal,
          errors: [...errors, msg],
          status: "failed",
        })
        .eq("id", runId);
    }
    await supabase
      .from("drive_sync_state")
      .update({
        last_sync_at: new Date().toISOString(),
        last_status: "failed",
        last_error: msg,
      })
      .eq("sheet_id", sheetId);
    return { sheet_id: sheetId, status: "failed", error: msg };
  }
}

function colIndexToA1(idx: number): string {
  let n = idx;
  let s = "";
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}
