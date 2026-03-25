import type { ObjectionHandler } from './types';

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

export const GOLDEN_RULES = [
  'Höre 70%, rede 30%. Der Kunde verkauft sich selbst.',
  'Stelle nie eine Frage, auf die "Nein" die einfache Antwort ist.',
  'Preis nie isoliert nennen. Immer im Kontext des Problems.',
  'Nach dem Abschluss: Schweigen. Wer zuerst redet, verliert.',
  'Jeder Einwand ist ein Kaufsignal. Behandle ihn wie eine Frage.',
  'Drei Outreach pro Tag. Ein Call pro Tag. Ein Follow-up pro Tag.',
];
