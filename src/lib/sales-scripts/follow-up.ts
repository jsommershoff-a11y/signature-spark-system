/**
 * Follow-up E-Mail Vorlagen (Single Source of Truth)
 *
 * Wird aktuell von der PipelineCard nach Terminbuchung verwendet.
 * Sales/Marketing kann Texte hier pflegen, ohne UI-Komponenten zu touchen.
 *
 * Platzhalter (alle optional, leere Werte werden sauber gerendert):
 *   {{greeting_name}} – Vorname oder Fallback (Vor+Nachname)
 *   {{when}}          – Termin-Zeitpunkt (deutsch formatiert)
 *   {{company}}       – Firma des Leads (oder leer)
 *   {{stage_label}}   – Aktuelle Pipeline-Phase
 *   {{context_line}}  – Vorgerenderte Kontext-Zeile (Firma + Phase)
 */

export type FollowUpTemplateId = 'confirm' | 'reschedule' | 'no_show';

export interface FollowUpTemplate {
  id: FollowUpTemplateId;
  label: string;
  description: string;
  /** Betreff, Platzhalter werden ersetzt. */
  subject: string;
  /** Body als Array von Zeilen (wird mit '\n' gejoint). */
  body: string[];
}

export const FOLLOW_UP_TEMPLATES: FollowUpTemplate[] = [
  {
    id: 'confirm',
    label: 'Bestätigung',
    description: 'Termin bestätigen & Agenda teilen',
    subject: 'Bestätigung & nächste Schritte – {{when}}',
    body: [
      'Hallo {{greeting_name}},',
      '',
      'vielen Dank für die Zusage zu unserem Termin am {{when}}.',
      '',
      'Damit wir die Zeit optimal nutzen, hier kurz, was dich erwartet:',
      '• Kurze Bestandsaufnahme deiner aktuellen Situation',
      '• Konkrete nächste Schritte für deinen Engpass',
      '• Klare Empfehlung, ob & wie wir zusammenarbeiten',
      '',
      '{{context_line}}',
      '',
      'Falls sich etwas ändert, gib mir bitte kurz Bescheid.',
      '',
      'Beste Grüße',
    ],
  },
  {
    id: 'reschedule',
    label: 'Reschedule',
    description: 'Höflich neuen Termin vorschlagen',
    subject: 'Neuer Termin statt {{when}}?',
    body: [
      'Hallo {{greeting_name}},',
      '',
      'bei mir ist kurzfristig etwas dazwischengekommen – ich muss unseren Termin am {{when}} leider verschieben.',
      '',
      'Drei Alternativen, die bei mir passen würden:',
      '• Vorschlag 1: ___',
      '• Vorschlag 2: ___',
      '• Vorschlag 3: ___',
      '',
      'Sag mir kurz, was bei dir am besten passt – oder schick mir gern selbst zwei Slots.',
      '',
      '{{context_line}}',
      '',
      'Danke dir & beste Grüße',
    ],
  },
  {
    id: 'no_show',
    label: 'Absage-Folgefrage',
    description: 'Nach No-Show / Absage nachfassen',
    subject: 'Schade, dass es am {{when}} nicht geklappt hat',
    body: [
      'Hallo {{greeting_name}},',
      '',
      'wir hatten {{when}} einen Termin – leider konnten wir nicht sprechen.',
      '',
      'Kurz & ehrlich: Ist das Thema bei dir aktuell noch relevant?',
      '• Ja → ich schick dir gern zwei neue Slots',
      '• Gerade nicht → kein Problem, dann lassen wir es ruhen',
      '• Passt nicht mehr → kurzes „nein danke" reicht völlig',
      '',
      '{{context_line}}',
      '',
      'Beste Grüße',
    ],
  },
];

export interface FollowUpContext {
  greetingName: string;
  when: string;
  company?: string | null;
  stageLabel: string;
}

/** Ersetzt Platzhalter in einem String – unbekannte bleiben unverändert. */
function applyPlaceholders(input: string, vars: Record<string, string>): string {
  return input.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (_match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : '',
  );
}

/**
 * Liefert subject + body für ein Template – mit eingesetzten Platzhaltern.
 */
export function renderFollowUpTemplate(
  templateId: FollowUpTemplateId,
  ctx: FollowUpContext,
): { template: FollowUpTemplate; subject: string; body: string } {
  const template =
    FOLLOW_UP_TEMPLATES.find((t) => t.id === templateId) ?? FOLLOW_UP_TEMPLATES[0];

  const contextLine = ctx.company
    ? `Kontext: ${ctx.company} – Phase: ${ctx.stageLabel}`
    : `Phase: ${ctx.stageLabel}`;

  const vars: Record<string, string> = {
    greeting_name: ctx.greetingName,
    when: ctx.when,
    company: ctx.company ?? '',
    stage_label: ctx.stageLabel,
    context_line: contextLine,
  };

  const subject = applyPlaceholders(template.subject, vars);
  const body = template.body.map((line) => applyPlaceholders(line, vars)).join('\n');

  return { template, subject, body };
}
