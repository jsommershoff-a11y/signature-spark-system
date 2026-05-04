import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const name = body?.name ? String(body.name).trim().slice(0, 200) : "";
    const whatsappRaw = body?.whatsapp ? String(body.whatsapp).trim() : "";
    const source = body?.source ? String(body.source).slice(0, 100) : "newsletter";
    const consent = body?.consent === true;

    // Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
      return new Response(JSON.stringify({ error: "Bitte gültige E-Mail angeben." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!name || name.length < 2) {
      return new Response(JSON.stringify({ error: "Bitte Namen angeben." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let whatsapp: string | null = null;
    if (whatsappRaw) {
      const digits = whatsappRaw.replace(/\D/g, "");
      if (digits.length < 7 || whatsappRaw.length > 40) {
        return new Response(JSON.stringify({ error: "WhatsApp-Nummer ungültig." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      whatsapp = whatsappRaw;
    }
    if (!consent) {
      return new Response(JSON.stringify({ error: "Bitte Einwilligung bestätigen." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = req.headers.get("user-agent") ?? null;

    const { error } = await supabase
      .from("newsletter_signups")
      .upsert(
        {
          email,
          name,
          whatsapp,
          source,
          consent_marketing: consent,
          trial_started_at: now.toISOString(),
          trial_ends_at: trialEnd.toISOString(),
          ip_address: ip,
          user_agent: ua,
          status: "trial_active",
          meta: { referer: req.headers.get("referer") ?? null },
        },
        { onConflict: "email" },
      );

    if (error) {
      console.error("[newsletter-signup] insert error", error);
      return new Response(JSON.stringify({ error: "Speichern fehlgeschlagen." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== Auto-Provisionierung: 1 Monat Mitgliederbereich-Zugang =====
    const origin = req.headers.get("origin") || "https://www.dein-automatisierungsberater.de";
    const redirectTo = `${origin}/app/dashboard?welcome=newsletter`;
    let userId: string | null = null;
    let magicLink: string | null = null;
    let provisioned = false;

    try {
      // 1) User finden oder anlegen
      const { data: profByEmail } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("email", email)
        .maybeSingle();

      if (profByEmail?.user_id) {
        userId = profByEmail.user_id as string;
      } else {
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { full_name: name, source: "newsletter_trial" },
        });
        if (createErr && !String(createErr.message ?? "").toLowerCase().includes("already")) {
          throw createErr;
        }
        userId = created?.user?.id ?? null;

        // Falls trotz Fehler User existiert – per generateLink den ID auflösen
        if (!userId) {
          const { data: link } = await supabase.auth.admin.generateLink({
            type: "magiclink", email, options: { redirectTo },
          });
          userId = (link as any)?.user?.id ?? null;
        }
      }

      // 2) Profil-Trial setzen (30 Tage)
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "trialing",
            trial_started_at: now.toISOString(),
            trial_ends_at: trialEnd.toISOString(),
            full_name: name,
            phone: whatsapp,
            updated_at: now.toISOString(),
          })
          .eq("user_id", userId);

        // 3) Sicherstellen, dass member_basic Rolle vergeben ist (Trigger setzt sie idR schon)
        await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role: "member_basic" }, { onConflict: "user_id,role" });

        // 4) Magic-Link generieren für sofortigen Zugang
        const { data: link } = await supabase.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: { redirectTo },
        });
        magicLink = (link as any)?.properties?.action_link ?? null;
        provisioned = true;
      }
    } catch (provErr) {
      console.error("[newsletter-signup] provisioning failed", provErr);
    }

    // Status & Magic-Link in Signup-Eintrag persistieren
    await supabase
      .from("newsletter_signups")
      .update({
        user_id: userId,
        status: provisioned ? "provisioned" : "trial_active",
        meta: {
          referer: req.headers.get("referer") ?? null,
          provisioned,
          magic_link_generated: !!magicLink,
        },
      })
      .ilike("email", email);

    // 5) Welcome-Email mit Magic-Link via Resend (best-effort)
    if (magicLink) {
      try {
        await supabase.functions.invoke("send-newsletter-welcome", {
          body: { email, name, magicLink, trialEndsAt: trialEnd.toISOString() },
        });
      } catch (_) { /* ignore – fallback: Team kann Link manuell senden */ }
    }

    // Team-Benachrichtigung (best-effort)
    try {
      await supabase.functions.invoke("send-team-notification", {
        body: {
          subject: `Neuer Newsletter-Trial: ${email}`,
          message: `Name: ${name}\nE-Mail: ${email}\nWhatsApp: ${whatsapp ?? "—"}\nQuelle: ${source}\nProvisioniert: ${provisioned}\nTrial bis: ${trialEnd.toISOString()}`,
        },
      });
    } catch (_) { /* ignore */ }

    return new Response(
      JSON.stringify({
        ok: true,
        provisioned,
        trial_ends_at: trialEnd.toISOString(),
        magic_link_sent: !!magicLink,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[newsletter-signup] error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
