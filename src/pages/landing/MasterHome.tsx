import { useNavigate } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQSection";
import { SEOHead } from "@/components/landing/SEOHead";
import { ExitIntentPopup } from "@/components/landing/conversion/ExitIntentPopup";
import { FloatingCTA } from "@/components/landing/conversion/FloatingCTA";
import { StickyCtaBanner } from "@/components/landing/conversion/StickyCtaBanner";
import { HeroSection } from "@/components/landing/home/HeroSection";
import { TrustLogosSection } from "@/components/landing/home/TrustLogosSection";
import { EmotionalHookSection } from "@/components/landing/home/EmotionalHookSection";
import { FivePillarsSection } from "@/components/landing/home/FivePillarsSection";
import { SolutionSection } from "@/components/landing/home/SolutionSection";
import { OfferSection } from "@/components/landing/home/OfferSection";
import { AiAnalysisWidget } from "@/components/landing/home/AiAnalysisWidget";
import { CaseStudiesSection } from "@/components/landing/home/CaseStudiesSection";
import { ResultsSection } from "@/components/landing/home/ResultsSection";
import { AboutFounderSection } from "@/components/landing/home/AboutFounderSection";
import { TransformationFinancingSection } from "@/components/landing/home/TransformationFinancingSection";
import { FinalCtaSection } from "@/components/landing/home/FinalCtaSection";
import { AiRealitySection } from "@/components/landing/home/AiRealitySection";
import { CompetitionSection } from "@/components/landing/home/CompetitionSection";
import { VulnerabilitySection } from "@/components/landing/home/VulnerabilitySection";

const faqItems = [
  {
    question: "Funktioniert das auch in meiner Branche?",
    answer: "Ja. Unser Signature System ist branchenübergreifend erprobt – von Handwerk über Praxen bis zu Dienstleistern und Immobilien. Die Prozesse sind unterschiedlich, die Engpässe sind überall dieselben.",
  },
  {
    question: "Ich habe keine Zeit für so ein Projekt.",
    answer: "Genau deshalb brauchst du es. Wir übernehmen Setup und Umsetzung. Dein Zeitaufwand: ca. 30 Minuten pro Woche für ein kurzes Status-Update. Alles andere läuft.",
  },
  {
    question: "Was genau bekomme ich?",
    answer: "Ein funktionierendes operatives System: automatisierte Lead-Erfassung, Follow-ups, Aufgabenverteilung, Angebotsprozesse und Reporting. Plattform + persönliches Sparring – kein Kurs, kein Tool-Verkauf.",
  },
  {
    question: "Wie schnell sehe ich Ergebnisse?",
    answer: "Erste Automatisierungen laufen innerhalb von 7–14 Tagen. Messbare Einsparungen bei Zeit und Kosten sind typischerweise nach 30–60 Tagen sichtbar.",
  },
  {
    question: "Ist das nicht zu teuer?",
    answer: "Die Frage ist: Was kosten dich manuelle Prozesse jeden Monat? Die meisten Unternehmer verlieren 2.000–5.000 € monatlich durch Ineffizienz. Ein System, das das stoppt, ist keine Ausgabe – es ist eine Investition.",
  },
  {
    question: "Ich habe schon Tools ausprobiert, die nichts gebracht haben.",
    answer: "Tools allein lösen kein Problem. Wir verkaufen keine Tools – wir bauen Systeme. Der Unterschied: Alles ist vernetzt, automatisiert und auf dein Unternehmen zugeschnitten. Kein weiteres Tool im Regal.",
  },
];

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "KRS Signature",
  url: "https://krs-signature.de",
  description: "Automatisierung für Unternehmen – operative Systeme für Handwerk, Praxen, Dienstleister und Mittelstand.",
  founder: {
    "@type": "Person",
    name: "Jan Sommershoff",
  },
  areaServed: {
    "@type": "Country",
    name: "Germany",
  },
  serviceType: ["Unternehmensautomatisierung", "KI-Integration", "Prozessoptimierung"],
};

const MasterHome = () => {
  const navigate = useNavigate();
  const handleCTAClick = () => navigate("/qualifizierung");

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="KRS Signature – Automatisierung für Unternehmen | Prozesse digitalisieren & KI nutzen"
        description="Prozesse automatisieren, Mitarbeiter entlasten, Umsatz steigern. KRS Signature baut operative Systeme für Handwerk, Praxen, Dienstleister und Mittelstand. Keine Chatbots – echte Ergebnisse."
        canonical="/"
        jsonLd={organizationJsonLd}
      />
      <Header />
      <StickyCtaBanner />

      <main className="flex-1 pt-16">
        <HeroSection onCtaClick={handleCTAClick} />
        <TrustLogosSection />
        <EmotionalHookSection />
        <FivePillarsSection />
        <SolutionSection />
        <AiRealitySection />
        <CompetitionSection />
        <VulnerabilitySection onCtaClick={handleCTAClick} />
        <OfferSection onCtaClick={handleCTAClick} />
        <AiAnalysisWidget />
        <CaseStudiesSection />
        <ResultsSection />
        <TransformationFinancingSection />
        <AboutFounderSection />

        <FAQSection
          headline="Häufige Fragen – ehrlich beantwortet"
          items={faqItems}
        />

        <FinalCtaSection onCtaClick={handleCTAClick} />
      </main>

      <Footer />
      <FloatingCTA />
      <ExitIntentPopup />
    </div>
  );
};

export default MasterHome;
