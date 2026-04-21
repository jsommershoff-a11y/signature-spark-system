import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return json({ error: "Unauthorized" }, 401);

    const { data: hasAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!hasAdmin) return json({ error: "Forbidden" }, 403);

    const { mail_id } = await req.json();
    if (!mail_id) return json({ error: "mail_id required" }, 400);

    const { data: mail, error: mailErr } = await supabase
      .from("incoming_mail")
      .select("*")
      .eq("id", mail_id)
      .single();
    if (mailErr || !mail) return json({ error: "Mail not found" }, 404);

    // Download file
    const { data: fileBlob, error: dlErr } = await supabase.storage
      .from("incoming-mail")
      .download(mail.file_path);
    if (dlErr || !fileBlob) return json({ error: "Download failed", details: dlErr?.message }, 500);

    // Convert to base64 for AI
    const buf = await fileBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    const mimeType = fileBlob.type || "application/pdf";

    // Call Lovable AI Gateway with vision (Gemini supports PDF + images)
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein OCR- und Klassifizierungs-Assistent für deutsche Geschäftspost. Extrahiere den Volltext und klassifiziere das Dokument. Antworte ausschließlich mit JSON.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analysiere dieses Dokument und gib JSON zurück mit:
{
  "ocr_text": "vollständiger extrahierter Text",
  "sender": "Absender (Firma/Person)",
  "subject": "Betreff oder Hauptthema (max 100 Zeichen)",
  "received_date": "YYYY-MM-DD oder null wenn nicht erkennbar",
  "category": "rechnung|mahnung|vertrag|behoerde|werbung|kundenanfrage|sonstiges",
  "priority": "low|normal|high|urgent",
  "ai_summary": "Kurze Zusammenfassung in 2-3 Sätzen mit den wichtigsten Punkten und ggf. Handlungsbedarf"
}`,
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return json({ error: "AI failed", status: aiRes.status, details: txt }, 500);
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    // Update mail row
    const { error: updErr } = await supabase
      .from("incoming_mail")
      .update({
        ocr_text: parsed.ocr_text,
        sender: parsed.sender,
        subject: parsed.subject,
        received_date: parsed.received_date,
        category: parsed.category,
        priority: parsed.priority || "normal",
        ai_summary: parsed.ai_summary,
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", mail_id);

    if (updErr) return json({ error: "Update failed", details: updErr.message }, 500);

    return json({ ok: true, result: parsed });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
