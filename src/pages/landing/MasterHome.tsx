import { useNavigate } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQSection";
import { ExitIntentPopup } from "@/components/landing/conversion/ExitIntentPopup";
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

const faqItems = [
  {
    question: "Funktioniert das auch in meiner Branche?",
    answer: "Ja. Unser System ist branchenübergreifend erprobt – von Handwerk über Praxen bis zu Dienstleistern und Immobilien. Wir passen die Strategie individuell an deine Geschäftsprozesse an.",
  },
  {
    question: "Wie schnell sehe ich Ergebnisse?",
    answer: "Die meisten Partner sehen erste Effizienzgewinne innerhalb von 14–30 Tagen. Messbare Einsparungen bei Zeit und Kosten sind typischerweise nach 60–90 Tagen dokumentiert.",
  },
  {
    question: "Muss ich selbst viel tun?",
    answer: "Wir übernehmen Setup, Optimierung und laufende Betreuung. Du investierst ca. 30 Minuten pro Woche für ein kurzes Status-Update.",
  },
  {
    question: "Was passiert in der Potenzial-Analyse?",
    answer: "In 45 Minuten analysieren wir gemeinsam dein Unternehmen, decken die größten Wachstumshebel auf und definieren einen klaren nächsten Schritt. Kein Verkaufsdruck, garantiert.",
  },
  {
    question: "Ist das nicht zu teuer für ein kleines Unternehmen?",
    answer: "Die Frage ist: Was kostet dich der manuelle Aufwand jeden Monat? Die meisten Unternehmer sparen durch Systematisierung ein Vielfaches der Investition – an Zeit und Personalkosten.",
  },
];

const MasterHome = () => {
  const navigate = useNavigate();
  const handleCTAClick = () => navigate("/qualifizierung");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <HeroSection onCtaClick={handleCTAClick} />
        <TrustLogosSection />
        <EmotionalHookSection />
        <FivePillarsSection />
        <SolutionSection />
        <AiRealitySection />
        <CompetitionSection />
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
      <ExitIntentPopup />
    </div>
  );
};

export default MasterHome;
