import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_ROWS = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_SOURCE_TYPES = [
  "inbound_paid", "inbound_organic", "referral",
  "outbound_ai", "outbound_manual", "partner",
];

interface LeadRow {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  location?: string;
  source_type?: string;
}

interface ImportError {
  row: number;
  reason: string;
}

function validateRow(row: Record<string, unknown>, index: number): { lead: LeadRow | null; error: ImportError | null } {
  const firstName = String(row.first_name || row.vorname || row.name || "").trim();
  const lastName = String(row.last_name || row.nachname || "").trim();
  const email = String(row.email || row["e-mail"] || row["e_mail"] || "").trim().toLowerCase();
  const phone = String(row.phone || row.telefon || row.tel || "").trim();
  const company = String(row.company || row.firma || row.unternehmen || "").trim();
  const industry = String(row.industry || row.branche || "").trim();
  const location = String(row.location || row.ort || row.stadt || row.standort || "").trim();
  const sourceType = String(row.source_type || row.quelle || "").trim().toLowerCase();

  if (!firstName || firstName.length < 1) {
    return { lead: null, error: { row: index + 1, reason: "Vorname fehlt" } };
  }
  if (!email || !emailRegex.test(email)) {
    return { lead: null, error: { row: index + 1, reason: `Ungültige E-Mail: "${email}"` } };
  }

  return {
    lead: {
      first_name: firstName.slice(0, 100),
      last_name: lastName ? lastName.slice(0, 100) : undefined,
      email: email.slice(0, 255),
      phone: phone ? phone.slice(0, 30) : undefined,
      company: company ? company.slice(0, 200) : undefined,
      industry: industry ? industry.slice(0, 100) : undefined,
      location: location ? location.slice(0, 200) : undefined,
      source_type: VALID_SOURCE_TYPES.includes(sourceType) ? sourceType : undefined,
    },
    error: null,
  };
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Detect separator
  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));

  return lines.slice(1).map((line) => {
    const values = line.split(sep).map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: hasRole } = await adminClient.rpc("has_min_role", {
      _user_id: userId,
      _min_role: "mitarbeiter",
    });

    if (!hasRole) {
      return new Response(JSON.stringify({ error: "Insufficient role" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse multipart form data
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Expected multipart/form-data" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: "File too large (max 5 MB)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
    const isImage = /\.(jpg|jpeg|png|gif|webp|pdf)$/i.test(fileName);

    // Images/PDFs: store in bucket only, no data import
    if (isImage) {
      const arrayBuffer = await file.arrayBuffer();
      const storagePath = `uploads/${Date.now()}_${file.name}`;
      const { error: uploadError } = await adminClient.storage
        .from("lead-imports")
        .upload(storagePath, arrayBuffer, { contentType: file.type });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return new Response(
          JSON.stringify({ error: "File upload failed", details: uploadError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          type: "file_stored",
          message: "Datei wurde gespeichert (kein automatischer Import bei Bildern/PDFs)",
          path: storagePath,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isCSV && !isExcel) {
      return new Response(
        JSON.stringify({ error: "Unsupported format. Use CSV, XLSX, XLS, or image/PDF files." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse data
    let rows: Record<string, unknown>[] = [];

    if (isCSV) {
      const text = await file.text();
      rows = parseCSV(text);
    } else {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        return new Response(JSON.stringify({ error: "Excel file has no sheets" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const sheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      // Normalize headers to lowercase
      rows = rows.map((r) => {
        const normalized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(r)) {
          normalized[key.toLowerCase().trim()] = value;
        }
        return normalized;
      });
    }

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "No data rows found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (rows.length > MAX_ROWS) {
      return new Response(
        JSON.stringify({ error: `Too many rows (${rows.length}). Maximum is ${MAX_ROWS}.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and collect
    const validLeads: LeadRow[] = [];
    const errors: ImportError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const { lead, error } = validateRow(rows[i], i);
      if (error) {
        errors.push(error);
      } else if (lead) {
        validLeads.push(lead);
      }
    }

    if (validLeads.length === 0) {
      return new Response(
        JSON.stringify({ success: false, imported: 0, skipped: errors.length, errors }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert in batches of 50
    let imported = 0;
    const insertErrors: ImportError[] = [];

    for (let i = 0; i < validLeads.length; i += 50) {
      const batch = validLeads.slice(i, i + 50).map((l) => ({
        first_name: l.first_name,
        last_name: l.last_name || null,
        email: l.email,
        phone: l.phone || null,
        company: l.company || null,
        industry: l.industry || null,
        location: l.location || null,
        source_type: (l.source_type || "inbound_organic") as "inbound_organic",
        discovered_by: "manual" as const,
      }));

      const { error: insertError, data } = await adminClient
        .from("crm_leads")
        .insert(batch)
        .select("id");

      if (insertError) {
        console.error("Insert error at batch starting index", i, insertError);
        insertErrors.push({ row: i + 1, reason: insertError.message });
      } else {
        imported += data?.length || batch.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        type: "data_import",
        imported,
        skipped: errors.length + insertErrors.length,
        total: rows.length,
        errors: [...errors, ...insertErrors].slice(0, 50), // Cap error list
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("import-leads error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
