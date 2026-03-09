/**
 * Sales Guide AI – Structogram-based dynamic coaching hints.
 * Runs 100% client-side, no API calls needed.
 */

import type { StructogramQuickType } from '@/types/offers';

export type StructogramType = 'rot' | 'gruen' | 'blau' | 'mixed' | 'unknown';

// ============================================
// Structogram-based phase coaching
// ============================================

interface PhaseCoaching {
  greeting: string;
  tips: string[];
  avoidPhrases: string[];
  closingStyle: string;
}

const COACHING: Record<Exclude<StructogramType, 'mixed' | 'unknown'>, Record<string, PhaseCoaching>> = {
  rot: {
    rapport: {
      greeting: 'Kurz und direkt. Keine langen Small-Talk-Phasen.',
      tips: [
        'Sofort zum Punkt kommen – "Ich zeige Ihnen, wie Sie X erreichen."',
        'Ergebnisse und ROI in den ersten 30 Sekunden nennen.',
        'Fragen Sie nach ihrem größten Engpass, nicht nach Befindlichkeiten.',
      ],
      avoidPhrases: ['Erzählen Sie mal ein wenig über sich...', 'Wie geht es Ihnen heute?'],
      closingStyle: 'Direkte Abschlussfrage: "Starten wir?"',
    },
    discovery: {
      greeting: 'Fokus auf messbare Probleme und Geschwindigkeit.',
      tips: [
        '"Was kostet Sie dieses Problem jeden Monat in Euro?"',
        '"Wann muss das gelöst sein?"',
        'Zahlen und Fakten sammeln, keine Emotionen.',
      ],
      avoidPhrases: ['Wie fühlen Sie sich dabei?'],
      closingStyle: 'Schnelle Zusammenfassung der Fakten.',
    },
    presentation: {
      greeting: 'Ergebnis-orientiert präsentieren.',
      tips: [
        'ROI-Rechnung zeigen: Investition vs. Einsparung.',
        'Case Study mit harten Zahlen.',
        'Zeitersparnis in Stunden pro Woche quantifizieren.',
      ],
      avoidPhrases: ['Lassen Sie mich alles erklären...'],
      closingStyle: '"Mit diesem System sparen Sie X€/Monat. Starten wir."',
    },
    closing: {
      greeting: 'Schnell und entschlossen.',
      tips: [
        'Direkter Abschluss: "Sollen wir das jetzt aufsetzen?"',
        'Bei Preis-Einwand: "Was kostet es Sie, NICHT zu handeln?"',
        'Entscheidungsfrist setzen: "Dieses Angebot gilt 48 Stunden."',
      ],
      avoidPhrases: ['Nehmen Sie sich ruhig Zeit...', 'Schlafen Sie mal drüber.'],
      closingStyle: 'Trial-Close: "Wann können wir starten – Montag oder Mittwoch?"',
    },
  },
  gruen: {
    rapport: {
      greeting: 'Persönlich und warmherzig. Vertrauen aufbauen.',
      tips: [
        'Nach Familie, Team oder persönlicher Motivation fragen.',
        'Eigene Geschichte teilen – Authentizität zeigen.',
        'Sicherheit vermitteln: "Sie sind in guten Händen."',
      ],
      avoidPhrases: ['Lassen Sie uns direkt ins Geschäft kommen.'],
      closingStyle: 'Fragen Sie: "Fühlt sich das richtig an für Sie?"',
    },
    discovery: {
      greeting: 'Einfühlsam nach Herausforderungen fragen.',
      tips: [
        '"Was belastet Sie dabei am meisten?"',
        '"Wie wirkt sich das auf Ihr Team/Ihre Familie aus?"',
        'Aktiv zuhören, paraphrasieren, Verständnis zeigen.',
      ],
      avoidPhrases: ['Das ist ja kein großes Problem.'],
      closingStyle: 'Zusammenfassung mit Empathie: "Ich verstehe, dass..."',
    },
    presentation: {
      greeting: 'Sicherheit und Vertrauen betonen.',
      tips: [
        'Testimonials von ähnlichen Kunden zeigen.',
        'Schritt-für-Schritt erklären, was passiert.',
        'Garantie und Risiko-Freiheit hervorheben.',
      ],
      avoidPhrases: ['Das müssen Sie schnell entscheiden.'],
      closingStyle: '"Wir gehen das Schritt für Schritt gemeinsam an."',
    },
    closing: {
      greeting: 'Kein Druck, persönliche Begleitung betonen.',
      tips: [
        '"Ich bin die nächsten 8 Wochen persönlich für Sie da."',
        'Bestätigung einholen: "Was wäre für Sie der wichtigste erste Schritt?"',
        'Bei Unsicherheit: "Was bräuchten Sie, um sich sicher zu fühlen?"',
      ],
      avoidPhrases: ['Dieses Angebot gilt nur heute.'],
      closingStyle: '"Sollen wir gemeinsam den ersten Schritt machen?"',
    },
  },
  blau: {
    rapport: {
      greeting: 'Sachlich, strukturiert, kompetent.',
      tips: [
        'Agenda für das Gespräch vorstellen.',
        'Eigene Qualifikation/Expertise kurz darstellen.',
        'Fragen nach aktuellen Prozessen und Systemen.',
      ],
      avoidPhrases: ['Vertrauen Sie mir einfach.'],
      closingStyle: 'Strukturierter Überblick über nächste Schritte.',
    },
    discovery: {
      greeting: 'Daten und Prozesse erfassen.',
      tips: [
        '"Welche Systeme setzen Sie aktuell ein?"',
        '"Wo sehen Sie den größten Effizienz-Verlust?"',
        'Checkliste durchgehen, KPIs abfragen.',
      ],
      avoidPhrases: ['Wie fühlt sich das an?'],
      closingStyle: 'Tabellarische Zusammenfassung der Ist-Situation.',
    },
    presentation: {
      greeting: 'Detailliert und datenbasiert.',
      tips: [
        'ROI-Tabelle mit Vorher/Nachher-Vergleich.',
        'Technische Details erklären (Tools, Integrationen).',
        'Vergleichstabelle: Ihr Status Quo vs. unsere Lösung.',
      ],
      avoidPhrases: ['Einfach machen und schauen.'],
      closingStyle: '"Basierend auf Ihren Zahlen ergibt sich ein ROI von X%."',
    },
    closing: {
      greeting: 'Logisch argumentieren, Zeit zum Prüfen geben.',
      tips: [
        'Zusammenfassung aller Daten und Fakten.',
        'FAQ-Dokument anbieten.',
        'Bei Einwänden: detaillierte Gegenargumente mit Belegen.',
      ],
      avoidPhrases: ['Einfach Ihr Bauchgefühl nutzen.'],
      closingStyle: '"Möchten Sie die Detailübersicht als PDF?"',
    },
  },
};

