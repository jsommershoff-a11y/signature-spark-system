// Shared confirmation email template for support tickets.
// Renders subject + HTML + plain-text body with placeholder substitution.
// Used by support-request (initial confirmation) and can be re-used for
// any ticket-confirmation use case (re-open, escalation, etc.).

export type ConfirmationVars = {
  recipientName?: string | null;     // {{name}}
  recipientEmail: string;            // {{email}}
  ticketRef: string;                 // {{ticket_ref}}, e.g. "#A1B2C3D4"
  ticketId?: string | null;          // {{ticket_id}}
  subject?: string | null;           // {{subject}}
  message: string;                   // {{message}} (verbatim, escaped)
  replyToAddress: string;            // {{reply_to}}
  brandName?: string;                // {{brand_name}} (default "KRS Signature")
  supportEmail?: string;             // {{support_email}} (default "info@krs-signature.de")
  responseSlaHours?: number;         // {{sla_hours}} (default 24)
  primaryColor?: string;             // hex incl. # (default brand orange)
  pageUrl?: string | null;
};

const DEFAULTS = {
  brandName: "KRS Signature",
  supportEmail: "info@krs-signature.de",
  responseSlaHours: 24,
  primaryColor: "#f97316",
  accentBg: "#FFF3EB",
  accentBorder: "#0F3E2E",
  textMuted: "#6b7280",
  textBody: "#374151",
};

export const escapeHtml = (s: string) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export function renderConfirmationSubject(v: ConfirmationVars): string {
  const brand = v.brandName ?? DEFAULTS.brandName;
  return `Wir haben deine Anfrage erhalten – Ticket ${v.ticketRef} · ${brand}`;
}

export function renderConfirmationText(v: ConfirmationVars): string {
  const brand = v.brandName ?? DEFAULTS.brandName;
  const sla = v.responseSlaHours ?? DEFAULTS.responseSlaHours;
  const support = v.supportEmail ?? DEFAULTS.supportEmail;
  const greet = v.recipientName ? `Hallo ${v.recipientName},` : "Hallo,";
  return [
    greet,
    ``,
    `vielen Dank für deine Nachricht. Dein Support-Ticket ${v.ticketRef} wurde angelegt.`,
    `Wir melden uns innerhalb von ${sla} Stunden (Werktagen) bei dir unter ${v.recipientEmail}.`,
    ``,
    `--- Deine Nachricht ---`,
    v.message,
    ``,
    `Du kannst auf diese Mail einfach antworten – deine Antwort wird automatisch dem Ticket zugeordnet.`,
    `Antwort-Adresse: ${v.replyToAddress}`,
    ``,
    `Viele Grüße`,
    `Dein ${brand} Team`,
    `${support}`,
    `Ticket ${v.ticketRef}${v.ticketId ? ` (ID: ${v.ticketId})` : ""}`,
  ].join("\n");
}

export function renderConfirmationHtml(v: ConfirmationVars): string {
  const brand = escapeHtml(v.brandName ?? DEFAULTS.brandName);
  const support = escapeHtml(v.supportEmail ?? DEFAULTS.supportEmail);
  const sla = v.responseSlaHours ?? DEFAULTS.responseSlaHours;
  const primary = v.primaryColor ?? DEFAULTS.primaryColor;
  const ticketRef = escapeHtml(v.ticketRef);
  const recipientName = escapeHtml(v.recipientName ?? "");
  const recipientEmail = escapeHtml(v.recipientEmail);
  const message = escapeHtml(v.message).replace(/\n/g, "<br/>");
  const subject = escapeHtml(v.subject ?? "");
  const replyTo = escapeHtml(v.replyToAddress);
  const ticketId = escapeHtml(v.ticketId ?? "");

  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Ticket ${ticketRef}</title></head>
<body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:${DEFAULTS.textBody}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)">
        <!-- Header -->
        <tr><td style="background:${primary};padding:20px 28px;color:#ffffff">
          <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.85">${brand} Support</div>
          <div style="font-size:22px;font-weight:700;margin-top:4px">Wir haben deine Anfrage erhalten ✅</div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:24px 28px">
          <p style="margin:0 0 12px;font-size:15px">Hallo ${recipientName || "und vielen Dank,"}${recipientName ? "," : ""}</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.55">
            dein Support-Ticket
            <strong style="color:${primary}">${ticketRef}</strong>
            wurde erfolgreich angelegt. Unser Team meldet sich innerhalb von
            <strong>${sla} Stunden</strong> an Werktagen bei dir unter
            <strong>${recipientEmail}</strong>.
          </p>

          ${subject ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px">
            <tr><td style="font-size:12px;color:${DEFAULTS.textMuted};text-transform:uppercase;letter-spacing:.06em;padding-bottom:4px">Betreff</td></tr>
            <tr><td style="font-size:14px;color:${DEFAULTS.textBody}">${subject}</td></tr>
          </table>` : ""}

          <div style="background:${DEFAULTS.accentBg};border-left:4px solid ${primary};padding:14px 16px;border-radius:6px;margin:16px 0">
            <div style="font-size:12px;color:${DEFAULTS.textMuted};text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Deine Nachricht</div>
            <div style="font-size:14px;color:${DEFAULTS.textBody};white-space:pre-wrap;line-height:1.55">${message}</div>
          </div>

          <p style="margin:16px 0 0;font-size:13px;color:${DEFAULTS.textMuted};line-height:1.5">
            💬 Du kannst auf diese Mail einfach antworten – deine Antwort wird automatisch
            dem Ticket zugeordnet (über die Adresse <code style="background:#f3f4f6;padding:1px 4px;border-radius:3px">${replyTo}</code>).
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="border-top:1px solid #e5e7eb;padding:16px 28px;background:#fafafa">
          <p style="margin:0;font-size:12px;color:${DEFAULTS.textMuted};line-height:1.6">
            ${brand} · <a href="mailto:${support}" style="color:${DEFAULTS.textMuted}">${support}</a><br/>
            Ticket-Referenz: <strong>${ticketRef}</strong>${ticketId ? ` &nbsp;·&nbsp; ID: ${ticketId}` : ""}
          </p>
        </td></tr>
      </table>
      <p style="margin:12px 0 0;font-size:11px;color:#9ca3af">
        Diese Mail ist eine automatische Bestätigung — bitte antworte direkt darauf, wenn du Fragen hast.
      </p>
    </td></tr>
  </table>
</body></html>`;
}

export function renderConfirmation(v: ConfirmationVars) {
  return {
    subject: renderConfirmationSubject(v),
    html: renderConfirmationHtml(v),
    text: renderConfirmationText(v),
  };
}
