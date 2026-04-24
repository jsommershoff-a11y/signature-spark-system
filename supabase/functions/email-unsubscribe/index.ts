import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const enrollmentId = url.searchParams.get("eid");
    const leadId = url.searchParams.get("lid");

    if (!enrollmentId && !leadId) {
      return new Response(renderPage("Ungültiger Abmeldelink."), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (enrollmentId) {
      // Unsubscribe from a specific sequence enrollment
      const { error } = await supabase
        .from("lead_sequence_enrollments")
        .update({ status: "unsubscribed" })
        .eq("id", enrollmentId)
        .eq("status", "active");

      if (error) {
        console.error("Unsubscribe error:", error);
        return new Response(renderPage("Ein Fehler ist aufgetreten. Bitte versuche es später erneut."), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }

    if (leadId) {
      // Unsubscribe from ALL active enrollments for this lead
      const { error } = await supabase
        .from("lead_sequence_enrollments")
        .update({ status: "unsubscribed" })
        .eq("lead_id", leadId)
        .eq("status", "active");

      if (error) {
        console.error("Unsubscribe all error:", error);
        return new Response(renderPage("Ein Fehler ist aufgetreten. Bitte versuche es später erneut."), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }

    return new Response(renderPage("Du wurdest erfolgreich abgemeldet. Du erhältst keine weiteren E-Mails aus dieser Sequenz."), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    console.error("email-unsubscribe error:", e);
    return new Response(renderPage("Ein unerwarteter Fehler ist aufgetreten."), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }
});

function renderPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abmeldung – KI Automationen</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; color: #1a1a2e; }
    .card { background: white; border-radius: 12px; padding: 48px; max-width: 480px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    h1 { font-size: 24px; margin-bottom: 16px; color: #16613b; }
    p { font-size: 16px; line-height: 1.6; color: #555; }
  </style>
</head>
<body>
  <div class="card">
    <h1>E-Mail Abmeldung</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
