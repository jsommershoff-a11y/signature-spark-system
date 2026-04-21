// OneDrive → Posteingang Sync
// Holt Briefe aus dem konfigurierten OneDrive-Ordner, lädt sie in Storage,
// startet OCR/Klassifizierung und verschiebt die Datei nach Verarbeitung
// in einen Ziel-Unterordner (optional nach Kategorie).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/microsoft_onedrive";

interface DriveItem {
  id: string;
  name: string;
  file?: { mimeType: string };
  folder?: unknown;
  size?: number;
  createdDateTime?: string;
}

function gwHeaders() {
  const lov = Deno.env.get("LOVABLE_API_KEY");
  const od = Deno.env.get("MICROSOFT_ONEDRIVE_API_KEY");
  if (!lov) throw new Error("LOVABLE_API_KEY missing");
  if (!od) throw new Error("MICROSOFT_ONEDRIVE_API_KEY missing");
  return {
    Authorization: `Bearer ${lov}`,
    "X-Connection-Api-Key": od,
    "Content-Type": "application/json",
  };
}

async function gwFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: { ...gwHeaders(), ...(init.headers || {}) },
  });
  return res;
}

// Resolve folder by path → ensure it exists (create recursively if needed)
async function ensureFolder(path: string): Promise<string> {
  // path like "/Posteingang/Verarbeitet/Rechnungen"
  const clean = path.replace(/^\/+|\/+$/g, "");
  if (!clean) return "root";
  const segments = clean.split("/");
  let parentId = "root";
  let currentPath = "";
  for (const seg of segments) {
    currentPath += "/" + seg;
    // Try GET by path first
    const getRes = await gwFetch(
      `/me/drive/root:${encodeURI(currentPath)}`,
    );
    if (getRes.ok) {
      const j = await getRes.json();
      parentId = j.id;
      continue;
    }
    // Create
    const createRes = await gwFetch(`/me/drive/items/${parentId}/children`, {
      method: "POST",
      body: JSON.stringify({
        name: seg,
        folder: {},
        "@microsoft.graph.conflictBehavior": "replace",
      }),
    });
    if (!createRes.ok) {
      const t = await createRes.text();
      throw new Error(`Folder create failed (${seg}): ${createRes.status} ${t}`);
    }
    const cj = await createRes.json();
    parentId = cj.id;
  }
  return parentId;
}

async function listFolderFiles(folderPath: string): Promise<DriveItem[]> {
  const clean = folderPath.replace(/^\/+|\/+$/g, "");
  const url = clean
    ? `/me/drive/root:/${encodeURI(clean)}:/children?$top=200`
    : `/me/drive/root/children?$top=200`;
  const res = await gwFetch(url);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`List folder failed: ${res.status} ${t}`);
  }
  const j = await res.json();
  return (j.value as DriveItem[]).filter((x) => x.file && !x.folder);
}

async function downloadItem(itemId: string): Promise<{ blob: Blob; mime: string }> {
  const res = await gwFetch(`/me/drive/items/${itemId}/content`);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Download failed: ${res.status} ${t}`);
  }
  const mime = res.headers.get("content-type") || "application/octet-stream";
  const blob = await res.blob();
  return { blob, mime };
}

async function moveItem(itemId: string, targetFolderId: string, newName?: string) {
  const body: Record<string, unknown> = {
    parentReference: { id: targetFolderId },
  };
  if (newName) body.name = newName;
  const res = await gwFetch(`/me/drive/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Move failed: ${res.status} ${t}`);
  }
  return res.json();
}

function categoryToFolder(cat?: string | null): string {
  if (!cat) return "Sonstiges";
  const map: Record<string, string> = {
    invoice: "Rechnungen",
    rechnung: "Rechnungen",
    contract: "Vertraege",
    vertrag: "Vertraege",
    offer: "Angebote",
    angebot: "Angebote",
    authority: "Behoerden",
    behoerde: "Behoerden",
    behörde: "Behoerden",
    advertisement: "Werbung",
    werbung: "Werbung",
    bank: "Bank",
    legal: "Recht",
    recht: "Recht",
  };
  return map[cat.toLowerCase()] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization") || "";

  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(supabaseUrl, serviceKey);

  try {
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    // Verify admin role
    const { data: roleData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load (or create default) settings
    let { data: settings } = await admin
      .from("mail_sync_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!settings) {
      const { data: ins } = await admin
        .from("mail_sync_settings")
        .insert({ user_id: userId })
        .select()
        .single();
      settings = ins;
    }

    const sourcePath = settings.source_folder_path || "/Posteingang";
    const processedPath = settings.processed_folder_path || "/Posteingang/Verarbeitet";
    const sortByCategory = settings.sort_by_category !== false;

    // Ensure source folder exists (so users dont get errors first run)
    await ensureFolder(sourcePath);

    // List files
    const items = await listFolderFiles(sourcePath);

    // Get profile id for uploaded_by
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        // Skip duplicates
        const { data: existing } = await admin
          .from("incoming_mail")
          .select("id, status, category")
          .eq("source_provider", "onedrive")
          .eq("source_item_id", item.id)
          .maybeSingle();

        let mailId = existing?.id as string | undefined;
        let mailCategory = existing?.category as string | null | undefined;
        let mailStatus = existing?.status as string | undefined;

        if (!existing) {
          // Download
          const { blob, mime } = await downloadItem(item.id);
          const ext = item.name.split(".").pop() || "bin";
          const path = `${userId}/onedrive-${Date.now()}-${item.id}.${ext}`;
          const arrayBuffer = await blob.arrayBuffer();

          const { error: upErr } = await admin.storage
            .from("incoming-mail")
            .upload(path, new Uint8Array(arrayBuffer), { contentType: mime });
          if (upErr) throw new Error(`Storage: ${upErr.message}`);

          const { data: inserted, error: insErr } = await admin
            .from("incoming_mail")
            .insert({
              file_path: path,
              file_name: item.name,
              uploaded_by: profile?.id ?? null,
              status: "new",
              source_provider: "onedrive",
              source_item_id: item.id,
              received_date: item.createdDateTime || null,
            })
            .select()
            .single();
          if (insErr) throw new Error(`Insert: ${insErr.message}`);
          mailId = inserted.id;

          // Trigger OCR/classify (re-uses existing function)
          const ocrRes = await fetch(
            `${supabaseUrl}/functions/v1/mail-ocr-classify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceKey}`,
              },
              body: JSON.stringify({ mail_id: mailId }),
            },
          );
          if (ocrRes.ok) {
            const j = await ocrRes.json().catch(() => ({}));
            mailCategory = j?.category ?? null;
            mailStatus = "processed";
          }
          imported++;
        } else {
          skipped++;
        }

        // Move file in OneDrive to processed folder
        const subFolder = sortByCategory
          ? categoryToFolder(mailCategory)
          : null;
        const targetPath = subFolder
          ? `${processedPath}/${subFolder}`
          : processedPath;
        const targetId = await ensureFolder(targetPath);
        await moveItem(item.id, targetId);

        if (mailId) {
          await admin
            .from("incoming_mail")
            .update({
              status: mailStatus || "processed",
              meta: { onedrive_moved_to: targetPath },
            })
            .eq("id", mailId);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${item.name}: ${msg}`);
        console.error("Item error", item.name, msg);
      }
    }

    await admin
      .from("mail_sync_settings")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_count: imported,
        last_sync_error: errors.length ? errors.join(" | ").slice(0, 500) : null,
      })
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({
        ok: true,
        scanned: items.length,
        imported,
        skipped,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Sync error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
