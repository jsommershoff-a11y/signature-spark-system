import type { ScriptPhase } from './types';

export const TRIAGE_SCRIPT: ScriptPhase[] = [
  {
    id: 'triage_opener',
    title: 'Opener',
    duration: '1 Min',
    lines: [
      'Hey [Name], lass uns keine Zeit verlieren. Wir haben 15 Minuten.',
      'Ich will herausfinden, ob und wie ich dir helfen kann.',
      'Wenn ja, planen wir den nächsten Schritt. Wenn nein, sag ich dir das ehrlich. Deal?',
    ],
    psychology: 'Rahmen setzen, Respekt zeigen, Druck rausnehmen.',
  },
  {
    id: 'triage_situation',
    title: 'Situation erfassen',
    duration: '3 Min',
    lines: [
      'Erzähl mir kurz: Was machst du genau und wie lange schon?',
      'Wie viele Leute arbeiten bei dir?',
      'Was war der Hauptgrund, warum du auf meine Nachricht reagiert hast?',
    ],
    psychology: 'Kontext verstehen, ohne zu tief einzusteigen.',
  },
  {
    id: 'triage_pain',
    title: 'Schmerz identifizieren',
    duration: '4 Min',
    lines: [
      'Was ist gerade dein größtes operatives Problem?',
      'Wie viele Stunden pro Woche verbringst du mit Dingen, die eigentlich ein System machen sollte?',
      'Was kostet dich das im Monat? Jeder Tag ohne System kostet dich Umsatz.',
    ],
    psychology: 'Emotionalen Schmerz aktivieren, Konsequenz spürbar machen.',
  },
  {
    id: 'triage_qualify',
    title: 'Budget-Check',
    duration: '2 Min',
    lines: [
      'Bist du der Entscheider?',
      'Wenn wir eine Lösung finden die dir sofort 10-15h/Woche spart – wärst du bereit dafür zu investieren?',
    ],
    psychology: 'Entscheidungsfähigkeit und Bereitschaft prüfen.',
  },
  {
    id: 'triage_bridge',
    title: 'Bridge zum Strategy Call',
    duration: '3 Min',
    lines: [
      'Ich sehe genau wo dein Engpass ist. Das ist exakt das was ich bei René Schreiner gelöst habe.',
      'Ich würde gerne in einem ausführlichen Gespräch (45 Min) genau durchgehen, wo du stehst und was der schnellste Weg ist.',
      'Wann passt dir diese Woche – Dienstag oder Donnerstag?',
    ],
    psychology: 'Case Study als Social Proof + Alternative-Close.',
  },
  {
    id: 'triage_close',
    title: 'Abschluss',
    duration: '2 Min',
    lines: [
      'Ich schicke dir den Link. Bereite dich vor mir deine 3 größten Zeitfresser zu nennen.',
      'Bis dann, [Name].',
    ],
    psychology: 'Commitment sichern, Vorbereitung als Micro-Commitment.',
  },
  {
    id: 'triage_nofit',
    title: 'Kein Fit',
    duration: '2 Min',
    lines: [
      'Ich bin ehrlich: Das ist aktuell nicht der richtige Zeitpunkt/Fit.',
      'Hier ist mein Vorschlag: [Alternative nennen]',
      'Ich melde mich in [Zeitraum] nochmal. Deal?',
    ],
    psychology: 'Ehrlichkeit baut langfristiges Vertrauen auf.',
  },
];

