import type { IndustryFAQ } from "./industries";

export interface Bundle {
  slug: "start" | "growth";
  /** Routenpfad ohne führenden Slash */
  path: string;
  /** Marketing-Label */
  badge: string;
  /** Hero */
  headline: string;
  problem: string;
  solution: string;
  ctaText: string;
  /** SEO */
  seoTitle: string;
  seoDescription: string;
  /** Welche Automation-Slugs gehören zum Bundle */
  automationSlugs: string[];
  /** Was bringt das Bundle in einem Satz (für Hero-Untertitel) */
  oneLiner: string;
  /** Top-3 Outcomes für die Outcome-Sektion */
  outcomes: string[];
  /** Bundle-spezifische FAQs (Common-FAQs werden im Template ergänzt) */
  faq: IndustryFAQ[];
  /** Final-CTA */
  finalCtaHeadline: string;
  finalCtaSubline: string;
}

export const BUNDLES: Record<"start" | "growth", Bundle> = {
  start: {
    slug: "start",
    path: "/start",
    badge: "Starter-Bundle · 3 Bots",
    headline: "Der schnellste Einstieg in KI-Automatisierung.",
    problem:
      "Telefon klingelt ständig, das Postfach läuft über und Angebote bleiben tagelang liegen. Ein erstes KI-Setup würde sofort spürbar entlasten – aber wo anfangen?",
    solution:
      "3 sofort produktive Bots, die in 7 Tagen live gehen: Termine, E-Mail und Angebote laufen ab Tag 1 automatisch.",
    ctaText: "Starter-Bundle anfragen",
    seoTitle: "Starter-Bundle: 3 KI-Bots in 7 Tagen produktiv | KI-Automationen",
    seoDescription:
      "Der schnellste Einstieg in Automatisierung: KI-Terminbot, KI-E-Mail-Assistent und KI-Angebotsgenerator als fertiges Starter-Bundle. Live in 7 Tagen.",
    automationSlugs: ["ki-terminbot", "ki-email-assistent", "ki-angebots-generator"],
    oneLiner:
      "Termine, E-Mails und Angebote ab Tag 7 automatisiert – mit nur einem Onboarding.",
    outcomes: [
      "Mind. 8–15 h pro Woche zurückgewonnene Mitarbeiterzeit",
      "Keine vergessenen Angebote oder unbeantworteten Anfragen mehr",
      "24/7 erreichbar – auch außerhalb der Bürozeiten",
    ],
    faq: [
      {
        question: "Warum genau diese 3 Bots im Starter-Bundle?",
        answer:
          "Termin, E-Mail und Angebot decken die drei Engpässe ab, die in fast jedem Betrieb täglich Stunden kosten. Sie greifen ineinander: Anfrage → Termin → Angebot läuft als ein durchgängiger Prozess.",
      },
      {
        question: "Kann ich später auf das Growth-Bundle upgraden?",
        answer:
          "Ja. Alle Komponenten sind so gebaut, dass weitere Bots (z. B. Voice-Agent, Lead-Qualifizierung, Content-Engine) jederzeit modular ergänzt werden – ohne Neuaufbau.",
      },
      {
        question: "Wann genau ist das Starter-Bundle live?",
        answer:
          "Tag 0 Kickoff → Tag 7 Delivery (alle 3 Bots produktiv) → Tag 10 Setup-Check → Tag 20 Optimierungstermin. Bugfixes innerhalb der Termine inklusive, 30 Tage Optimierungssupport.",
      },
    ],
    finalCtaHeadline: "Bereit für den schnellen Einstieg?",
    finalCtaSubline:
      "Kurzer Bedarfsabgleich, dann erhältst du innerhalb von 24 h dein Festpreis-Angebot für das Starter-Bundle.",
  },

  growth: {
    slug: "growth",
    path: "/growth",
    badge: "Growth-Bundle · 7 Bots",
    headline: "Die komplette Automatisierungs-Suite für skalierende Betriebe.",
    problem:
      "Ihr habt bereits erste Tools, aber sie sind nicht verbunden. Vertrieb, Service, Backoffice arbeiten in Silos – Skalierung kostet jedes Mal neue Mitarbeiter statt neuer Systeme.",
    solution:
      "7 produktive KI-Bots als geschlossenes System: Voice, Termin, E-Mail, Angebote, Lead-Qualifizierung, Daten-Extraktion und Content. End-to-End vom ersten Touchpoint bis zur Rechnung.",
    ctaText: "Growth-Bundle anfragen",
    seoTitle:
      "Growth-Bundle: 7 KI-Bots als komplettes System | KI-Automationen",
    seoDescription:
      "Die komplette KI-Suite für skalierende Betriebe: Voice-Agent, Terminbot, E-Mail-Assistent, Angebotsgenerator, Lead-Qualifizierung, Daten-Extraktion und Content-Engine als ein System.",
    automationSlugs: [
      "ki-voice-assistent-empfang",
      "ki-terminbot",
      "ki-email-assistent",
      "ki-angebots-generator",
      "ki-lead-qualifizierer",
      "ki-dokumenten-extraktion",
      "ki-content-maschine",
    ],
    oneLiner:
      "Vom ersten Anruf bis zur Rechnung: 7 Bots als ein durchgängiger End-to-End-Prozess.",
    outcomes: [
      "1–2 FTE Personalentlastung als Gesamtsystem",
      "Vertrieb, Service & Backoffice in einem geschlossenen Datenfluss",
      "Skalieren ohne neue Vollzeitstellen einstellen zu müssen",
    ],
    faq: [
      {
        question: "Müssen wir alle 7 Bots gleichzeitig einführen?",
        answer:
          "Nein. Wir staffeln den Rollout in 3 Wellen über 4–6 Wochen, damit dein Team Schritt halten kann. Welle 1 (Termin/E-Mail/Angebot) ist nach 7 Tagen live, danach folgen Voice + Lead-Qualifizierung und zum Schluss Daten + Content.",
      },
      {
        question: "Was ist der Unterschied zum Starter-Bundle?",
        answer:
          "Starter automatisiert die 3 wichtigsten Engpässe. Growth automatisiert den kompletten Funnel inklusive Voice-Agent, Lead-Scoring und Content-Produktion – also alles, was sonst eine Vertriebs- und Marketing-Abteilung leisten würde.",
      },
      {
        question: "Bekommen wir einen festen Ansprechpartner?",
        answer:
          "Ja. Beim Growth-Bundle wirst du über die gesamte Rollout-Phase von einem Lead-Implementierer betreut – inklusive wöchentlicher Sync-Calls und einem dedizierten Slack-/Teams-Kanal.",
      },
    ],
    finalCtaHeadline: "Bereit für das komplette System?",
    finalCtaSubline:
      "Im Erstgespräch klären wir Reihenfolge, Integrationen und Roadmap. Festpreis-Angebot innerhalb von 24 h.",
  },
};

export const getBundle = (slug: string): Bundle | undefined =>
  BUNDLES[slug as "start" | "growth"];
