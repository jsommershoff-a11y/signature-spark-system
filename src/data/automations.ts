// ============================================================
// src/data/automations.ts
// KI-Automationen Produktkatalog für signature-spark-system
// Stripe Live-IDs (KRS Immobilien GmbH, acct_1Sg9BjGfeNRIZPeJ)
// ============================================================

export type AutomationCategory = 'automation' | 'education';

export interface Automation {
  code: string;
  slug: string;
  name: string;
  subtitle: string;
  priceNet: number;       // EUR netto
  priceGrossVAT: number;  // EUR brutto (19% USt.)
  leadDays: number;
  category: AutomationCategory;
  recurring?: boolean;
  minMonths?: number;
  icon: string;
  pain: string;
  solution: string;
  outcomes: string[];
  features: string[];
  idealFor: string;
  stripeProduct: string;
  stripePrice: string;
  payLink: string;
  bundleNote?: string;
}

export const AUTOMATIONS: Automation[] = [
  {
    code: "A01", slug: "ki-terminbot", name: "KI-Terminbot",
    subtitle: "Voice + Web: Termine automatisch vergeben",
    priceNet: 3900, priceGrossVAT: 4641, leadDays: 7, category: "automation", icon: "calendar",
    pain: "Telefon-Schleifen, Doppelbuchungen, No-Shows, MFA bindet 8+ Stunden pro Woche nur mit Terminvergabe.",
    solution: "KI-Voice-Agent nimmt Anrufe an, fragt Anliegen ab, bucht in Ihren Kalender. Web-Formular synchronisiert. Automatische Erinnerungen und Rückbestätigung.",
    outcomes: ["Reduziert Terminabstimmung auf unter 30 Sekunden pro Buchung","Eliminiert Doppelbuchungen durch Kalender-Sync","No-Show-Rate durch KI-Erinnerungen um 40–60 % reduziert","24/7 erreichbar, auch außerhalb Öffnungszeiten"],
    features: ["Deutsche KI-Voice (Vapi/Synthflow, EU-Server)","Cal.com / Calendly / Outlook / Google Kalender Integration","CRM-Sync","SMS/E-Mail-Erinnerungen","DSGVO-konform, AVV im Paket","30 Tage Optimierungssupport"],
    idealFor: "Kanzleien, Arztpraxen, MVZ, Beratungen mit > 20 Terminen/Woche",
    stripeProduct: "prod_UONcaBrtm6cPoO", stripePrice: "price_1TPasVGfeNRIZPeJOtg4firg",
    payLink: "https://buy.stripe.com/28EdR970Ydme4B53Eeebu03"
  },
  {
    code: "A02", slug: "ki-email-assistent", name: "KI-E-Mail-Assistent",
    subtitle: "Inbox-Zero für Geschäftsführung und Team",
    priceNet: 2900, priceGrossVAT: 3451, leadDays: 5, category: "automation", icon: "mail",
    pain: "Inbox mit 200+ Mails täglich, wichtige Nachrichten gehen unter, Antworten verzögern sich.",
    solution: "KI klassifiziert jede Mail, schreibt Antwort-Entwürfe in Ihrem Stil, erinnert an offene Vorgänge.",
    outcomes: ["Inbox-Aufwand um 60–75 % reduziert","Antwortzeiten von Stunden auf Minuten","Keine vergessenen Vorgänge mehr","Wöchentliches KI-Report"],
    features: ["Gmail / Outlook / Microsoft 365","Antwort-Entwürfe im persönlichen Schreibstil","Ablage-Regeln + Vorgangs-Tracking","Tägliche Inbox-Zusammenfassung","DSGVO-konform","30 Tage Optimierungssupport"],
    idealFor: "Geschäftsführer, Partner, Vertriebsteams mit hohem Mail-Aufkommen",
    stripeProduct: "prod_UONcbTWUiXjn8d", stripePrice: "price_1TPasbGfeNRIZPeJN9mL4iBk",
    payLink: "https://buy.stripe.com/fZueVdfxucia9Vpgr0ebu04"
  },
  {
    code: "A03", slug: "ki-lead-qualifizierer", name: "KI-Lead-Qualifizierer",
    subtitle: "Web-Formular mit KI-Scoring + CRM-Sync",
    priceNet: 2400, priceGrossVAT: 2856, leadDays: 5, category: "automation", icon: "target",
    pain: "Leads werden manuell bewertet, zu spät kontaktiert, schlecht priorisiert.",
    solution: "Formular + KI-Scoring (ICP-Fit, Intent, Pain) + CRM-Anlage + Benachrichtigung Vertrieb.",
    outcomes: ["Zeit bis zum ersten Kontakt unter 60 Sekunden","Konsistentes Scoring 0–100","Top-Leads sofort eskaliert","Hygiene im CRM automatisch"],
    features: ["Eingebettetes Formular","KI-Scoring nach ICP-Kriterien","CRM-Sync","Slack/Teams/E-Mail Notification","Lead-Enrichment","30 Tage Optimierungssupport"],
    idealFor: "Dienstleister mit Website-Traffic > 500 Besuchen/Monat",
    stripeProduct: "prod_UONcrDjdcjWmQP", stripePrice: "price_1TPasiGfeNRIZPeJTYg4UC9N",
    payLink: "https://buy.stripe.com/00wdR92KI0zs8Rl8Yyebu05"
  },
  {
    code: "A04", slug: "ki-angebots-generator", name: "KI-Angebots-Generator",
    subtitle: "Briefing oder Call → fertiges Angebots-PDF",
    priceNet: 3400, priceGrossVAT: 4046, leadDays: 7, category: "automation", icon: "document",
    pain: "Jedes Angebot manuell kostet 1–3 Stunden, Abschlüsse verzögern sich.",
    solution: "Briefing → KI generiert Angebots-PDF mit Branding, Preiskalkulation, Scope.",
    outcomes: ["Angebote in 5 Min statt 2 Std","Konsistente Qualität","Höhere Close-Rate","Automatische Versionierung"],
    features: ["Eigenes Template mit Branding","Preisbibliothek","Rechtsklauseln","PandaDoc / PDF-Export","Stripe-Link automatisch","30 Tage Support"],
    idealFor: "Agenturen, Berater, IT-Dienstleister mit > 10 Angeboten/Monat",
    stripeProduct: "prod_UONcNxJN6MtDzS", stripePrice: "price_1TPasnGfeNRIZPeJvoMxsyBy",
    payLink: "https://buy.stripe.com/dRmeVdfxudme5F9fmWebu06"
  },
  {
    code: "A05", slug: "ki-call-summary", name: "KI-Call-Summary-Pipeline",
    subtitle: "Automatisches Protokoll, Tasks, CRM-Sync",
    priceNet: 1900, priceGrossVAT: 2261, leadDays: 5, category: "automation", icon: "audio",
    pain: "Nach jedem Meeting 20–30 Min Nachbereitung, Action Items gehen verloren.",
    solution: "Zoom/Teams/Meet wird transkribiert, zusammengefasst, Action Items extrahiert, CRM synchronisiert.",
    outcomes: ["Nachbereitung < 3 Min","Keine verlorenen Action Items","CRM ohne manuelle Pflege","Follow-up-Mails binnen 10 Min"],
    features: ["Zoom / Teams / Meet","DE/EN-Transkription","GPT-4o-Zusammenfassung","CRM-Sync","Follow-up-Entwurf","30 Tage Support"],
    idealFor: "Sales, Berater, Führungskräfte mit > 15 Calls/Woche",
    stripeProduct: "prod_UONcwNRqD5N3J9", stripePrice: "price_1TPasuGfeNRIZPeJr9MypfYU",
    payLink: "https://buy.stripe.com/7sYdR92KI3LE8Rla2Cebu07"
  },
  {
    code: "A06", slug: "ki-dokumenten-extraktion", name: "KI-Dokumenten-Extraktion",
    subtitle: "PDF, Scan, Foto → strukturierte Daten",
    priceNet: 2900, priceGrossVAT: 3451, leadDays: 7, category: "automation", icon: "extract",
    pain: "Rechnungen, Verträge, Formulare werden manuell erfasst. Fehler, Doppelarbeit.",
    solution: "KI-Pipeline liest Dokumente, extrahiert strukturierte Daten, validiert, exportiert.",
    outcomes: ["Erfassung < 10 Sek / Dokument","Fehlerrate unter 1 %","Export DATEV, lexoffice, Excel, CRM","Audit-Trail"],
    features: ["PDF, Scan, Foto, E-Mail","Handschrift-Erkennung","Konfigurierbare Felder","DATEV/lexoffice/sevDesk","DSGVO EU-Cloud","30 Tage Support"],
    idealFor: "Kanzleien, Verwaltungen, Buchhaltungen, Versicherungsmakler",
    stripeProduct: "prod_UONc3scJsLXj73", stripePrice: "price_1TPat0GfeNRIZPeJbcEnOayl",
    payLink: "https://buy.stripe.com/fZudR98523LEgjN3Eeebu08"
  },
  {
    code: "A07", slug: "ki-content-maschine", name: "KI-Content-Maschine",
    subtitle: "LinkedIn, Blog, Newsletter automatisch",
    priceNet: 2900, priceGrossVAT: 3451, leadDays: 7, category: "automation", icon: "content",
    pain: "Unregelmäßige Sichtbarkeit, keine Zeit zum Schreiben, Content fehlt für Sales.",
    solution: "KI analysiert Ihre Sprache, generiert 3 Post-Entwürfe/Woche, plant, misst Performance.",
    outcomes: ["3+ Posts/Woche ohne Aufwand","Konsistente Stimme","Sichtbarkeit Faktor 2–5","Sales-Enablement"],
    features: ["Ghostwriter-GPT","LinkedIn, Blog, Newsletter","Planungs-Tool","Performance-Dashboard","Themen-Recherche","30 Tage Support"],
    idealFor: "Geschäftsführer, Berater, Agenturen mit Thought-Leadership-Ziel",
    stripeProduct: "prod_UONcUzwaBwynY9", stripePrice: "price_1TPat6GfeNRIZPeJ3Q4LygP3",
    payLink: "https://buy.stripe.com/dRm8wP70Y6XQ8Rlb6Gebu09"
  },
  {
    code: "A08", slug: "ki-bewerber-screening", name: "KI-Bewerber-Screening",
    subtitle: "CV → Ranking + Interview-Fragen",
    priceNet: 2400, priceGrossVAT: 2856, leadDays: 5, category: "automation", icon: "hire",
    pain: "Bei 50+ Bewerbungen geht der Überblick verloren. Gute Kandidaten übersehen.",
    solution: "Bewerbungen werden gegen Stellenprofil bewertet, Skills markiert, Interview-Fragen generiert.",
    outcomes: ["Screening -80 %","Objektiverer Vergleich","Interview-Fragen pro Kandidat","Talent-Datenbank"],
    features: ["PDF-CV + LinkedIn-URL","Stellenprofil-Matching","Anti-Bias (AGG)","Interview-Fragen-Generator","Talent-Pool","30 Tage Support"],
    idealFor: "Kanzleien, Praxen, KMU mit aktivem Recruiting",
    stripeProduct: "prod_UONdf1c92gdTmb", stripePrice: "price_1TPatDGfeNRIZPeJPkdg6S9s",
    payLink: "https://buy.stripe.com/fZu00j996eqiffJ1w6ebu0a"
  },
  {
    code: "A09", slug: "ki-kundenservice-bot", name: "KI-Kundenservice-Bot",
    subtitle: "Chat-Widget mit Wissensbasis",
    priceNet: 3400, priceGrossVAT: 4046, leadDays: 7, category: "automation", icon: "chat",
    pain: "Wiederholfragen binden Mitarbeiter, Kunden warten, Support-Last wächst schneller als Team.",
    solution: "Chat-Widget mit trainierter Wissensbasis. Beantwortet 70–80 % sofort, eskaliert komplexe Fälle.",
    outcomes: ["Support -70/80 %","Antwortzeit < 3 Sek","24/7-Verfügbarkeit","Lernt aus Tickets"],
    features: ["Chat-Widget","Wissensbasis aus PDFs/Notion","Eskalation Slack/Teams","Analytics","Mehrsprachig","30 Tage Support"],
    idealFor: "Dienstleister mit wiederkehrenden Kundenfragen",
    stripeProduct: "prod_UONdFhPgGiLlHU", stripePrice: "price_1TPatJGfeNRIZPeJ5ueBvp2q",
    payLink: "https://buy.stripe.com/5kQeVd70Y6XQ7Nh5Mmebu0b"
  },
  {
    code: "A10", slug: "ki-reporting-bot", name: "KI-Reporting-Bot",
    subtitle: "Wöchentliche KPI-Auswertung automatisch",
    priceNet: 1900, priceGrossVAT: 2261, leadDays: 5, category: "automation", icon: "report",
    pain: "Daten in CRM, Buchhaltung, Marketing-Tools, GA4. Niemand zieht regelmäßig Überblick.",
    solution: "KI konsolidiert Quellen, erkennt Trends, formuliert Handlungsempfehlungen. Montags via Slack/Mail.",
    outcomes: ["Führung weiß montags Bescheid","Auffälligkeiten benannt","Entscheidungsgrundlagen ohne Aggregation","Versteckte Trends"],
    features: ["CRM, Buchhaltung, GA4, Ads","Slack/Mail-Report","Trend-Analyse","Handlungsempfehlungen","Dashboard","30 Tage Support"],
    idealFor: "Geschäftsführer, Marketing, Finanzleiter",
    stripeProduct: "prod_UONdOiZqVbqvPj", stripePrice: "price_1TPatQGfeNRIZPeJrpAIrV0x",
    payLink: "https://buy.stripe.com/7sY28r4SQ5TMgjNb6Gebu0c"
  },
  {
    code: "A11", slug: "ki-rechnungs-assistent", name: "KI-Rechnungs-Assistent",
    subtitle: "Eingangsrechnungen → DATEV-Vorbereitung",
    priceNet: 2900, priceGrossVAT: 3451, leadDays: 7, category: "automation", icon: "invoice",
    pain: "Eingangsrechnungen manuell erfasst. Monatsende bedeutet Stress.",
    solution: "Jede Rechnung (Mail/Papier/Upload) erfasst, geprüft, kontiert, DATEV-konform übergeben.",
    outcomes: ["Erfassung -90 %","Keine Monatsspitzen","Fehlerquote gesenkt","Audit-Trail"],
    features: ["Mail-Postfach + Scan + Upload","DATEV / lexoffice / sevDesk","USt- und Kontenrahmen-Logik","Duplikatsprüfung","DSGVO-Archiv","30 Tage Support"],
    idealFor: "Kanzleien, Praxen, KMU mit 30+ Rechnungen/Monat",
    stripeProduct: "prod_UONdj2OKWNqm7H", stripePrice: "price_1TPatWGfeNRIZPeJHEDoC37S",
    payLink: "https://buy.stripe.com/6oUcN5bheeqic3xdeOebu0d"
  },
  {
    code: "A12", slug: "ki-voice-assistent-empfang", name: "KI-Voice-Assistent Empfang",
    subtitle: "KI nimmt Anrufe an wie Ihr Team",
    priceNet: 4900, priceGrossVAT: 5831, leadDays: 10, category: "automation", icon: "phone",
    pain: "Telefon klingelt durch, Mitarbeiter werden aus Fokus gerissen, Rückrufe stapeln sich.",
    solution: "Voll-KI-Voice-Agent nimmt Anrufe, klassifiziert, beantwortet Standardfragen, bucht, leitet weiter.",
    outcomes: ["70–80 % ohne MFA-Aufwand","Mitarbeiter-Fokus","Anrufer nie abgewiesen","Gesprächsprotokolle"],
    features: ["DE + EN","Custom Voice, Branding","Termin-Buchung","Weiterleitung nach Regeln","DSGVO EU-Server","30 Tage Support"],
    idealFor: "Praxen, Kanzleien, MVZ, Dienstleister mit > 30 Anrufen/Tag",
    stripeProduct: "prod_UONdidX5r7452D", stripePrice: "price_1TPatdGfeNRIZPeJ46FvYnUr",
    payLink: "https://buy.stripe.com/aFa00j9960zs5F9gr0ebu0e"
  },
  {
    code: "A13", slug: "ki-post-assistent", name: "KI-Post-Assistent",
    subtitle: "Social-Media-Posts automatisch erstellen, planen, messen",
    priceNet: 1499, priceGrossVAT: 1784, leadDays: 7, category: "automation", icon: "content",
    pain: "LinkedIn, Instagram und X werden unregelmäßig bespielt. Sichtbarkeit fehlt.",
    solution: "KI analysiert Ihre Sprache, generiert täglich Post-Entwürfe, plant Veröffentlichungen. 3 Min Freigabe pro Tag.",
    outcomes: ["3–5 Posts/Woche ohne Aufwand","Konsistente Positionierung","Sichtbarkeit Faktor 2–5","Performance-Dashboard"],
    features: ["Ghostwriter-GPT","LinkedIn, Instagram, X","Bild-Vorschläge Midjourney/DALL-E","Hashtag-Recherche","Kalender (Buffer/Hootsuite)","Analytics + A/B","30 Tage Support"],
    idealFor: "Geschäftsführer, Berater, Agenturen, Coaches",
    stripeProduct: "prod_UOOZfQwMbSWB1S",
    stripePrice: "price_1TPbmbGfeNRIZPeJgsw5gFLP",
    payLink: "https://buy.stripe.com/3cI00j99695YgjNgr0ebu0f"
  },
  {
    code: "EDU01", slug: "ki-profi-kickoff", name: "KI-Profi Programm — Kickoff",
    subtitle: "Einmalige Startgebühr für das 6-monatige Intensivprogramm",
    priceNet: 1500, priceGrossVAT: 1785, leadDays: 0, category: "education", icon: "hire",
    pain: "KI-Tools sind überall, aber Sie erkennen die echten Anwendungsfälle nicht, können Prompts nicht strukturieren, bauen keine eigenen Automationen.",
    solution: "6-monatiges Intensivprogramm — Sie werden selbst zum KI-Profi. Start mit Kickoff (Onboarding, Zieldefinition, Lernpfad, Tool-Stack).",
    outcomes: ["Persönlicher Lernpfad 6 Monate","Zugang zum Live-Programm","Eigener Tool-Stack eingerichtet","KI-Strategie-Dokument für Ihr Unternehmen"],
    features: ["Kickoff-Call 90 Min (1:1)","Zugang Mitgliederbereich","Persönlicher Lernpfad","Tool-Setup","Prompts-Library","Whitelabel-KI-Strategie"],
    idealFor: "Geschäftsführer, Partner, Fachexperten — KI verstehen statt kaufen",
    stripeProduct: "prod_UOOZYMvZ1vXOCW",
    stripePrice: "price_1TPbmjGfeNRIZPeJ4fcdB50m",
    payLink: "https://buy.stripe.com/bJebJ1fxu4PI9Vpb6Gebu0g",
    bundleNote: "Pflicht-Produkt vor EDU02. Monatsbeitrag separat – Konditionen nach Erstgespräch."
  },
  {
    code: "EDU02", slug: "ki-profi-monatsbeitrag", name: "KI-Profi Programm — Monatsbeitrag",
    subtitle: "6-monatiges Intensivprogramm · monatlicher Beitrag · Mindestlaufzeit 6 Monate",
    priceNet: 899, priceGrossVAT: 1070, leadDays: 0, category: "education", icon: "calendar",
    recurring: true, minMonths: 6,
    pain: "Online-Kurse sind passiv, Coachings oberflächlich, YouTube veraltet. Sie brauchen strukturierten Lernweg mit Use Cases aus Ihrem Alltag.",
    solution: "6 Monate Live-Programm: wöchentliche Sessions, monatliches 1:1, Hands-on-Projekte. Am Ende bauen Sie eigene KI-Automationen.",
    outcomes: ["Monat 1: KI-Grundlagen, Prompt-Engineering","Monat 2: Erste Automationen","Monat 3: KI-Agenten","Monat 4: RAG-Systeme","Monat 5: Produktivsetzung","Monat 6: KI-Strategie & Roadmap"],
    features: ["Wöchentliche 90-Min Live-Session (max. 12 TN)","Monatliches 1:1 (60 Min)","Alle Replays","500+ Prompts","30+ n8n/Make-Templates","Slack-Community","Monatlicher Guest-Expert-Call","Abschluss-Zertifikat"],
    idealFor: "Entscheider, die KI systematisch im eigenen Unternehmen einsetzen wollen",
    stripeProduct: "prod_UOOZShlFBdHsKf",
    stripePrice: "price_1TPbmrGfeNRIZPeJqGmCQ2e4",
    payLink: "https://buy.stripe.com/aFa5kD99681UffJ0s2ebu0h",
    bundleNote: "Start nach Zahlung Kickoff-Gebühr (EDU01). Mindestlaufzeit 6 Monate"
  }
];

export const AUTOMATIONS_BY_CATEGORY = {
  automation: AUTOMATIONS.filter(a => a.category === 'automation'),
  education: AUTOMATIONS.filter(a => a.category === 'education'),
};

export const getAutomation = (code: string): Automation | undefined =>
  AUTOMATIONS.find(a => a.code === code);

export const formatPriceEUR = (cents: number): string =>
  `${(cents).toLocaleString('de-DE')} €`;
