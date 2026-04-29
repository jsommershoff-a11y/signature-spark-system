import { useNavigate } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQSection";
import { SEOHead } from "@/components/landing/SEOHead";
import { StickyCtaBanner } from "@/components/landing/conversion/StickyCtaBanner";
import { HeroSection } from "@/components/landing/home/HeroSection";
import { TrustLogosSection } from "@/components/landing/home/TrustLogosSection";
import { EmotionalHookSection } from "@/components/landing/home/EmotionalHookSection";
import { VulnerabilitySection } from "@/components/landing/home/VulnerabilitySection";
import { AiRealitySection } from "@/components/landing/home/AiRealitySection";
import { ThreeStagesSection } from "@/components/landing/home/ThreeStagesSection";
import { ResultsSection } from "@/components/landing/home/ResultsSection";
import { ProcessStepsSection } from "@/components/landing/home/ProcessStepsSection";
import { BranchenSection } from "@/components/landing/home/BranchenSection";
import { CaseStudiesSection } from "@/components/landing/home/CaseStudiesSection";
import { FinalCtaSection } from "@/components/landing/home/FinalCtaSection";
import { FaqDirectCta } from "@/components/landing/home/FaqDirectCta";
import { ThirtyDayTimeline } from "@/components/landing/home/ThirtyDayTimeline";
import { SystemPeekSection } from "@/components/landing/home/SystemPeekSection";

const faqItems = [
  {
    question: "Was bedeutet Automatisierung für Unternehmen konkret?",
    answer: "Automatisierung bedeutet nicht einfach Tools einzuführen, sondern Prozesse, Informationen und Entscheidungen so zu strukturieren, dass wiederkehrende Abläufe zuverlässig, nachvollziehbar und skalierbar werden.",
  },
  {
    question: "Warum reichen einzelne KI-Tools allein nicht aus?",
    answer: "KI-Tools beschleunigen nur das, was bereits strukturiert vorliegt. Wenn Wissen, Zuständigkeiten und Daten nicht sauber organisiert sind, verstärkt KI eher Unklarheit als Wirkung.",
  },
  {
    question: "Warum müssen Informationen im eigenen System liegen?",
    answer: "Nur wenn Prozesse, Dokumentation und Unternehmenswissen im eigenen System liegen, behältst du Kontrolle, reduzierst Abhängigkeiten und kannst Automatisierungen sinnvoll aufbauen.",
  },
  {
    question: "Für welche Unternehmen ist KI-Automationen geeignet?",
    answer: "Für Unternehmen, die operative Abhängigkeiten reduzieren, Prozesse dokumentieren, Übergaben verbessern und KI oder Automatisierung auf einer belastbaren Struktur aufbauen wollen.",
  },
  {
    question: "Was passiert in der kostenlosen Potenzial-Analyse?",
    answer: "In der Analyse schauen wir auf Engpässe, Abhängigkeiten, Informationsflüsse und mögliche Hebel. Du bekommst klare Prioritäten statt einer generischen Tool-Empfehlung.",
  },
  {
    question: "Wie schnell kann man erste Verbesserungen sehen?",
    answer: "Erste Klarheit entsteht meist sofort in der Analyse. Die Geschwindigkeit der Umsetzung hängt davon ab, wie verteilt Informationen, Prozesse und Verantwortlichkeiten aktuell sind.",
  },
  {
    question: "Wie schnell reagierst du auf eine Anfrage?",
    answer: "Anfragen über das Formular oder per E-Mail beantworte ich in der Regel innerhalb von 24 Stunden an Werktagen, häufig noch am selben Tag. Den Termin für die kostenlose Potenzial-Analyse legen wir meist innerhalb von 3 bis 5 Werktagen fest. Während laufender Projekte gelten kürzere, vertraglich vereinbarte Reaktionszeiten.",
  },
  {
    question: "Wie geht es nach den 30 Tagen Begleitung weiter?",
    answer: "Die 30 Tage nach Go-Live sind dafür da, dein Team sicher in das neue System zu bringen: Fragen klären, Feinjustierungen vornehmen, Prozesse stabilisieren. Danach hast du drei Optionen: (1) Du arbeitest eigenständig weiter – das System ist so dokumentiert, dass dein Team es ohne mich betreiben kann. (2) Du wechselst in einen schlanken Wartungs- und Support-Vertrag mit definierten Reaktionszeiten. (3) Wir gehen in eine langfristige Zusammenarbeit über, in der wir dein System schrittweise ausbauen und neue Automatisierungen ergänzen. Welche Variante zu dir passt, entscheiden wir gemeinsam vor Ablauf der 30 Tage – ohne automatische Verlängerung.",
  },
  {
    question: "Wir haben das schon mit einem Freelancer versucht – warum klappt das jetzt anders?",
    answer: "Weil wir nicht bei den Tools anfangen, sondern bei deinen Prozessen. Die meisten Freelancer bauen Workflows auf einem unklaren Fundament – und dann hängt das System an dieser einen Person. Wir dokumentieren erst, automatisieren danach und übergeben am Ende ein nachvollziehbares System, das auch ohne uns weiterläuft.",
  },
  {
    question: "Was ist der Unterschied zu einer Digitalagentur oder einem IT-Dienstleister?",
    answer: "Eine Agentur baut, was du bestellst. Wir hinterfragen zuerst, ob du das Richtige bestellst. IT-Dienstleister verwalten deine Tools – wir verändern, wie dein Unternehmen arbeitet. Du bekommst keine 80-seitige Konzeption, sondern eine umgesetzte Struktur.",
  },
  {
    question: "Wo laufen meine Daten?",
    answer: "Auf einem dedizierten Server in Deutschland bzw. der EU, den wir für dich aufsetzen – kein Cloud-Lock-in, keine Abhängigkeit von US-Anbietern. Du bist Inhaber deiner Daten, deiner Workflows und deiner Backups. DSGVO-konform von Tag 1, inklusive Auftragsverarbeitungsvertrag.",
  },
  {
    question: "Was kostet das? Womit muss ich rechnen?",
    answer: "Die Potenzial-Analyse ist kostenlos. Projekte starten typischerweise bei einem Festpreis im mittleren vierstelligen Bereich für einzelne Workflows und gehen bis zu fünfstelligen Implementierungen für ein komplettes Systemsetup. Den genauen Rahmen besprechen wir transparent nach der Analyse – kein Pauschalpreis, ohne deinen echten Bedarf zu kennen.",
  },
  {
    question: "Wie lange dauert ein typisches Projekt?",
    answer: "Von Analyse bis Go-Live rechne mit 8–12 Wochen, abhängig davon, wie verteilt deine Informationen heute sind. Erste sichtbare Ergebnisse bekommst du oft schon nach 3–4 Wochen, weil wir Prozesse priorisieren, die schnellen Hebel bringen.",
  },
  {
    question: "Müssen mein Team und ich technisch fit sein?",
    answer: "Nein. Du musst keinen Code schreiben, keinen Server verwalten und keine API verstehen. Wir bauen das System, schulen dein Team mit Loom-Videos und Live-Sessions und sind 30 Tage nach Go-Live für Fragen erreichbar.",
  },
  {
    question: "Was, wenn mein Team das System nicht annimmt?",
    answer: "Das ist der häufigste Grund, warum Automatisierungen scheitern. Deshalb beziehen wir die Schlüsselpersonen schon im System-Mapping ein – nicht erst beim Rollout. Wer mitgestaltet, blockiert nicht.",
  },
  {
    question: "Wie stellst du sicher, dass das System für mich und mein Team wirklich nutzbar ist?",
    answer: "Indem ich nichts baue, was nur ich verstehe. Konkret: (1) Ich beziehe die Schlüsselpersonen aus deinem Team schon im System-Mapping ein – sie sehen, wie die Logik entsteht, statt sie am Ende vorgesetzt zu bekommen. (2) Jeder Workflow wird in deiner Sprache dokumentiert (Loom-Video + schriftliche Schritt-für-Schritt-Anleitung), nicht in Tech-Jargon. (3) Ich baue bewusst nur Lösungen, die ich auch ohne KI selbst betreiben würde – keine Black Box, keine versteckten Abhängigkeiten. (4) Vor dem Go-Live machen wir eine gemeinsame Testphase, in der dein Team das System unter echten Bedingungen nutzt und Feedback einfließt. (5) In den 30 Tagen nach Go-Live justieren wir nach, was im Alltag hakt. Das Ergebnis: ein System, das dein Team versteht, kontrolliert und ohne mich weiterbetreiben kann.",
  },
];

