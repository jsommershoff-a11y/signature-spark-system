import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { Hero } from "@/components/landing/Hero";
import { TargetAudienceSection } from "@/components/landing/TargetAudienceSection";
import { RootCauseSection } from "@/components/landing/RootCauseSection";
import { SystemPhasesSection } from "@/components/landing/SystemPhasesSection";
import { StructogramUSPSection } from "@/components/landing/StructogramUSPSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Clock, Users, FileText } from "lucide-react";

const Praxen = () => {
  const navigate = useNavigate();

  const goToQualifizierung = () => navigate("/qualifizierung");

  // Branchenspezifische Target Audience
  const yesPoints = [
    "Du bist Praxisinhaber mit Team und Verantwortung",
    "Terminausfälle, Personal-Chaos und Verwaltung kosten dich Energie",
    "Du willst Systeme, die Planbarkeit schaffen",
    "Du bist bereit, operative Gewohnheiten zu ändern",
  ];

  const noPoints = [
    "Du bist angestellter Arzt ohne Entscheidungsmacht",
    "Du suchst nur eine neue Praxissoftware",
    "Du erwartest Veränderung ohne eigene Arbeit",
    "Du willst weitermachen wie bisher",
  ];

  // Branchenspezifische Root Causes
  const causes = [
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
  ];

  return (
    <PublicLayout>
      <Hero
        headline="Ihre Praxis läuft – aber nicht planbar?"
        problem="Medizinisch stark. Unternehmerisch ungeführt."
        solution="Mehr Patienten lösen kein Chaos. Systeme schon."
        subline=""
        badge="Nur für Praxisinhaber ab 100.000 € Umsatz"
        ctaText="Kostenloses Analysegespräch sichern"
        onCtaClick={goToQualifizierung}
      />

      <TargetAudienceSection yesPoints={yesPoints} noPoints={noPoints} />

      <RootCauseSection
        intro="Das echte Problem ist nicht der Patientenstrom – es ist fehlende Struktur in der Praxis."
        causes={causes}
      />

      <SystemPhasesSection />

      <StructogramUSPSection />

      <FinalCTA
        headline="Bereit für Struktur statt Chaos?"
        subline="Sichere dir jetzt dein kostenloses Analysegespräch und erfahre, wie deine Praxis planbar wird."
        ctaText="Jetzt Analysegespräch sichern"
        onCtaClick={goToQualifizierung}
      />
    </PublicLayout>
  );
};

export default Praxen;
