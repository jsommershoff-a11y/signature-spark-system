import type { OutreachTemplate } from './types';

export const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'outreach_warm_dm',
    name: 'Warm DM (LinkedIn/WhatsApp)',
    channel: 'DM',
    body: `Hey [Name], ich habe gesehen, dass du [Branche/Tätigkeit] machst.

Kurze Frage: Wie viele Stunden pro Woche verbringst du mit Dingen, die eigentlich ein System machen sollte?

Ich arbeite mit Unternehmern wie dir – wir bauen einfache Automatisierungen, die sofort entlasten.

Wenn das spannend klingt: Ich hab eine kostenlose Analyse, die dir in 2 Minuten zeigt, wo du Zeit verlierst.

Interesse?`,
  },
  {
    id: 'outreach_lead_magnet',
    name: 'Nach Lead-Magnet Download',
    channel: 'E-Mail',
    subject: 'Dein Ergebnis steht – und jetzt?',
    body: `Hey [Name],

du hast gerade die Prozess-Analyse gemacht. Dein Ergebnis: ca. [X] Stunden pro Woche verschwendet.

Das sind [Y] € pro Monat – oder [Z] € im Jahr.

Die gute Nachricht: Genau diese Prozesse setzen wir innerhalb von 14 Tagen für dich auf.

Sollen wir in 15 Minuten besprechen, wie das bei dir konkret aussehen würde?

→ [Termin-Link]

Beste Grüße
Jan`,
  },
  {
    id: 'outreach_cold_dm',
    name: 'Kalt-DM an Unbekannte',
    channel: 'DM',
    body: `Hey [Name],

ich sehe, du leitest [Unternehmen]. Kurze ehrliche Frage:

Steckst du mehr Zeit in dein Unternehmen rein, als rauskommt?

Ich baue für Unternehmer einfache Systeme, die operative Zeit sofort zurückgeben. Kein Coaching, kein Kurs – direkte Umsetzung.

Wenn das relevant ist: Ich schick dir gern eine 2-Minuten-Analyse, die zeigt, wo bei dir Zeit liegen bleibt.

Kein Spam, kein Funnel. Nur Klarheit.`,
  },
  {
    id: 'outreach_followup',
    name: 'Follow-up nach 48h',
    channel: 'DM',
    body: `Hey [Name],

ich hatte dir vor 2 Tagen geschrieben. Keine Antwort ist auch eine Antwort – aber oft geht sowas einfach unter.

Kurze Frage: Ist das Thema operative Entlastung gerade relevant für dich?

Wenn ja: 15 Minuten. Kein Pitch, nur Analyse.
Wenn nein: Alles gut, ich melde mich nicht nochmal.

Was sagst du?`,
  },
  {
    id: 'outreach_post_cold_call',
    name: 'E-Mail nach Kaltanruf',
    channel: 'E-Mail',
    subject: 'Unser kurzes Gespräch eben',
    body: `Hey [Name],

danke für die 2 Minuten eben am Telefon.

Wie besprochen: Wir bauen für Unternehmer wie dich einfache Systeme, die operative Zeit zurückgeben.

Hier ist der Link zur kostenlosen Analyse: [Link]
Und hier kannst du dir 15 Minuten buchen: [Termin-Link]

Kein Druck, kein Follow-up-Marathon. Wenn es passt, passt es.

Beste Grüße
Jan`,
  },
];
