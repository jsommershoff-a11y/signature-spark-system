// Public endpoint that handles confirm + revoke actions for email consents.
// GET /email-consent-action?token=...&action=confirm|revoke
// Returns a small HTML page so it can be opened from email links directly.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BRAND = { name: 'KI-Automationen', primary: '#F6711F', accent: '#0F6B4A' };

function page(title: string, message: string, ok = true) {
  const color = ok ? BRAND.accent : '#b91c1c';
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${title}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>body{margin:0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f4f4f5;color:#0F172A;}
  .card{max-width:520px;margin:60px auto;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.06);overflow:hidden}
  .head{background:${BRAND.primary};color:#fff;padding:20px 28px;font-weight:600}
  .body{padding:28px}
  h2{margin:0 0 12px;color:${color}}
  p{line-height:1.6;color:#334155}</style></head>
  <body><div class="card"><div class="head">${BRAND.name}</div><div class="body"><h2>${title}</h2><p>${message}</p></div></div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const action = (url.searchParams.get('action') || 'confirm').toLowerCase();
    if (!token || token.length < 16) {
      return new Response(page('Ungültiger Link', 'Der Bestätigungslink ist nicht gültig.', false), {
        status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    if (!['confirm', 'revoke'].includes(action)) {
      return new Response(page('Unbekannte Aktion', 'Aktion wird nicht unterstützt.', false), {
        status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: row, error } = await admin
      .from('email_consents')
      .select('*')
      .eq('confirmation_token', token)
      .maybeSingle();

    if (error || !row) {
      return new Response(page('Link ungültig', 'Wir konnten diese Anfrage nicht finden.', false), {
        status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

    if (action === 'confirm') {
      if (row.status === 'revoked') {
        return new Response(page('Bereits widerrufen', 'Diese Einwilligung wurde bereits widerrufen.', false), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      if (row.status === 'confirmed') {
        return new Response(page('Bereits bestätigt', `Deine E-Mail-Adresse ${row.email} ist bereits bestätigt.`), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      if (new Date(row.expires_at).getTime() < Date.now()) {
        return new Response(page('Link abgelaufen', 'Dieser Bestätigungslink ist abgelaufen. Bitte fordere ihn neu an.', false), {
          status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      await admin.from('email_consents').update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_ip: ip,
      }).eq('id', row.id);
      return new Response(page('E-Mail bestätigt', `Vielen Dank! ${row.email} ist jetzt für ${row.purpose} bestätigt. Du kannst dich jederzeit über den Link in unseren E-Mails wieder austragen.`), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // revoke
    await admin.from('email_consents').update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_ip: ip,
    }).eq('id', row.id);
    return new Response(page('Einwilligung widerrufen', `Deine Einwilligung für ${row.email} (${row.purpose}) wurde widerrufen. Wir senden dir keine weiteren E-Mails dieser Art.`), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Unknown error';
    console.error('email-consent-action error:', m);
    return new Response(page('Fehler', 'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.', false), {
      status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
});
