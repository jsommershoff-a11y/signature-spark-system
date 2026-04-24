import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEOHead } from "@/components/landing/SEOHead";
import { Hero } from "@/components/landing/Hero";
import { TargetAudienceSection } from "@/components/landing/TargetAudienceSection";
import { RootCauseSection } from "@/components/landing/RootCauseSection";
import { SystemPhasesSection } from "@/components/landing/SystemPhasesSection";
import { StructogramUSPSection } from "@/components/landing/StructogramUSPSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { TrendingDown, DollarSign, User } from "lucide-react";

const Dienstleister = () => {
  const navigate = useNavigate();

  const goToQualifizierung = () => navigate("/qualifizierung");

  // Branchenspezifische Target Audience
  const yesPoints = [
    "Du bist Agentur- oder Beratungsinhaber mit Team",
    "Dein Umsatz schwankt – jeder Monat ist ein Neustart",
    "Du willst Vertrieb systematisieren, nicht dem Zufall überlassen",
    "Du bist bereit, operative Gewohnheiten zu ändern",
  ];

  const noPoints = [
    "Du bist Freelancer ohne Wachstumsziel",
    "Du suchst nur neue Leads oder Marketing-Tricks",
    "Du willst weitermachen wie bisher",
    "Du erwartest Ergebnisse ohne Strukturarbeit",
  ];

  // Branchenspezifische Root Causes
  const causes = [
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
  ];

  return (
    <PublicLayout>
      <SEOHead
        title="Automatisierung für Dienstleister | KI Automationen"
        description="Vertrieb und Prozesse für Agenturen und Berater systematisieren. Planbare Umsätze statt Auf und Ab. Kostenlose Potenzial-Analyse."
        canonical="/dienstleister"
      />
      <Hero
        headline="Wenn Umsatz von Ihnen abhängt, ist es kein Unternehmen."
        problem="Jeder Monat neu. Jeder Abschluss hängt an Ihnen."
        solution="KI-Systeme machen Ihre Prozesse reproduzierbar."
        subline=""
        badge="Nur für Unternehmen ab 100.000 € Umsatz"
        ctaText="Jetzt KI-Potenzial aufdecken"
        onCtaClick={goToQualifizierung}
      />

      <TargetAudienceSection yesPoints={yesPoints} noPoints={noPoints} />

      <RootCauseSection
        intro="Das echte Problem ist nicht dein Angebot – es ist fehlende Struktur im Vertrieb."
        causes={causes}
      />

      <SystemPhasesSection />

      <StructogramUSPSection />

      <FinalCTA
        headline="Bereit für KI-gestützte Effizienz?"
        subline="Sichere dir jetzt deine kostenlose KI-Potenzialanalyse und erfahre, wie KI deine Prozesse automatisiert."
        ctaText="Kostenlose KI-Potenzialanalyse sichern"
        onCtaClick={goToQualifizierung}
      />
    </PublicLayout>
  );
};

export default Dienstleister;