const BASE_URL = "https://ki-automationen.io";

const jsonLdSchemas: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "KI-Automationen",
    url: BASE_URL,
    description: "KI-Automationen systematisiert Prozesse, Wissen und Übergaben, damit Unternehmen Automatisierung und KI sinnvoll nutzen können.",
    founder: { "@type": "Person", name: "Jan Sommershoff" },
    areaServed: { "@type": "Country", name: "Germany" },
    serviceType: ["Unternehmensautomatisierung", "Prozesssystematisierung", "KI-Integration"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KI-Automationen",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: "Hauptnavigation",
    hasPart: [
      { "@type": "WebPage", name: "Handwerk", url: `${BASE_URL}/handwerk` },
      { "@type": "WebPage", name: "Praxen", url: `${BASE_URL}/praxen` },
      { "@type": "WebPage", name: "Dienstleister", url: `${BASE_URL}/dienstleister` },
      { "@type": "WebPage", name: "Immobilien", url: `${BASE_URL}/immobilien` },
      { "@type": "WebPage", name: "Kurzzeitvermietung", url: `${BASE_URL}/kurzzeitvermietung` },
      { "@type": "WebPage", name: "Kostenlose Potenzial-Analyse", url: `${BASE_URL}/qualifizierung` },
      { "@type": "WebPage", name: "Community", url: `${BASE_URL}/community` },
    ],
  },
];

const MasterHome = () => {
  const navigate = useNavigate();
  const handleCTAClick = () => navigate("/qualifizierung");

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Automatisierung für Unternehmen | Informationen im eigenen System"
        description="KI-Automationen systematisiert Prozesse, Wissen und Übergaben, damit Unternehmen Automatisierung und KI sinnvoll nutzen können. Kostenlose Potenzial-Analyse."
        canonical="/"
        jsonLd={jsonLdSchemas}
      />
      <Header />
      <StickyCtaBanner />

      <main className="flex-1 pt-16">
        <HeroSection onCtaClick={handleCTAClick} />
        <TrustLogosSection />
        <EmotionalHookSection onCtaClick={handleCTAClick} />
        <AiRealitySection onCtaClick={handleCTAClick} />
        <ThreeStagesSection />
        <VulnerabilitySection onCtaClick={handleCTAClick} />
        <ResultsSection />
        <ProcessStepsSection onCtaClick={handleCTAClick} />
        <SystemPeekSection />
        <BranchenSection />
        <CaseStudiesSection />

        <FAQSection
          headline="Häufige Fragen – ehrlich beantwortet"
          items={faqItems}
        />

        <ThirtyDayTimeline />


        <FaqDirectCta onCtaClick={handleCTAClick} />

        <FinalCtaSection onCtaClick={handleCTAClick} />
      </main>

      <Footer />
    </div>
  );
};

export default MasterHome;
