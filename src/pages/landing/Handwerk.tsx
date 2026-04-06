import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEOHead } from "@/components/landing/SEOHead";
import { Hero } from "@/components/landing/Hero";
import { TargetAudienceSection } from "@/components/landing/TargetAudienceSection";
import { RootCauseSection } from "@/components/landing/RootCauseSection";
import { SystemPhasesSection } from "@/components/landing/SystemPhasesSection";
import { StructogramUSPSection } from "@/components/landing/StructogramUSPSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Brain, Users, TrendingDown } from "lucide-react";

const Handwerk = () => {
  const navigate = useNavigate();

  const goToQualifizierung = () => navigate("/qualifizierung");

  // Branchenspezifische Target Audience
  const yesPoints = [
    "Du bist Handwerksmeister mit Team und voller Auftragslage",
    "Dein Betrieb läuft – aber das Chaos wächst mit",
    "Du willst Prozesse, die ohne dich funktionieren",
    "Du bist bereit, operative Gewohnheiten zu ändern",
  ];

  const noPoints = [
    "Du bist Solo-Handwerker ohne Wachstumsziel",
    "Du suchst nur ein neues Tool oder eine App",
    "Du willst weitermachen wie bisher – nur einfacher",
    "Du erwartest magische Lösungen ohne Veränderung",
  ];

  // Branchenspezifische Root Causes
  const causes = [
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
  ];

  return (
    <PublicLayout>
      <SEOHead
        title="Automatisierung für Handwerksbetriebe | KRS Signature"
        description="Prozesse im Handwerk systematisieren: Terminplanung, Angebotswesen und Mitarbeiterführung automatisieren. Kostenlose Potenzial-Analyse für Handwerksmeister."
        canonical="/handwerk"
      />
      <Hero
        headline="Volle Auftragsbücher – aber der Betrieb frisst dich auf?"
        problem="Ihr Problem ist nicht Arbeit. Ihr Problem ist fehlende Struktur."
        solution="KI-gestützte Prozesse führen den Betrieb – nicht Sie allein."
        subline=""
        badge="Nur für Unternehmer ab 100.000 € Umsatz"
        ctaText="Jetzt KI-Potenzial aufdecken"
        onCtaClick={goToQualifizierung}
      />

      <TargetAudienceSection yesPoints={yesPoints} noPoints={noPoints} />

      <RootCauseSection
        intro="Das echte Problem ist nicht die Arbeit – es ist fehlende Struktur im Betrieb."
        causes={causes}
      />

      <SystemPhasesSection />

      <StructogramUSPSection />

      <FinalCTA
        headline="Bereit für KI-gestützte Effizienz?"
        subline="Sichere dir jetzt deine kostenlose KI-Potenzialanalyse und erfahre, wie KI deine Betriebsprozesse automatisiert."
        ctaText="Kostenlose KI-Potenzialanalyse sichern"
        onCtaClick={goToQualifizierung}
      />
    </PublicLayout>
  );
};

export default Handwerk;
