import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Newsletter Double-Opt-In: validiert Bestätigungs-Token.
 * Erst nach Klick auf den Link aus der Bestätigungsmail wird:
 *   - status auf "confirmed"/"provisioned" gesetzt
 *   - 30-Tage-Trial freigeschaltet (profiles + user_roles)
 *   - Magic-Link via Welcome-Mail versendet
 *   - Team-Benachrichtigung verschickt
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const token = String(body?.token ?? "").trim();

    if (!token || token.length < 32 || token.length > 128 || !/^[a-f0-9]+$/i.test(token)) {
      return json({ error: "Ungültiger Bestätigungslink." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: row, error: lookupErr } = await supabase
      .from("newsletter_signups")
      .select("id,email,name,whatsapp,source,confirmed_at,token_expires_at,confirm_token")
      .eq("confirm_token", token)
      .maybeSingle();

    if (lookupErr) {
      console.error("[newsletter-confirm] lookup error", lookupErr);
      return json({ error: "Bestätigung fehlgeschlagen." }, 500);
    }
    if (!row) {
      return json({ error: "Ungültiger oder bereits verwendeter Bestätigungslink." }, 404);
    }

    // Bereits bestätigt? Idempotent ok.
    if (row.confirmed_at) {
      return json({
        ok: true,
        already_confirmed: true,
        email: row.email,
      });
    }

    if (row.token_expires_at && new Date(row.token_expires_at) < new Date()) {
      return json({
        error: "Bestätigungslink abgelaufen. Bitte erneut anmelden.",
      }, 410);
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    // ===== Provisionierung: 1 Monat Mitgliederbereich-Zugang =====
    const origin = req.headers.get("origin") || "https://www.dein-automatisierungsberater.de";
    const redirectTo = `${origin}/app/dashboard?welcome=newsletter`;
    let userId: string | null = null;
    let magicLink: string | null = null;
    let provisioned = false;

    try {
      const { data: profByEmail } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("email", row.email)
        .maybeSingle();

      if (profByEmail?.user_id) {
        userId = profByEmail.user_id as string;
      } else {
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: row.email,
          email_confirm: true,
          user_metadata: { full_name: row.name ?? "", source: "newsletter_doi" },
        });
        if (createErr && !String(createErr.message ?? "").toLowerCase().includes("already")) {
          throw createErr;
        }
        userId = created?.user?.id ?? null;

        if (!userId) {
          const { data: link } = await supabase.auth.admin.generateLink({
            type: "magiclink", email: row.email, options: { redirectTo },
          });
          userId = (link as any)?.user?.id ?? null;
        }
      }

      if (userId) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "trialing",
            trial_started_at: now.toISOString(),
            trial_ends_at: trialEnd.toISOString(),
            full_name: row.name ?? undefined,
            phone: row.whatsapp ?? undefined,
            updated_at: now.toISOString(),
          })
          .eq("user_id", userId);

        await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role: "member_basic" }, { onConflict: "user_id,role" });

        const { data: link } = await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: row.email,
          options: { redirectTo },
        });
        magicLink = (link as any)?.properties?.action_link ?? null;
        provisioned = true;
      }
    } catch (provErr) {
      console.error("[newsletter-confirm] provisioning failed", provErr);
    }

    // Token verbrennen + Status updaten
    await supabase
      .from("newsletter_signups")
      .update({
        confirmed_at: now.toISOString(),
        confirmation_ip: ip,
        confirm_token: null, // Token einlösen
        status: provisioned ? "provisioned" : "confirmed",
        user_id: userId,
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEnd.toISOString(),
      })
      .eq("id", row.id);

    // Welcome-Mail mit Magic-Link
    if (magicLink) {
      try {
        await supabase.functions.invoke("send-newsletter-welcome", {
          body: { email: row.email, name: row.name, magicLink, trialEndsAt: trialEnd.toISOString() },
        });
      } catch (_) { /* ignore */ }
    }

    // Team-Benachrichtigung
    try {
      await supabase.functions.invoke("send-team-notification", {
        body: {
          subject: `Newsletter-DOI bestätigt: ${row.email}`,
          message: `Name: ${row.name ?? "—"}\nE-Mail: ${row.email}\nWhatsApp: ${row.whatsapp ?? "—"}\nQuelle: ${row.source ?? "—"}\nProvisioniert: ${provisioned}\nTrial bis: ${trialEnd.toISOString()}`,
        },
      });
    } catch (_) { /* ignore */ }

    return json({
      ok: true,
      confirmed: true,
      provisioned,
      email: row.email,
      magic_link_sent: !!magicLink,
      trial_ends_at: trialEnd.toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[newsletter-confirm] error", msg);
    return json({ error: msg }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
