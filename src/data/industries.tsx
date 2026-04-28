import {
  Brain, Users, TrendingDown, Clock, FileText,
  Filter, MessageSquare, Building, DollarSign, User, Home,
} from "lucide-react";
import type { ReactNode } from "react";

export interface IndustryCause {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface IndustryFAQ {
  question: string;
  answer: string;
}

export interface IndustryContent {
  slug: string;
  /** SEO */
  seoTitle: string;
  seoDescription: string;
  canonical: string;
  /** Hero */
  hero: {
    headline: string;
    problem: string;
    solution: string;
    badge?: string;
    ctaText: string;
  };
  /** Problem-Sektion */
  problem: {
    yesPoints: string[];
    noPoints: string[];
    causesIntro: string;
    causes: IndustryCause[];
  };
  /** FAQ */
  faq: IndustryFAQ[];
  /** Final CTA */
  finalCta: {
    headline: string;
    subline: string;
    ctaText: string;
  };
}

/**
 * Universelle FAQ-Bausteine die für jede Branche relevant sind.
 * Branchenspezifische FAQs werden vorangestellt.
 */
const COMMON_FAQ: IndustryFAQ[] = [
  {
    question: "Was kostet die Umsetzung?",
    answer:
      "Wir geben keine Listenpreise heraus, weil jede Umgebung anders ist. Nach kurzer Bedarfsanalyse erhältst du innerhalb von 24 h ein konkretes Festpreis-Angebot — ohne versteckte Folgekosten.",
  },
  {
    question: "Wie lange dauert die Einrichtung?",
    answer:
      "7 Tage bis Delivery (Tag 0 Kickoff → Tag 7 live). Tag 10 Setup-Check, Tag 20 Optimierung. Bugfixes innerhalb dieser Termine sind inklusive — du hast 30 Tage Optimierungssupport.",
  },
  {
    question: "Was ist mit DSGVO und Datensicherheit?",
    answer:
      "Alle Komponenten laufen DSGVO-konform auf EU-Servern. AVV (Auftragsverarbeitung) ist im Paket. Sensible Daten verlassen niemals deine Infrastruktur ohne explizite Freigabe.",
  },
  {
    question: "Brauche ich technisches Vorwissen?",
    answer:
      "Nein. Wir liefern eine schlüsselfertige Lösung. Du erhältst eine kurze Einweisung (30–60 Min) und eine Schritt-für-Schritt-Dokumentation für dein Team.",
  },
];

export const INDUSTRIES: Record<string, IndustryContent> = {
  praxen: {
    slug: "praxen",
    seoTitle: "Automatisierung für Praxen | KI-Automationen",
    seoDescription:
      "Praxisprozesse systematisieren: Terminausfälle reduzieren, Verwaltung automatisieren und Personal entlasten. Kostenlose Potenzial-Analyse für Praxisinhaber.",
    canonical: "/praxen",
    hero: {
      headline: "Ihre Praxis läuft – aber nicht planbar?",
      problem: "Medizinisch stark. Unternehmerisch ungeführt.",
      solution: "KI-Systeme schaffen Struktur, die Sie entlastet.",
      badge: "Nur für Praxisinhaber ab 100.000 € Umsatz",
      ctaText: "Jetzt KI-Potenzial aufdecken",
    },
    problem: {
      yesPoints: [
        "Du bist Praxisinhaber mit Team und Verantwortung",
        "Termin-Ausfälle, Personal-Chaos und Verwaltung kosten dich Energie",
        "Du willst Systeme, die Planbarkeit schaffen",
        "Du bist bereit, operative Gewohnheiten zu ändern",
      ],
      noPoints: [
        "Du bist angestellter Arzt ohne Entscheidungsmacht",
        "Du suchst nur eine neue Praxissoftware",
        "Du erwartest Veränderung ohne eigene Arbeit",
        "Du willst weitermachen wie bisher",
      ],
      causesIntro:
        "Das echte Problem ist nicht der Patientenstrom – es ist fehlende Struktur in der Praxis.",
      causes: [
        {
          icon: <Clock className="w-8 h-8" />,
          title: "Terminausfälle und No-Shows",
          description:
            "Patienten erscheinen nicht, Slots bleiben leer. Umsatzverlust, den niemand trackt.",
        },
        {
          icon: <Users className="w-8 h-8" />,
          title: "Personal kommt und geht",
          description:
            "Einarbeitung frisst Zeit, Wissen geht verloren. Jeder neue Mitarbeiter ist ein Neuanfang.",
        },
        {
          icon: <FileText className="w-8 h-8" />,
          title: "Verwaltung frisst Zeit",
          description:
            "Dokumentation, Abrechnung, Bürokratie. Der Praxisalltag endet nie um 18 Uhr.",
        },
      ],
    },
    faq: [
      {
        question: "Funktioniert das mit unserer Praxissoftware?",
        answer:
          "Ja. Wir integrieren mit gängigen Systemen (z. B. Doctolib, Samedi, Medatixx, x.concept) per API oder Bridge. Wenn keine API verfügbar ist, arbeiten wir mit RPA / Browser-Automation.",
      },
      {
        question: "Wie reduziert ihr No-Shows konkret?",
        answer:
          "Automatische Terminerinnerungen über mehrere Kanäle (SMS, E-Mail, WhatsApp), 2-Wege-Bestätigung, Re-Booking-Flow für Absagen und KI-Vorhersage gefährdeter Termine.",
      },
      ...COMMON_FAQ,
    ],
    finalCta: {
      headline: "Bereit für KI-gestützte Effizienz?",
      subline:
        "Sichere dir jetzt deine kostenlose KI-Potenzialanalyse und erfahre, wie KI deine Praxisprozesse automatisiert.",
      ctaText: "Kostenlose KI-Potenzialanalyse sichern",
    },
  },

  handwerk: {
    slug: "handwerk",
    seoTitle: "Automatisierung für Handwerksbetriebe | KI-Automationen",
    seoDescription:
      "Prozesse im Handwerk systematisieren: Terminplanung, Angebotswesen und Mitarbeiterführung automatisieren. Kostenlose Potenzial-Analyse für Handwerksmeister.",
    canonical: "/handwerk",
    hero: {
      headline: "Volle Auftragsbücher – aber der Betrieb frisst dich auf?",
      problem: "Ihr Problem ist nicht Arbeit. Ihr Problem ist fehlende Struktur.",
      solution: "KI-gestützte Prozesse führen den Betrieb – nicht Sie allein.",
      badge: "Nur für Unternehmer ab 100.000 € Umsatz",
      ctaText: "Jetzt KI-Potenzial aufdecken",
    },
    problem: {
      yesPoints: [
        "Du bist Handwerksmeister mit Team und voller Auftragslage",
        "Dein Betrieb läuft – aber das Chaos wächst mit",
        "Du willst Prozesse, die ohne dich funktionieren",
        "Du bist bereit, operative Gewohnheiten zu ändern",
      ],
      noPoints: [
        "Du bist Solo-Handwerker ohne Wachstumsziel",
        "Du suchst nur ein neues Tool oder eine App",
        "Du willst weitermachen wie bisher – nur einfacher",
        "Du erwartest magische Lösungen ohne Veränderung",
      ],
      causesIntro:
        "Das echte Problem ist nicht die Arbeit – es ist fehlende Struktur im Betrieb.",
      causes: [
        {
          icon: <Brain className="w-8 h-8" />,
          title: "Terminplanung im Kopf",
          description:
            "Kein System, keine Übersicht. Du jonglierst Aufträge im Kopf – und vergisst trotzdem Details.",
        },
        {
          icon: <TrendingDown className="w-8 h-8" />,
          title: "Angebote bleiben liegen",
          description:
            "Nach dem Ortstermin passiert wochenlang nichts. Kunden warten, du verlierst Aufträge.",
        },
        {
          icon: <Users className="w-8 h-8" />,
          title: "Mitarbeiter brauchen ständig Anleitung",
          description:
            "Keine klaren Prozesse bedeutet: Du bist der Engpass. Ohne dich läuft nichts.",
        },
      ],
    },
    faq: [
      {
        question: "Wie schnell entstehen aus Ortsterminen Angebote?",
        answer:
          "Aus Ortstermin-Notizen oder Sprachmemo erstellt die KI innerhalb weniger Minuten ein druckreifes Angebot mit Positionen, Aufmaß und Preisen aus deiner Bibliothek.",
      },
      {
        question: "Funktioniert das auch ohne Büromitarbeiter?",
        answer:
          "Ja. Genau dafür ist es gebaut. Anfragen, Terminvereinbarung und Angebotsversand laufen automatisch — du oder dein Vorarbeiter haben nur noch Freigabe-Klicks.",
      },
      ...COMMON_FAQ,
    ],
    finalCta: {
      headline: "Bereit für KI-gestützte Effizienz?",
      subline:
        "Sichere dir jetzt deine kostenlose KI-Potenzialanalyse und erfahre, wie KI deine Betriebsprozesse automatisiert.",
      ctaText: "Kostenlose KI-Potenzialanalyse sichern",
    },
  },

  immobilien: {
    slug: "immobilien",
    seoTitle: "Automatisierung für Immobilienunternehmen | KI-Automationen",
    seoDescription:
      "Lead-Qualifizierung, Follow-up und Objektakquise systematisieren. Vertrieb planbar machen statt Portal-Abhängigkeit. Kostenlose Potenzial-Analyse.",
    canonical: "/immobilien",
    hero: {
      headline: "Leads sind keine Abschlüsse.",
      problem: "Portale machen abhängig. Systeme machen frei.",
      solution: "KI-Systeme machen Ihren Vertrieb planbar.",
      badge: "Nur für Unternehmer ab 100.000 € Umsatz",
      ctaText: "Jetzt KI-Potenzial aufdecken",
    },
    problem: {
      yesPoints: [
        "Du bist Makler oder Verwalter mit echter Abschluss-Pipeline",
        "Lead-Qualität und Follow-up kosten dich Zeit und Nerven",
        "Du willst systematisch abschließen, nicht vom Portal abhängig sein",
        "Du bist bereit, operative Gewohnheiten zu ändern",
      ],
      noPoints: [
        "Du bist Hobby-Makler ohne echte Pipeline",
        "Du suchst nur neue Leads von Portalen",
        "Du willst weitermachen wie bisher",
        "Du erwartest Ergebnisse ohne Prozessarbeit",
      ],
      causesIntro:
        "Das echte Problem ist nicht der Markt – es ist fehlende Struktur im Vertrieb.",
      causes: [
        {
          icon: <Filter className="w-8 h-8" />,
          title: "Lead-Qualität schwankt",
          description:
            "Portal-Leads sind teuer und oft unqualifiziert. Kein System trennt die Spreu vom Weizen.",
        },
        {
          icon: <MessageSquare className="w-8 h-8" />,
          title: "Follow-up chaotisch",
          description:
            "Interessenten versanden, Nachfassen passiert zufällig. 80% der Leads gehen verloren.",
        },
        {
          icon: <Building className="w-8 h-8" />,
          title: "Objektakquise mühsam",
          description:
            "Eigentümer-Ansprache ohne System. Jeder Auftrag ist ein Einzelkampf.",
        },
      ],
    },
    faq: [
      {
        question: "Wie qualifiziert ihr Portal-Leads automatisch?",
        answer:
          "Eingehende Anfragen aus ImmoScout24, Immowelt & Co. werden via KI-Bot innerhalb 60 s qualifiziert (Budget, Finanzierung, Zeitachse). Nur echte Interessenten landen in deinem Kalender.",
      },
      {
        question: "Funktioniert das mit unserem CRM (z. B. onOffice, FlowFact)?",
        answer:
          "Ja. Wir integrieren mit allen gängigen Makler-CRMs per API. Leads, Status und Aktivitäten werden bidirektional synchronisiert.",
      },
      ...COMMON_FAQ,
    ],
    finalCta: {
      headline: "Bereit für KI-gestützte Effizienz?",
      subline:
        "Sichere dir jetzt deine kostenlose KI-Potenzialanalyse und erfahre, wie KI deinen Immobilien-Vertrieb automatisiert.",
      ctaText: "Kostenlose KI-Potenzialanalyse sichern",
    },
  },

  dienstleister: {
    slug: "dienstleister",
    seoTitle: "Automatisierung für Dienstleister | KI-Automationen",
    seoDescription:
      "Vertrieb und Prozesse für Agenturen und Berater systematisieren. Planbare Umsätze statt Auf und Ab. Kostenlose Potenzial-Analyse.",
    canonical: "/dienstleister",
    hero: {
      headline: "Wenn Umsatz von Ihnen abhängt, ist es kein Unternehmen.",
      problem: "Jeder Monat neu. Jeder Abschluss hängt an Ihnen.",
      solution: "KI-Systeme machen Ihre Prozesse reproduzierbar.",
      badge: "Nur für Unternehmen ab 100.000 € Umsatz",
      ctaText: "Jetzt KI-Potenzial aufdecken",
    },
    problem: {
      yesPoints: [
        "Du bist Agentur- oder Beratungsinhaber mit Team",
        "Dein Umsatz schwankt – jeder Monat ist ein Neustart",
        "Du willst Vertrieb systematisieren, nicht dem Zufall überlassen",
        "Du bist bereit, operative Gewohnheiten zu ändern",
      ],
      noPoints: [
        "Du bist Freelancer ohne Wachstumsziel",
        "Du suchst nur neue Leads oder Marketing-Tricks",
        "Du willst weitermachen wie bisher",
        "Du erwartest Ergebnisse ohne Strukturarbeit",
      ],
      causesIntro:
        "Das echte Problem ist nicht dein Angebot – es ist fehlende Struktur im Vertrieb.",
      causes: [
        {
          icon: <TrendingDown className="w-8 h-8" />,
          title: "Akquise ist Auf und Ab",
          description:
            "Mal läuft es, mal nicht. Kein planbarer Prozess, kein vorhersehbarer Umsatz.",
        },
        {
          icon: <DollarSign className="w-8 h-8" />,
          title: "Projekte laufen, Marge schrumpft",
          description:
            "Mehr Arbeit, weniger Gewinn. Scope Creep, unklare Prozesse, fehlende Grenzen.",
        },
        {
          icon: <User className="w-8 h-8" />,
          title: "In jedem Projekt selbst involviert",
          description:
            "Du bist der Engpass. Ohne dich läuft nichts – und Skalierung ist unmöglich.",
        },
      ],
    },
    faq: [
      {
        question: "Wie macht ihr unsere Akquise planbar?",
        answer:
          "Wir bauen einen Discovery-Funnel: Ideal-Kunden-Recherche, automatisierte Erstansprache und KI-vorqualifizierte Termine. Du startest jede Woche mit gefülltem Kalender — nicht leerem Postfach.",
      },
      {
        question: "Was ist mit Bestandskunden und Up-Selling?",
        answer:
          "Wir richten Account-Health-Tracking, automatische Re-Activation-Flows und KI-gestützte Up-Sell-Hinweise ein. So holst du systematisch Umsatz aus bestehenden Kunden.",
      },
      ...COMMON_FAQ,
    ],
    finalCta: {
      headline: "Bereit für KI-gestützte Effizienz?",
      subline:
        "Sichere dir jetzt deine kostenlose KI-Potenzialanalyse und erfahre, wie KI deine Prozesse automatisiert.",
      ctaText: "Kostenlose KI-Potenzialanalyse sichern",
    },
  },

  kurzzeitvermietung: {
    slug: "kurzzeitvermietung",
    seoTitle: "Automatisierung für Kurzzeitvermietung | KI-Automationen",
    seoDescription:
      "Anfragen, Reinigung und Check-in automatisieren. Skalierbare Prozesse für Kurzzeitvermieter mit 3+ Objekten. Kostenlose Potenzial-Analyse.",
    canonical: "/kurzzeitvermietung",
    hero: {
      headline: "Mehr Einheiten = mehr Stress?",
      problem: "Skalierung ohne Prozesse ist Chaos.",
      solution: "KI-Automatisierung macht Wachstum möglich.",
      badge: "Nur für Betreiber ab 100.000 € Umsatz",
      ctaText: "Jetzt KI-Potenzial aufdecken",
    },
    problem: {
      yesPoints: [
        "Du betreibst 3+ Objekte und willst weiter wachsen",
        "Anfragen, Reinigung und Check-in kosten dich Stunden",
        "Du willst automatisieren, nicht nur optimieren",
        "Du bist bereit, operative Gewohnheiten zu ändern",
      ],
      noPoints: [
        "Du bist privater Einzelvermieter ohne Wachstumsziel",
        "Du suchst nur einen neuen Channel-Manager",
        "Du willst weitermachen wie bisher",
        "Du erwartest Ergebnisse ohne Prozessarbeit",
      ],
      causesIntro:
        "Das echte Problem ist nicht die Auslastung – es ist fehlende Automatisierung.",
      causes: [
        {
          icon: <MessageSquare className="w-8 h-8" />,
          title: "Anfragen beantworten kostet Stunden",
          description:
            "Jede Buchung, jede Frage manuell. Keine Automatisierung, kein System.",
        },
        {
          icon: <Home className="w-8 h-8" />,
          title: "Reinigung/Check-in logistischer Alptraum",
          description:
            "Koordination zwischen Gästen, Reinigungskräften und dir selbst. Fehleranfällig und zeitintensiv.",
        },
        {
          icon: <TrendingDown className="w-8 h-8" />,
          title: "Auslastung schwankt stark",
          description:
            "Saisonabhängig, preisabhängig, zufallsabhängig. Kein System für konstante Buchungen.",
        },
      ],
    },
    faq: [
      {
        question: "Welche Channels und PMS unterstützt ihr?",
        answer:
          "Airbnb, Booking.com, VRBO sowie gängige PMS wie Smoobu, Hostaway, Lodgify und Guesty. Anbindung über native APIs oder Channel-Manager.",
      },
      {
        question: "Wie läuft der Check-in automatisch?",
        answer:
          "Gäste erhalten 24 h vor Anreise einen automatischen Check-in-Link mit Schlüsselcode (Smart Lock) oder Abholanleitung, Hausregeln und Anfahrt — mehrsprachig.",
      },
      ...COMMON_FAQ,
    ],
    finalCta: {
      headline: "Bereit für KI-gestützte Effizienz?",
      subline:
        "Sichere dir jetzt deine kostenlose KI-Potenzialanalyse und erfahre, wie KI dein Vermietungs-Business automatisiert.",
      ctaText: "Kostenlose KI-Potenzialanalyse sichern",
    },
  },
};

export const getIndustry = (slug: string): IndustryContent | undefined =>
  INDUSTRIES[slug];
