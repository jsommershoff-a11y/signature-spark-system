import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1';

type TemplateName = 'invitation' | 'confirmation' | 'reminder';

interface SendRequest {
  template: TemplateName;
  to: string;
  data?: Record<string, string>;
  cc?: string;
  bcc?: string;
  from_name?: string;
}

const BRAND = {
  name: 'KI-Automationen',
  primary: '#F6711F',
  accent: '#0F6B4A',
  url: 'https://www.krs-signature.de',
};

function layout(title: string, body: string, ctaLabel?: string, ctaUrl?: string) {
  const cta = ctaLabel && ctaUrl
    ? `<p style="text-align:center;margin:32px 0;">
         <a href="${ctaUrl}" style="background:${BRAND.accent};color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;display:inline-block;">${ctaLabel}</a>
       </p>` : '';
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr><td style="background:${BRAND.primary};padding:24px 32px;">
            <h1 style="color:#fff;margin:0;font-size:18px;letter-spacing:0.5px;">${BRAND.name}</h1>
          </td></tr>
          <tr><td style="padding:32px;">
            <h2 style="margin:0 0 16px;font-size:22px;color:${BRAND.primary};">${title}</h2>
            <div style="font-size:15px;line-height:1.6;color:#334155;">${body}</div>
            ${cta}
          </td></tr>
          <tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;text-align:center;">
            <p style="margin:0;">© ${new Date().getFullYear()} ${BRAND.name} · <a href="${BRAND.url}" style="color:#64748b;">${BRAND.url.replace('https://','')}</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function buildTemplate(name: TemplateName, data: Record<string, string> = {}) {
  const recipient = data.name || 'dort';
  switch (name) {
    case 'invitation': {
      const inviter = data.inviter || 'Das KRS Team';
      const inviteUrl = data.invite_url || `${BRAND.url}/auth`;
      const subject = `${inviter} hat dich zu ${BRAND.name} eingeladen`;
      const html = layout(
        `Willkommen bei ${BRAND.name}`,
        `<p>Hallo ${recipient},</p>
         <p><strong>${inviter}</strong> hat dich eingeladen, dem ${BRAND.name} Business Operating System beizutreten.</p>
         <p>Klicke auf den Button unten, um deinen Zugang zu aktivieren und loszulegen.</p>`,
        'Einladung annehmen',
        inviteUrl,
      );
      return { subject, html };
    }
    case 'confirmation': {
      const topic = data.topic || 'deine Anfrage';
      const subject = `Bestätigung: ${topic}`;
      const html = layout(
        'Wir haben deine Anfrage erhalten',
        `<p>Hallo ${recipient},</p>
         <p>vielen Dank — wir haben <strong>${topic}</strong> erfolgreich erhalten und bestätigen den Eingang.</p>
         <p>Du hörst innerhalb von 24 Stunden von uns. Bei dringenden Anliegen antworte einfach direkt auf diese E-Mail.</p>`,
      );
      return { subject, html };
    }
    case 'reminder': {
      const event = data.event || 'deinen Termin';
      const when = data.when || 'in Kürze';
      const url = data.url || BRAND.url;
      const subject = `Erinnerung: ${event} – ${when}`;
      const html = layout(
        `Erinnerung an ${event}`,
        `<p>Hallo ${recipient},</p>
         <p>kurze Erinnerung: <strong>${event}</strong> findet <strong>${when}</strong> statt.</p>
         <p>Bitte stelle sicher, dass du rechtzeitig bereit bist. Alle Details findest du über den Button unten.</p>`,
        'Details ansehen',
        url,
      );
      return { subject, html };
    }
  }
}

function encodeRaw({ to, cc, bcc, fromName, subject, html }: {
  to: string; cc?: string; bcc?: string; fromName?: string; subject: string; html: string;
}) {
  const headers = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : null,
    bcc ? `Bcc: ${bcc}` : null,
    fromName ? `From: ${fromName}` : null,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    html,
  ].filter(Boolean).join('\r\n');

  // base64url encode (handle UTF-8 safely)
  const bytes = new TextEncoder().encode(headers);
  let bin = '';
  bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_MAIL_API_KEY = Deno.env.get('GOOGLE_MAIL_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!GOOGLE_MAIL_API_KEY) throw new Error('GOOGLE_MAIL_API_KEY is not configured');

    // Auth: require a logged-in caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as SendRequest;
    if (!body?.template || !body?.to) {
      return new Response(JSON.stringify({ error: 'template and to are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!['invitation', 'confirmation', 'reminder'].includes(body.template)) {
      return new Response(JSON.stringify({ error: 'invalid template' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { subject, html } = buildTemplate(body.template, body.data || {});
    const raw = encodeRaw({
      to: body.to, cc: body.cc, bcc: body.bcc,
      fromName: body.from_name, subject, html,
    });

    const response = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GOOGLE_MAIL_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Gmail API failed [${response.status}]: ${JSON.stringify(result)}`);
    }

    return new Response(
      JSON.stringify({ success: true, message_id: result.id, template: body.template, subject }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('send-gmail error:', message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
