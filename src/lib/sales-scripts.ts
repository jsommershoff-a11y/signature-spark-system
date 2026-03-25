/**
 * Sales Scripts – Gesprächsleitfäden, Einwandbehandlung, Outreach-Vorlagen.
 * Zentrales Daten-Modul für den SalesGuideWizard.
 */

// ============================================
// Types
// ============================================

export interface ScriptPhase {
  id: string;
  title: string;
  duration?: string;
  lines: string[];
  psychology?: string;
}

export interface ObjectionHandler {
  id: string;
  objection: string;
  emoji: string;
  reframe: string;
  response: string[];
  psychology: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  channel: string;
  subject?: string;
  body: string;
}

// ============================================
// Triage-Call Skript (15 Min)
// ============================================

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
      'Was passiert, wenn du so weitermachst wie bisher?',
    ],
    psychology: 'Emotionalen Schmerz aktivieren, Konsequenz spürbar machen.',
  },
  {
    id: 'triage_qualify',
    title: 'Qualifizierung',
    duration: '3 Min',
    lines: [
      'Bist du der Entscheider?',
      'Hast du grundsätzlich Budget für eine Lösung eingeplant?',
      'Wärst du bereit, in den nächsten 30 Tagen etwas zu verändern?',
    ],
    psychology: 'Entscheidungsfähigkeit und Bereitschaft prüfen.',
  },
  {
    id: 'triage_bridge',
    title: 'Bridge zum Strategy Call',
    duration: '2 Min',
    lines: [
      'Ok [Name], das klingt nach einem klaren Fall.',
      'Ich würde gerne in einem ausführlichen Gespräch (45 Min) genau durchgehen, wo du stehst und was der schnellste Weg ist.',
      'Wann passt dir diese Woche – Dienstag oder Donnerstag?',
    ],
    psychology: 'Alternative-Close: Nicht ob, sondern wann.',
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

// ============================================
// Strategy Session Skript (45-60 Min)
// ============================================

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
      'Stell dir vor, in 90 Tagen: Dein Team arbeitet eigenständig. Du hast 2 Tage pro Woche zurück.',
      'Anfragen werden automatisch erfasst, Follow-ups laufen, Prozesse sind klar.',
      'Was würdest du mit dieser Zeit machen?',
    ],
    psychology: 'Future Pacing – emotionales Commitment zum Ergebnis.',
  },
  {
    id: 'strategy_pitch',
    title: 'Lösung präsentieren',
    duration: '10 Min',
    lines: [
      'Genau dafür haben wir das Signature System gebaut.',
      'Wir bauen das System GEMEINSAM in dein Unternehmen. 30 Tage. Ab Tag 1 Ergebnisse.',
      'Das ist kein Kurs, kein Coaching von der Seitenlinie. Wir setzen mit dir um.',
      'Case Study: [Name] hatte das gleiche Problem. Nach 4 Wochen: [konkretes Ergebnis].',
    ],
    psychology: 'Done-with-you positionieren, Social Proof nutzen.',
  },
  {
    id: 'strategy_price',
    title: 'Preis & Investition',
    duration: '5 Min',
    lines: [
      'Die Investition liegt bei [Betrag].',
      'Verglichen mit [monatlicher Verlust] × 12 Monate = [Jahresverlust] ist das ein klarer Business Case.',
      'Ratenzahlung und Finanzierung sind möglich – dazu gleich mehr.',
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
    psychology: 'Einwände als Kaufsignal behandeln, nicht als Ablehnung.',
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

// ============================================
// Kaltakquise Skript
// ============================================

export const COLD_CALL_SCRIPT: ScriptPhase[] = [
  {
    id: 'cold_opener',
    title: 'Opener',
    duration: '30 Sek',
    lines: [
      'Hey [Name], hier ist Jan von KRS Signature. Kurze Frage: Hast du 90 Sekunden?',
      'Ich arbeite mit Unternehmern wie dir, die im operativen Alltag feststecken.',
    ],
    psychology: 'Micro-Commitment: 90 Sekunden sind keine große Hürde.',
  },
  {
    id: 'cold_hook',
    title: 'Hook',
    duration: '30 Sek',
    lines: [
      'Die meisten Unternehmer mit Team verlieren 10–15 Stunden pro Woche mit Dingen, die ein System machen sollte.',
      'Wir bauen genau solche Systeme. In 30 Tagen.',
      'Kommt dir das bekannt vor?',
    ],
    psychology: 'Spezifische Zahl + direkte Frage = Engagement.',
  },
  {
    id: 'cold_qualify',
    title: 'Quick-Qualify',
    duration: '1 Min',
    lines: [
      'Wie viele Leute arbeiten bei dir?',
      'Was ist gerade dein größter Engpass?',
      'Hast du grundsätzlich Interesse, das zu lösen?',
    ],
    psychology: 'Drei Fragen reichen zur Qualifizierung.',
  },
  {
    id: 'cold_bridge',
    title: 'Bridge zum Triage-Call',
    duration: '30 Sek',
    lines: [
      'Ich würde mir gern 15 Minuten mit dir nehmen und das genauer anschauen.',
      'Wann passt dir besser – morgen oder übermorgen?',
    ],
    psychology: 'Alternative-Close für den Termin.',
  },
];

// ============================================
// Einwandbehandlung – Big 5
// ============================================

export const OBJECTION_HANDLING: ObjectionHandler[] = [
  {
    id: 'obj_no_time',
    objection: 'Keine Zeit',
    emoji: '⏰',
    reframe: 'Genau deshalb brauchst du es.',
    response: [
      'Das verstehe ich. Du hast keine Zeit, WEIL du kein System hast.',
      'Wenn du jetzt nichts änderst – wann dann? In 6 Monaten hast du das gleiche Problem.',
      'Wir machen das Done-with-you. Du musst nicht alles selbst bauen. Wir setzen gemeinsam um.',
      'Die meisten Kunden gewinnen schon in Woche 2 die ersten Stunden zurück.',
    ],
    psychology: 'Reframe: Keine Zeit IST das Problem, nicht ein Grund zu warten.',
  },
  {
    id: 'obj_too_expensive',
    objection: 'Zu teuer / 10k sind eng',
    emoji: '💰',
    reframe: 'Was kostet es dich, NICHT zu handeln?',
    response: [
      'Lass uns rechnen: Du verlierst [X] Stunden pro Woche × Stundensatz = [Y] € pro Monat.',
      'Auf 12 Monate: [Z] €. Die Investition hat sich nach [Zeitraum] amortisiert.',
      'Wir haben eine Signature Transformation Finanzierung – bis zu 250.000 € möglich.',
      'Die Frage ist nicht, ob du es dir leisten kannst. Die Frage ist, ob du es dir leisten kannst, es NICHT zu tun.',
    ],
    psychology: 'Verlust-Rechnung > Preis-Diskussion. Finanzierung als Sicherheitsnetz.',
  },
  {
    id: 'obj_partner',
    objection: 'Muss mit Partner besprechen',
    emoji: '👥',
    reframe: 'Was würde dein Partner sagen, wenn du 2 Tage pro Woche zurückgewinnst?',
    response: [
      'Klar, wichtige Entscheidungen bespricht man. Aber: Was genau würdet ihr besprechen?',
      'Ist es das Geld oder das Konzept? Lass uns das jetzt klären.',
      'Stell dir vor, du gehst nach Hause und sagst: "Ich habe eine Lösung gefunden, die mir jede Woche einen Tag zurückgibt." Was sagt dein Partner?',
      'Ich mache dir ein Angebot, das du mitnehmen kannst. Aber: Das Angebot gilt 48 Stunden.',
    ],
    psychology: 'Emotionalen Hebel nutzen: Familie profitiert am meisten von mehr Zeit.',
  },
  {
    id: 'obj_tried_before',
    objection: 'Habe schon was Ähnliches probiert',
    emoji: '🔄',
    reframe: 'Du hast Tools probiert. Kein System.',
    response: [
      'Was genau hast du probiert? [Zuhören]',
      'Der Unterschied: Tools lösen Einzelprobleme. Ein System verbindet alles.',
      'Wir bauen keine Software, die du lernst. Wir bauen ein Betriebssystem in DEIN Unternehmen.',
      'Das ist der Unterschied zwischen einem Tool-Kauf und einer System-Implementierung.',
    ],
    psychology: 'System vs. Tool klar differenzieren. Vorherige Erfahrung validieren.',
  },
  {
    id: 'obj_think_about_it',
    objection: 'Muss darüber nachdenken',
    emoji: '🤔',
    reframe: 'Worüber genau? Lass uns das jetzt klären.',
    response: [
      'Absolut, das ist eine wichtige Entscheidung. Aber: Worüber genau möchtest du nachdenken?',
      'Ist es der Preis? Das Konzept? Die Umsetzung? Lass uns den echten Punkt finden.',
      'Erfahrungsgemäß bedeutet "nachdenken" oft: Es gibt noch eine offene Frage. Welche ist es?',
      'Ich mache dir einen Vorschlag: Das Angebot steht 48 Stunden. Danach besprechen wir nochmal.',
    ],
    psychology: 'Echten Einwand hinter dem Vorwand finden. Deadline setzen.',
  },
];

// ============================================
// 6 Goldene Regeln
// ============================================

export const GOLDEN_RULES = [
  'Höre 70%, rede 30%. Der Kunde verkauft sich selbst.',
  'Stelle nie eine Frage, auf die "Nein" die einfache Antwort ist.',
  'Preis nie isoliert nennen. Immer im Kontext des Problems.',
  'Nach dem Abschluss: Schweigen. Wer zuerst redet, verliert.',
  'Jeder Einwand ist ein Kaufsignal. Behandle ihn wie eine Frage.',
  'Drei Outreach pro Tag. Ein Call pro Tag. Ein Follow-up pro Tag.',
];

// ============================================
// Outreach-Vorlagen
// ============================================

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

// ============================================
// Vertriebsziele / Cockpit-Daten
// ============================================

export const SALES_TARGETS = {
  monthly: {
    leads: 100,
    triageCalls: 50,
    strategySessions: 35,
    closeRate: 40,
    dailyOutreach: 3,
    dailyCalls: 1,
    dailyFollowups: 1,
  },
  mantra: 'Jeden Tag 3 Outreach. Jeden Tag 1 Call. Jeden Tag 1 Follow-up.',
};
