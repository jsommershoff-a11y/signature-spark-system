// Verarbeitet Aktionen aus dem Posteingang: Brief → Aufgabe / Ticket / Lead-Zuordnung
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ActionPayload {
  action: "task" | "ticket" | "deal" | "link_lead";
  mail_id: string;
  lead_id?: string; // optional manuelles Matching
  priority?: "low" | "normal" | "high" | "urgent";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Nicht authentifiziert" }, 401);
    const token = authHeader.replace("Bearer ", "");

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Ungültige Session" }, 401);
    const userId = userData.user.id;

    const { data: roles } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!(roles ?? []).some((r) => r.role === "admin"))
      return json({ error: "Nur Admins" }, 403);

    const body = (await req.json()) as ActionPayload;
    if (!body?.action || !body?.mail_id) return json({ error: "Ungültige Eingabe" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE);

    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    const profileId = profile?.id;

    // Mail laden
    const { data: mail, error: mailErr } = await admin
      .from("incoming_mail")
      .select("*")
      .eq("id", body.mail_id)
      .single();
    if (mailErr || !mail) return json({ error: "Brief nicht gefunden" }, 404);

    const subject = mail.subject || mail.file_name || "Eingangsbrief";
    const summary = mail.ai_summary || "";
    const sender = mail.sender || "Unbekannter Absender";
    let leadId: string | null = body.lead_id ?? mail.lead_id ?? null;

    // Lead-Match per Sender (E-Mail im Sender-String?)
    if (!leadId && sender) {
      const emailMatch = sender.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
      if (emailMatch) {
        const { data: existing } = await admin
          .from("crm_leads")
          .select("id")
          .ilike("email", emailMatch[0])
          .maybeSingle();
        if (existing) leadId = existing.id;
      }
    }

    // Action: Lead nur verknüpfen
    if (body.action === "link_lead") {
      if (!leadId) return json({ error: "Kein Lead zum Verknüpfen" }, 400);
      await admin.from("incoming_mail").update({ lead_id: leadId }).eq("id", mail.id);
      return json({ ok: true, kind: "link_lead", leadId });
    }

    // Aufgabe
    if (body.action === "task") {
      if (!profileId) return json({ error: "Kein Profil gefunden" }, 500);
      const { data: task, error } = await admin
        .from("crm_tasks")
        .insert({
          assigned_user_id: profileId,
          title: `Brief: ${subject}`.slice(0, 200),
          description: `Absender: ${sender}\n\n${summary}`,
          type: "follow_up" as never,
          status: "open" as never,
          lead_id: leadId,
        } as never)
        .select()
        .single();
      if (error) return json({ error: error.message }, 500);
      await admin
        .from("incoming_mail")
        .update({ task_id: task.id, lead_id: leadId, status: "processed", processed_at: new Date().toISOString() })
        .eq("id", mail.id);
      return json({ ok: true, kind: "task", id: task.id, leadId });
    }

    // Ticket
    if (body.action === "ticket") {
      const { data: ticket, error } = await admin
        .from("support_tickets")
        .insert({
          subject: subject.slice(0, 250),
          body: summary || mail.ocr_text?.slice(0, 2000) || "",
          status: "open",
          priority: body.priority ?? mail.priority ?? "normal",
          source: "mail",
          sender_email: null,
          sender_name: sender,
          lead_id: leadId,
          created_by: profileId ?? null,
          assigned_to: profileId ?? null,
        })
        .select()
        .single();
      if (error) return json({ error: error.message }, 500);
      await admin
        .from("incoming_mail")
        .update({ ticket_id: ticket.id, lead_id: leadId, status: "processed", processed_at: new Date().toISOString() })
        .eq("id", mail.id);
      return json({ ok: true, kind: "ticket", id: ticket.id, leadId });
    }

    // Deal / Pipeline
    if (body.action === "deal") {
      if (!leadId) return json({ error: "Kein Lead für Deal vorhanden" }, 400);
      await admin
        .from("incoming_mail")
        .update({ lead_id: leadId, status: "processed", processed_at: new Date().toISOString() })
        .eq("id", mail.id);
      return json({ ok: true, kind: "deal", leadId, message: "Lead in Pipeline platziert" });
    }

    return json({ error: "Unbekannte Aktion" }, 400);
  } catch (e) {
    console.error("mail-process-action error:", e);
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
