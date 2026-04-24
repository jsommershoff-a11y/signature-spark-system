// Public endpoint to start a Double-Opt-In consent flow.
// Body: { email, purpose?, source? }
// Creates a pending email_consents row and sends a confirmation email
// containing a link to /email-consent/confirm?token=...
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1';

const BRAND = {
  name: 'KI-Automationen',
  primary: '#F6711F',
  accent: '#0F6B4A',
  url: 'https://ki-automationen.io',
};

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildConfirmEmail(confirmUrl: string, purpose: string) {
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <tr><td style="background:${BRAND.primary};padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:18px;letter-spacing:0.5px;">${BRAND.name}</h1>
      </td></tr>
      <tr><td style="padding:32px;">
        <h2 style="margin:0 0 16px;font-size:22px;color:${BRAND.primary};">Bitte bestätige deine E-Mail-Adresse</h2>
        <p style="font-size:15px;line-height:1.6;color:#334155;">Du hast dich für <strong>${escapeHtml(purpose)}</strong> von ${BRAND.name} angemeldet. Damit wir dir Nachrichten zusenden dürfen, bestätige bitte deine E-Mail-Adresse mit einem Klick:</p>
        <p style="text-align:center;margin:32px 0;">
          <a href="${confirmUrl}" style="background:${BRAND.accent};color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;display:inline-block;">E-Mail bestätigen</a>
        </p>
        <p style="font-size:13px;color:#64748b;">Falls du dich nicht angemeldet hast, ignoriere diese E-Mail einfach – ohne Bestätigung erfolgt kein Versand. Der Link ist 7 Tage gültig.</p>
      </td></tr>
      <tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;text-align:center;">
        © ${new Date().getFullYear()} ${BRAND.name} · <a href="${BRAND.url}" style="color:#64748b;">${BRAND.url.replace('https://', '')}</a>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
  return { subject: `Bitte bestätige deine E-Mail-Adresse · ${BRAND.name}`, html };
}

function encodeRaw({ to, subject, html }: { to: string; subject: string; html: string }) {
  const headers = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    html,
  ].join('\r\n');
  const bytes = new TextEncoder().encode(headers);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_MAIL_API_KEY = Deno.env.get('GOOGLE_MAIL_API_KEY');
    const PUBLIC_BASE_URL = Deno.env.get('PUBLIC_BASE_URL') || BRAND.url;

    const body = await req.json().catch(() => null);
    const email = (body?.email as string | undefined)?.trim().toLowerCase();
    const purpose = (body?.purpose as string | undefined) || 'notifications';
    const source = (body?.source as string | undefined) || 'web';

    if (!email || !/^\S+@\S+\.\S+$/.test(email) || email.length > 255) {
      return new Response(JSON.stringify({ error: 'invalid email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (purpose.length > 64) {
      return new Response(JSON.stringify({ error: 'invalid purpose' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const ua = req.headers.get('user-agent') || null;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // If already confirmed, do not re-send
    const { data: existing } = await admin
      .from('email_consents')
      .select('id, status, confirmation_token')
      .eq('email', email)
      .eq('purpose', purpose)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle();

    if (existing?.status === 'confirmed') {
      return new Response(JSON.stringify({ success: true, status: 'already_confirmed' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let token: string;
    if (existing?.status === 'pending') {
      // Reuse existing pending token, refresh expiry
      token = existing.confirmation_token;
      await admin.from('email_consents').update({
        expires_at: new Date(Date.now() + 7 * 86400_000).toISOString(),
        requested_ip: ip,
        requested_user_agent: ua,
        source,
      }).eq('id', existing.id);
    } else {
      const { data: inserted, error: insErr } = await admin
        .from('email_consents')
        .insert({ email, purpose, source, requested_ip: ip, requested_user_agent: ua })
        .select('confirmation_token')
        .single();
      if (insErr) throw insErr;
      token = inserted.confirmation_token;
    }

    const confirmUrl = `${PUBLIC_BASE_URL.replace(/\/$/, '')}/email-consent/confirm?token=${encodeURIComponent(token)}`;

    // Send confirmation email if Gmail is configured
    if (LOVABLE_API_KEY && GOOGLE_MAIL_API_KEY) {
      const { subject, html } = buildConfirmEmail(confirmUrl, purpose);
      const raw = encodeRaw({ to: email, subject, html });
      const r = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': GOOGLE_MAIL_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      });
      const result = await r.json().catch(() => ({}));
      const status = r.ok ? 'sent' : 'failed';
      await admin.from('email_send_log').insert({
        message_id: crypto.randomUUID(),
        status,
        template_name: 'consent_confirmation',
        recipient_email: email,
        subject,
        error_message: r.ok ? null : `Gmail API [${r.status}]: ${JSON.stringify(result)}`,
        metadata: { purpose, source },
      });
      if (!r.ok) {
        return new Response(JSON.stringify({ success: false, error: 'send_failed' }), {
          status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      console.warn('Gmail not configured – consent email not sent. Confirm URL:', confirmUrl);
    }

    return new Response(JSON.stringify({ success: true, status: 'pending' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('email-consent-request error:', message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
