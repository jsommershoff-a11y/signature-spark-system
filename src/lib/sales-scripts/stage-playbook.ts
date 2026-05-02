import { PipelineStage } from '@/types/crm';

export interface StagePlaybookEntry {
  ziel: string;
  fragen: string[];
  hinweis: string;
}

/**
 * Statische Sales-Playbook-Inhalte pro Pipeline-Stage.
 * Quelle: Step-08-Vorgabe (CTO/Vertriebsleitung). Keine Backend-Anbindung.
 */
export const STAGE_PLAYBOOK: Record<PipelineStage, StagePlaybookEntry> = {
  new_lead: {
    ziel: 'Relevanz und Passung prüfen.',
    fragen: [
      'Was ist die Ausgangslage des Unternehmens?',
      'Welcher Prozess kostet aktuell Zeit oder Geld?',
      'Wer entscheidet über die Umsetzung?',
    ],
    hinweis: 'Noch nicht verkaufen, erst qualifizieren.',
  },
  setter_call_scheduled: {
    ziel: 'Erstgespräch professionell vorbereiten.',
    fragen: [
      'Welche Branche und Unternehmensgröße?',
      'Welche bisherigen Kontaktpunkte gab es?',
      'Welches Produktinteresse ist erkennbar?',
    ],
    hinweis: 'Gespräch mit konkreten Hypothesen starten.',
  },
  setter_call_done: {
    ziel: 'Problem und wirtschaftlichen Hebel quantifizieren.',
    fragen: [
      'Wo verlieren Sie aktuell am meisten Zeit?',
      'Was kostet dieser Prozess pro Woche oder Monat?',
      'Was passiert, wenn dieser Prozess so bleibt?',
    ],
    hinweis: 'Nutzen messbar machen, nicht zu früh pitchen.',
  },
  analysis_ready: {
    ziel: 'Aus der Analyse ein konkretes Angebot ableiten.',
    fragen: [
      'Welcher Prozess hat den höchsten ROI?',
      'Welche Lösung ist am einfachsten umsetzbar?',
      'Welche Entlastung entsteht konkret?',
    ],
    hinweis: 'Kosten-Nutzen-Rechnung vorbereiten.',
  },
  offer_draft: {
    ziel: 'Angebot finalisieren.',
    fragen: [
      'Ist der Nutzen klar genug formuliert?',
      'Sind Zahlen, Umsetzung und nächster Schritt eindeutig?',
      'Gibt es Einwände aus dem Gespräch, die beantwortet werden müssen?',
    ],
    hinweis: 'Angebot nicht nur beschreiben, sondern wirtschaftlich begründen.',
  },
  offer_sent: {
    ziel: 'Entscheidung vorbereiten.',
    fragen: [
      'Hat der Kunde das Angebot verstanden?',
      'Welche Fragen oder Einwände sind offen?',
      'Ist ein Zweitgespräch terminiert?',
    ],
    hinweis: 'Follow-up innerhalb von 24–48 Stunden.',
  },
  payment_unlocked: {
    ziel: 'Abschluss herbeiführen.',
    fragen: [
      'Was verhindert aktuell die Entscheidung?',
      'Welche Sicherheit braucht der Kunde noch?',
      'Welche nächste Handlung ist verbindlich?',
    ],
    hinweis: 'Entscheidung klären, nicht endlos nachfassen.',
  },
  won: {
    ziel: 'Onboarding starten und Kundenerfolg sichern.',
    fragen: [
      'Was muss zuerst umgesetzt werden?',
      'Wer ist Ansprechpartner?',
      'Welche Unterlagen fehlen?',
    ],
    hinweis: 'Gewonnen erst nach Zahlung oder Admin-Bestätigung.',
  },
  lost: {
    ziel: 'Verlustgrund lernen.',
    fragen: [
      'Warum wurde nicht gekauft?',
      'War Zielgruppe, Angebot oder Timing falsch?',
      'Welche Marketing- oder Sales-Lektion entsteht daraus?',
    ],
    hinweis: 'Verlustgrund dokumentieren und in Learnings überführen.',
  },
};
