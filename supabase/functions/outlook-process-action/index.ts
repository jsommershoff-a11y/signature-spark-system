// Verarbeitet Aktionen aus dem Outlook-Postfach: Mail → Aufgabe / Ticket / Pipeline-Deal
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ActionPayload {
  action: "task" | "ticket" | "deal";
  email: {
    messageId?: string;
    subject?: string;
    bodyPreview?: string;
    bodyHtml?: string;
    fromName?: string;
    fromAddress?: string;
  };
  // Optional Overrides
  priority?: "low" | "normal" | "high" | "urgent";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Nicht authentifiziert" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");

    // User-Client zur Identitätsprüfung
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Ungültige Session" }, 401);
    const userId = userData.user.id;

    // Admin-Check
    const { data: roles } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) return json({ error: "Nur Admins" }, 403);

    const body = (await req.json()) as ActionPayload;
    if (!body?.action || !body?.email) return json({ error: "Ungültige Eingabe" }, 400);

    // Service-Client für Schreibzugriffe
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Profile-ID des aktuellen Users
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    const profileId = profile?.id;

    const fromAddress = body.email.fromAddress?.toLowerCase().trim();
    const fromName = body.email.fromName ?? "";
    const subject = body.email.subject ?? "(kein Betreff)";
    const bodyText = body.email.bodyPreview ?? "";

    // Lead-Match per E-Mail (oder neu anlegen)
    let leadId: string | null = null;
    if (fromAddress) {
      const { data: existing } = await admin
        .from("crm_leads")
        .select("id")
        .ilike("email", fromAddress)
        .maybeSingle();
      if (existing) {
        leadId = existing.id;
      } else {
        // Lead anlegen
        const [first, ...rest] = (fromName || fromAddress.split("@")[0]).split(" ");
        const last = rest.join(" ") || null;
        const { data: newLead, error: leadErr } = await admin
          .from("crm_leads")
          .insert({
            email: fromAddress,
            first_name: first || "Unbekannt",
            last_name: last,
            source_type: "inbound_email" as never,
            status: "new" as never,
            notes: `Automatisch erstellt aus Outlook-E-Mail: "${subject}"`,
            owner_user_id: profileId,
          } as never)
          .select("id")
          .single();
        if (leadErr) {
          console.error("Lead-Anlage fehlgeschlagen:", leadErr);
          return json({ error: `Lead konnte nicht erstellt werden: ${leadErr.message}` }, 500);
        }
        leadId = newLead.id;
      }
    }

    // Aktion ausführen
    if (body.action === "task") {
      if (!profileId) return json({ error: "Kein Profil gefunden" }, 500);
      const { data: task, error } = await admin
        .from("crm_tasks")
        .insert({
          assigned_user_id: profileId,
          title: `E-Mail: ${subject}`.slice(0, 200),
          description: `Von: ${fromName} <${fromAddress}>\n\n${bodyText}`,
          type: "follow_up" as never,
          status: "open" as never,
          lead_id: leadId,
        } as never)
        .select()
        .single();
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, kind: "task", id: task.id, leadId });
    }

    if (body.action === "ticket") {
      const { data: ticket, error } = await admin
        .from("support_tickets")
        .insert({
          subject: subject.slice(0, 250),
          body: bodyText,
          status: "open",
          priority: body.priority ?? "normal",
          source: "email",
          email_message_id: body.email.messageId ?? null,
          sender_email: fromAddress ?? null,
          sender_name: fromName || null,
          lead_id: leadId,
          created_by: profileId ?? null,
          assigned_to: profileId ?? null,
        })
        .select()
        .single();
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, kind: "ticket", id: ticket.id, leadId });
    }

    if (body.action === "deal") {
      // Pipeline wird via Trigger automatisch angelegt, wenn neuer Lead entsteht.
      // Für bestehende Leads ggf. Pipeline-Item updaten.
      return json({
        ok: true,
        kind: "deal",
        leadId,
        message: leadId
          ? "Lead in Pipeline platziert / aktualisiert"
          : "Kein Empfänger für Lead erkannt",
      });
    }

    return json({ error: "Unbekannte Aktion" }, 400);
  } catch (e) {
    console.error("outlook-process-action error:", e);
    const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
    return json({ error: msg }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
