import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { Hero } from "@/components/landing/Hero";
import { TargetAudienceSection } from "@/components/landing/TargetAudienceSection";
import { RootCauseSection } from "@/components/landing/RootCauseSection";
import { SystemPhasesSection } from "@/components/landing/SystemPhasesSection";
import { StructogramUSPSection } from "@/components/landing/StructogramUSPSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { MessageSquare, Home, TrendingDown } from "lucide-react";

const Kurzzeitvermietung = () => {
  const navigate = useNavigate();

  const goToQualifizierung = () => navigate("/qualifizierung");

  // Branchenspezifische Target Audience
  const yesPoints = [
    "Du betreibst 3+ Objekte und willst weiter wachsen",
    "Anfragen, Reinigung und Check-in kosten dich Stunden",
    "Du willst automatisieren, nicht nur optimieren",
    "Du bist bereit, operative Gewohnheiten zu ändern",
  ];

  const noPoints = [
    "Du bist privater Einzelvermieter ohne Wachstumsziel",
    "Du suchst nur einen neuen Channel-Manager",
    "Du willst weitermachen wie bisher",
    "Du erwartest Ergebnisse ohne Prozessarbeit",
  ];

  // Branchenspezifische Root Causes
  const causes = [
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
  ];

  return (
    <PublicLayout>
      <Hero
        headline="Mehr Einheiten = mehr Stress?"
        problem="Skalierung ohne Prozesse ist Chaos."
        solution="Automatisierung ist Voraussetzung – kein Luxus."
        subline=""
        badge="Nur für Betreiber ab 100.000 € Umsatz"
        ctaText="Kostenloses Analysegespräch sichern"
        onCtaClick={goToQualifizierung}
      />

      <TargetAudienceSection yesPoints={yesPoints} noPoints={noPoints} />

      <RootCauseSection
        intro="Das echte Problem ist nicht die Auslastung – es ist fehlende Automatisierung."
        causes={causes}
      />

      <SystemPhasesSection />

      <StructogramUSPSection />

      <FinalCTA
        headline="Bereit für Struktur statt Chaos?"
        subline="Sichere dir jetzt dein kostenloses Analysegespräch und erfahre, wie dein Vermietungs-Business automatisiert wächst."
        ctaText="Jetzt Analysegespräch sichern"
        onCtaClick={goToQualifizierung}
      />
    </PublicLayout>
  );
};

export default Kurzzeitvermietung;
