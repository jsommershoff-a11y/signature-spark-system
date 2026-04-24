// Generic event webhook → triggers branded Gmail notifications.
// Auth model: HMAC-SHA256 signature OR shared secret header.
//
// Headers:
//   X-Webhook-Signature: hex(hmac_sha256(GMAIL_WEBHOOK_SECRET, rawBody))   (preferred)
//   X-Webhook-Secret:    GMAIL_WEBHOOK_SECRET                              (fallback)
//
// Body:
//   {
//     "event": "lead.created" | "offer.accepted" | "payment.received"
//            | "call.scheduled" | "task.assigned" | "custom",
//     "to": "user@example.com",
//     "cc"?: string,
//     "bcc"?: string,
//     "data"?: { ...template variables },
//     "template_override"?: "invitation" | "confirmation" | "reminder"
//   }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-secret',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1';

const BRAND = {
  name: 'KI-Automationen',
  primary: '#F6711F',
  accent: '#0F6B4A',
  url: 'https://ki-automationen.io',
};

type Template = 'invitation' | 'confirmation' | 'notification' | 'reminder';

// Map event types → template + sensible default data merger
const EVENT_MAP: Record<
  string,
  { template: Template; build: (d: Record<string, string>) => Record<string, string> }
> = {
  'lead.created': {
    template: 'confirmation',
    build: (d) => ({ name: d.name || 'dort', topic: d.topic || 'deine Anfrage bei KI-Automationen' }),
  },
  'offer.accepted': {
    template: 'confirmation',
    build: (d) => ({ name: d.name || 'dort', topic: d.topic || `Annahme deines Angebots ${d.offer_id ? `#${d.offer_id}` : ''}`.trim() }),
  },
  'payment.received': {
    template: 'confirmation',
    build: (d) => ({ name: d.name || 'dort', topic: d.topic || `Zahlungseingang ${d.amount ? `(${d.amount})` : ''}`.trim() }),
  },
  'call.scheduled': {
    template: 'reminder',
    build: (d) => ({
      name: d.name || 'dort',
      event: d.event || 'dein Strategie-Call',
      when: d.when || 'in Kürze',
      url: d.url || `${BRAND.url}/app/live-calls`,
    }),
  },
  'task.assigned': {
    template: 'notification',
    build: (d) => ({
      name: d.name || 'dort',
      headline: d.headline || `Neue Aufgabe: ${d.title || 'Aufgabe'}`,
      message: d.message || (d.due_at ? `Fällig bis <strong>${d.due_at}</strong>.` : 'Bitte zeitnah erledigen.'),
      url: d.url || `${BRAND.url}/app/tasks`,
      cta: d.cta || 'Aufgabe öffnen',
    }),
  },
  'member.invited': {
    template: 'invitation',
    build: (d) => ({
      name: d.name || 'dort',
      inviter: d.inviter || `Das ${BRAND.name} Team`,
      invite_url: d.invite_url || `${BRAND.url}/auth`,
    }),
  },
  'notification.generic': {
    template: 'notification',
    build: (d) => ({
      name: d.name || 'dort',
      headline: d.headline || 'Neue Benachrichtigung',
      message: d.message || '',
      url: d.url || BRAND.url,
      cta: d.cta || 'Im System öffnen',
    }),
  },
};

function layout(title: string, body: string, ctaLabel?: string, ctaUrl?: string) {
  const cta =
    ctaLabel && ctaUrl
      ? `<p style="text-align:center;margin:32px 0;"><a href="${ctaUrl}" style="background:${BRAND.accent};color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;display:inline-block;">${ctaLabel}</a></p>`
      : '';
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
            <p style="margin:0;">© ${new Date().getFullYear()} ${BRAND.name} · <a href="${BRAND.url}" style="color:#64748b;">${BRAND.url.replace('https://', '')}</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function buildTemplate(name: Template, data: Record<string, string>) {
  const recipient = data.name || 'dort';
  switch (name) {
    case 'invitation': {
      const inviter = data.inviter || `Das ${BRAND.name} Team`;
      const inviteUrl = data.invite_url || `${BRAND.url}/auth`;
      return {
        subject: `${inviter} hat dich zu ${BRAND.name} eingeladen`,
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
          `<p>Hallo ${recipient},</p><p>vielen Dank — wir haben <strong>${topic}</strong> erhalten und bestätigen den Eingang.</p><p>Du hörst zeitnah von uns.</p>`,
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
          `<p>Hallo ${recipient},</p><p>kurze Erinnerung: <strong>${event}</strong> – <strong>${when}</strong>.</p>`,
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

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const SUPABASE_URL_ENV = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const logId = crypto.randomUUID();
  const logEmail = async (status: string, fields: Record<string, unknown>) => {
    if (!SUPABASE_URL_ENV || !SERVICE_ROLE) return;
    try {
      await fetch(`${SUPABASE_URL_ENV}/rest/v1/email_send_log`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE,
          'Authorization': `Bearer ${SERVICE_ROLE}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ message_id: logId, status, ...fields }),
      });
    } catch (e) {
      console.error('email_send_log insert failed:', e);
    }
  };
  let logTo = '';
  let logTemplate = '';
  let logSubject: string | undefined;
  let logEvent: string | undefined;

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_MAIL_API_KEY = Deno.env.get('GOOGLE_MAIL_API_KEY');
    const WEBHOOK_SECRET = Deno.env.get('GMAIL_WEBHOOK_SECRET');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!GOOGLE_MAIL_API_KEY) throw new Error('GOOGLE_MAIL_API_KEY is not configured');
    if (!WEBHOOK_SECRET) throw new Error('GMAIL_WEBHOOK_SECRET is not configured');

    // Read raw body once for HMAC verification
    const rawBody = await req.text();

    // Verify: prefer HMAC signature, fall back to shared secret header
    const sigHeader = req.headers.get('x-webhook-signature');
    const secretHeader = req.headers.get('x-webhook-secret');
    let verified = false;
    if (sigHeader) {
      const expected = await hmacHex(WEBHOOK_SECRET, rawBody);
      verified = timingSafeEqual(sigHeader.toLowerCase(), expected);
    } else if (secretHeader) {
      verified = timingSafeEqual(secretHeader, WEBHOOK_SECRET);
    }
    if (!verified) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { event, to, cc, bcc, data = {}, template_override } = payload || {};
    if (!event || typeof event !== 'string') {
      return new Response(JSON.stringify({ error: 'event is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!to || typeof to !== 'string' || !/^\S+@\S+\.\S+$/.test(to)) {
      return new Response(JSON.stringify({ error: 'valid "to" email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mapping = EVENT_MAP[event];
    const template: Template =
      (template_override as Template) ||
      mapping?.template ||
      'confirmation';
    if (!['invitation', 'confirmation', 'notification', 'reminder'].includes(template)) {
      return new Response(JSON.stringify({ error: 'invalid template' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const merged = mapping ? mapping.build(data) : { name: data.name || 'dort', topic: data.topic || event };
    const { subject, html } = buildTemplate(template, merged);
    const raw = encodeRaw({ to, cc, bcc, subject, html });
    logTo = to; logTemplate = template; logSubject = subject; logEvent = event;

    await logEmail('pending', {
      template_name: template,
      recipient_email: to,
      subject,
      metadata: { event, cc, bcc, source: 'webhook' },
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

    console.log(`gmail-event-webhook: event=${event} template=${template} to=${to} message_id=${result.id}`);

    await logEmail('sent', {
      template_name: template,
      recipient_email: to,
      subject,
      metadata: { event, gmail_message_id: result.id, source: 'webhook' },
    });

    return new Response(
      JSON.stringify({ success: true, event, template, message_id: result.id, subject }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('gmail-event-webhook error:', message);
    await logEmail('failed', {
      template_name: logTemplate || null,
      recipient_email: logTo || 'unknown',
      subject: logSubject,
      error_message: message,
      metadata: { event: logEvent, source: 'webhook' },
    });
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