export const STRATEGY_SCRIPT: ScriptPhase[] = [
  {
    id: 'strategy_rapport',
    title: 'Rapport & Rahmen',
    duration: '5 Min',
    lines: [
      'Hey [Name], schön dass du dir die Zeit nimmst.',
      'Wir haben heute 45–60 Minuten. Mein Ziel: Am Ende weißt du genau, ob das hier der richtige Weg für dich ist.',
      'Ich stelle dir ein paar Fragen, wir analysieren deine Situation und dann zeige ich dir, wie wir das lösen.',
    ],
    psychology: 'Erwartungsmanagement, Kontrolle übernehmen.',
  },
  {
    id: 'strategy_deep_dive',
    title: 'Deep Dive Ist-Zustand',
    duration: '10 Min',
    lines: [
      'Gehen wir mal durch: Wie sieht dein typischer Arbeitstag aus?',
      'Wo verlierst du die meiste Zeit?',
      'Wenn du einen Knopf drücken könntest und EINE Sache wäre gelöst – welche?',
      'Wie läuft das aktuell mit Anfragen? Wie viele kommen rein, wie viele gehen verloren?',
    ],
    psychology: 'Konkreten Alltag verstehen, nicht Theorie.',
  },
  {
    id: 'strategy_cost',
    title: 'Kosten des Problems',
    duration: '5 Min',
    lines: [
      'Was kostet dich das im Monat? Rechnen wir mal zusammen:',
      '[X] Stunden pro Woche × Stundensatz = [Y] € pro Monat verschwendet.',
      'Auf 12 Monate: [Z] €. Das ist der Preis des Nicht-Handelns.',
    ],
    psychology: 'ROI greifbar machen, emotionalen Anker setzen.',
  },
  {
    id: 'strategy_vision',
    title: 'Zielbild aufbauen',
    duration: '5 Min',
    lines: [
      'Stell dir vor: CRM qualifiziert Leads automatisch. Follow-ups laufen alleine.',
      'Dein Team arbeitet eigenständig. Du hast 2 Tage pro Woche zurück.',
      'Was würdest du mit dieser Zeit machen?',
    ],
    psychology: 'Future Pacing – emotionales Commitment zum Ergebnis.',
  },
  {
    id: 'strategy_gap',
    title: 'Lücke identifizieren',
    duration: '3 Min',
    lines: [
      'Warum hast du das bisher nicht selbst gebaut?',
      'Was hat dich davon abgehalten, das Problem zu lösen?',
    ],
    psychology: 'Selbsterkenntnis triggern — "Ich schaffe es alleine nicht."',
  },
  {
    id: 'strategy_case_study',
    title: 'Case Study',
    duration: '5 Min',
    lines: [
      'René Schreiner: Unstrukturiert, hoher Aufwand.',
      'Wir: CRM, Portal, Bewerbungsprozess.',
      'Ergebnis: 40+ Bewerbungen pro Monat, komplett automatisiert.',
    ],
    psychology: 'Social Proof mit konkreten Zahlen.',
  },
  {
    id: 'strategy_pitch',
    title: 'Lösung präsentieren',
    duration: '10 Min',
    lines: [
      'Wir bauen das System GEMEINSAM in dein Unternehmen. 30 Tage. Ab Tag 1 Ergebnisse.',
      'Das ist kein Kurs, kein Coaching von der Seitenlinie. Wir setzen mit dir um.',
      'Investment: 10.000 EUR.',
    ],
    psychology: 'Done-with-you positionieren, Preis im Kontext des Problems.',
  },
  {
    id: 'strategy_price',
    title: 'Preis & Investition',
    duration: '5 Min',
    lines: [
      'Verglichen mit [monatlicher Verlust] × 12 Monate = [Jahresverlust] ist das ein klarer Business Case.',
      'Ratenzahlung und Finanzierung sind möglich – Signature Transformation Finanzierung bis zu 250.000 €.',
    ],
    psychology: 'Investition im Kontext des Problems verankern.',
  },
  {
    id: 'strategy_objections',
    title: 'Einwände behandeln',
    duration: '5-10 Min',
    lines: [
      'Was hält dich davon ab, heute zu starten?',
      '[Einwand-Konter aus Objection Handling nutzen]',
      'Die ehrliche Frage: Was passiert, wenn du noch ein Jahr wartest?',
    ],
    psychology: 'Einwände als Kaufsignal behandeln.',
  },
  {
    id: 'strategy_close',
    title: 'Abschluss',
    duration: '5 Min',
    lines: [
      'Ok [Name], ich fasse zusammen: [Problem], [Kosten], [Lösung], [Ergebnis].',
      'Sollen wir das aufsetzen?',
      'Wenn ja: Ich schicke dir jetzt das Angebot, wir starten nächste Woche.',
    ],
    psychology: 'Zusammenfassung + direkte Abschlussfrage.',
  },
];

export const COLD_CALL_SCRIPT: ScriptPhase[] = [
  {
    id: 'cold_opener',
    title: 'Opener',
    duration: '30 Sek',
    lines: [
      'Herr/Frau [Name], Jan Sommershoff hier. Ich sehe dass Ihr Unternehmen wächst. Haben Sie 60 Sekunden?',
    ],
    psychology: 'Micro-Commitment: 60 Sekunden sind keine große Hürde.',
  },
  {
    id: 'cold_hook',
    title: 'Hook',
    duration: '30 Sek',
    lines: [
      'Die meisten in Ihrer Größe verlieren 2-5k/Monat durch manuelle Prozesse.',
      'Wir bauen einfache Systeme, die das in 30 Tagen lösen.',
    ],
    psychology: 'Spezifische Zahl + konkretes Versprechen.',
  },
  {
    id: 'cold_bridge',
    title: 'Termin',
    duration: '30 Sek',
    lines: [
      'Genau da setzen wir an. Ich habe 2 Slots für ein 15-Min Prozess-Audit.',
      'Wann passt Ihnen besser – morgen oder übermorgen?',
    ],
    psychology: 'Alternative-Close für den Termin.',
  },
  {
    id: 'cold_rejection',
    title: 'Bei Ablehnung',
    duration: '15 Sek',
    lines: [
      'Kein Problem. Darf ich kurz eine Info per E-Mail schicken?',
      'Dann können Sie in Ruhe entscheiden.',
    ],
    psychology: 'Fallback sichern — E-Mail-Kontakt gewinnen.',
  },
];
