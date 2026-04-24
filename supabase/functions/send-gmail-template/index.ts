// In-app authenticated sender for branded Gmail templates.
// Templates: "confirmation" | "notification" | "reminder" | "invitation"
//
// Body:
//   {
//     "template": "confirmation" | "notification" | "reminder" | "invitation",
//     "to": "user@example.com",
//     "cc"?: string,
//     "bcc"?: string,
//     "data"?: Record<string, string>,
//     "subject_override"?: string
//   }

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

type Template = 'invitation' | 'confirmation' | 'notification' | 'reminder';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(title: string, body: string, ctaLabel?: string, ctaUrl?: string) {
  const cta =
    ctaLabel && ctaUrl
      ? `<p style="text-align:center;margin:32px 0;"><a href="${ctaUrl}" style="background:${BRAND.accent};color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;display:inline-block;">${escapeHtml(ctaLabel)}</a></p>`
      : '';
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr><td style="background:${BRAND.primary};padding:24px 32px;">
            <h1 style="color:#fff;margin:0;font-size:18px;letter-spacing:0.5px;">${BRAND.name}</h1>
          </td></tr>
          <tr><td style="padding:32px;">
            <h2 style="margin:0 0 16px;font-size:22px;color:${BRAND.primary};">${escapeHtml(title)}</h2>
            <div style="font-size:15px;line-height:1.6;color:#334155;">${body}</div>
            ${cta}
          </td></tr>
          <tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;text-align:center;">
            <p style="margin:0;">© ${new Date().getFullYear()} ${BRAND.name} · <a href="${BRAND.url}" style="color:#64748b;">${BRAND.url.replace('https://', '')}</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function buildTemplate(name: Template, data: Record<string, string>) {
  const recipient = escapeHtml(data.name || 'dort');
  switch (name) {
    case 'invitation': {
      const inviter = escapeHtml(data.inviter || `Das ${BRAND.name} Team`);
      const inviteUrl = data.invite_url || `${BRAND.url}/auth`;
      return {
        subject: `${data.inviter || `Das ${BRAND.name} Team`} hat dich zu ${BRAND.name} eingeladen`,
        html: layout(
          `Willkommen bei ${BRAND.name}`,
          `<p>Hallo ${recipient},</p><p><strong>${inviter}</strong> hat dich eingeladen, dem ${BRAND.name} Business Operating System beizutreten.</p>`,
          'Einladung annehmen',
          inviteUrl,
        ),
      };
    }
    case 'confirmation': {
      const topic = data.topic || 'deine Anfrage';
      return {
        subject: `Bestätigung: ${topic}`,
        html: layout(
          'Wir haben deine Anfrage erhalten',
          `<p>Hallo ${recipient},</p><p>vielen Dank — wir haben <strong>${escapeHtml(topic)}</strong> erhalten und bestätigen den Eingang.</p><p>Du hörst zeitnah von uns.</p>`,
        ),
      };
    }
    case 'notification': {
      const headline = data.headline || 'Neue Benachrichtigung';
      const message = data.message || '';
      const url = data.url;
      const cta = data.cta || 'Im System öffnen';
      return {
        subject: headline,
        html: layout(
          headline,
          `<p>Hallo ${recipient},</p>${message ? `<p>${message}</p>` : ''}`,
          url ? cta : undefined,
          url,
        ),
      };
    }
    case 'reminder': {
      const event = data.event || 'deinen Termin';
      const when = data.when || 'in Kürze';
      const url = data.url || BRAND.url;
      return {
        subject: `Erinnerung: ${event} – ${when}`,
        html: layout(
          `Erinnerung an ${event}`,
          `<p>Hallo ${recipient},</p><p>kurze Erinnerung: <strong>${escapeHtml(event)}</strong> – <strong>${escapeHtml(when)}</strong>.</p>`,
          'Details ansehen',
          url,
        ),
      };
    }
  }
}

function encodeRaw({ to, cc, bcc, subject, html }: { to: string; cc?: string; bcc?: string; subject: string; html: string }) {
  const headers = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : null,
    bcc ? `Bcc: ${bcc}` : null,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    html,
  ].filter(Boolean).join('\r\n');
  const bytes = new TextEncoder().encode(headers);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const SUPABASE_URL_ENV = Deno.env.get('SUPABASE_URL');
  const adminClient = SUPABASE_URL_ENV && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL_ENV, SUPABASE_SERVICE_ROLE_KEY)
    : null;
  const logId = crypto.randomUUID();
  const logEmail = async (status: string, fields: Record<string, unknown>) => {
    if (!adminClient) return;
    try {
      await adminClient.from('email_send_log').insert({
        message_id: logId,
        status,
        ...fields,
      });
    } catch (e) {
      console.error('email_send_log insert failed:', e);
    }
  };

  let logTo = '';
  let logTemplate = '';
  let logSubject: string | undefined;

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_MAIL_API_KEY = Deno.env.get('GOOGLE_MAIL_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!GOOGLE_MAIL_API_KEY) throw new Error('GOOGLE_MAIL_API_KEY is not configured');
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase env not configured');

    // Authenticate caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => null);
    const template = body?.template as Template | undefined;
    const to = body?.to as string | undefined;
    const cc = body?.cc as string | undefined;
    const bcc = body?.bcc as string | undefined;
    const data = (body?.data ?? {}) as Record<string, string>;
    const subjectOverride = body?.subject_override as string | undefined;

    if (!template || !['invitation', 'confirmation', 'notification', 'reminder'].includes(template)) {
      return new Response(JSON.stringify({ error: 'invalid template' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!to || !/^\S+@\S+\.\S+$/.test(to)) {
      return new Response(JSON.stringify({ error: 'valid "to" email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const built = buildTemplate(template, data);
    const subject = subjectOverride || built.subject;
    const raw = encodeRaw({ to, cc, bcc, subject, html: built.html });

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

    console.log(`send-gmail-template: user=${user.id} template=${template} to=${to} message_id=${result.id}`);

    return new Response(
      JSON.stringify({ success: true, template, message_id: result.id, subject }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('send-gmail-template error:', message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
