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
        <BranchenSection />
        <CaseStudiesSection />

        <FAQSection
          headline="Häufige Fragen – ehrlich beantwortet"
          items={faqItems}
        />

        <FinalCtaSection onCtaClick={handleCTAClick} />
      </main>

      <Footer />
    </div>
  );
};

export default MasterHome;