const DEFAULT_PHASE_COACHING: PhaseCoaching = {
  greeting: 'Passen Sie Ihre Ansprache an den Gesprächspartner an.',
  tips: ['Hören Sie aktiv zu.', 'Stellen Sie offene Fragen.', 'Notieren Sie Pain Points.'],
  avoidPhrases: [],
  closingStyle: 'Fragen Sie nach dem nächsten Schritt.',
};

export function getPhaseCoaching(
  structogramType: StructogramType | null | undefined,
  phaseId: string
): PhaseCoaching {
  if (!structogramType || structogramType === 'mixed' || structogramType === 'unknown') {
    return DEFAULT_PHASE_COACHING;
  }
  return COACHING[structogramType]?.[phaseId] || DEFAULT_PHASE_COACHING;
}

// ============================================
// Recommended offer mode based on discovery
// ============================================

export function suggestOfferMode(painPointCount: number, avgSeverity: number, hasTeam: string): string {
  if (painPointCount >= 4 && avgSeverity <= 4) return 'rocket_performance';
  if (painPointCount >= 2 || avgSeverity <= 5) return 'performance';
  return 'performance';
}

// ============================================
// AI Suggestions based on notes
// ============================================

export interface AiSuggestion {
  type: 'tip' | 'warning' | 'opportunity';
  text: string;
}

const KEYWORD_SUGGESTIONS: { keywords: string[]; suggestion: AiSuggestion }[] = [
  {
    keywords: ['budget', 'teuer', 'preis', 'kosten', 'geld'],
    suggestion: { type: 'warning', text: 'Preis-Sensitivität erkannt → ROI-Rechnung vorbereiten.' },
  },
  {
    keywords: ['zeit', 'keine zeit', 'später', 'nächstes jahr'],
    suggestion: { type: 'warning', text: 'Zeitlicher Einwand → Kosten des Nicht-Handelns aufzeigen.' },
  },
  {
    keywords: ['team', 'mitarbeiter', 'kollegen'],
    suggestion: { type: 'opportunity', text: 'Team-Thema → Upsell auf Growth/Premium mit Teamlizenzen.' },
  },
  {
    keywords: ['automatisierung', 'automatisieren', 'workflow'],
    suggestion: { type: 'tip', text: 'Automatisierungs-Interesse → Make.com/Zapier Use-Cases zeigen.' },
  },
  {
    keywords: ['content', 'social media', 'marketing'],
    suggestion: { type: 'tip', text: 'Content-Bedarf → KI-Content-Modul hervorheben.' },
  },
  {
    keywords: ['konkurrenz', 'wettbewerb', 'markt'],
    suggestion: { type: 'opportunity', text: 'Wettbewerbsdruck → Dringlichkeit betonen, First-Mover-Vorteil.' },
  },
];

export function analyzeNotes(allNotes: string): AiSuggestion[] {
  const lower = allNotes.toLowerCase();
  const matched: AiSuggestion[] = [];

  for (const entry of KEYWORD_SUGGESTIONS) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      matched.push(entry.suggestion);
    }
  }

  return matched;
}
