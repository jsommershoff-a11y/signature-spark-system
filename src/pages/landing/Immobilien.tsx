import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEOHead } from "@/components/landing/SEOHead";
import { Hero } from "@/components/landing/Hero";
import { TargetAudienceSection } from "@/components/landing/TargetAudienceSection";
import { RootCauseSection } from "@/components/landing/RootCauseSection";
import { SystemPhasesSection } from "@/components/landing/SystemPhasesSection";
import { StructogramUSPSection } from "@/components/landing/StructogramUSPSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Filter, MessageSquare, Building } from "lucide-react";

const Immobilien = () => {
  const navigate = useNavigate();

  const goToQualifizierung = () => navigate("/qualifizierung");

  // Branchenspezifische Target Audience
  const yesPoints = [
    "Du bist Makler oder Verwalter mit echter Abschluss-Pipeline",
    "Lead-Qualität und Follow-up kosten dich Zeit und Nerven",
    "Du willst systematisch abschließen, nicht vom Portal abhängig sein",
    "Du bist bereit, operative Gewohnheiten zu ändern",
  ];

  const noPoints = [
    "Du bist Hobby-Makler ohne echte Pipeline",
    "Du suchst nur neue Leads von Portalen",
    "Du willst weitermachen wie bisher",
    "Du erwartest Ergebnisse ohne Prozessarbeit",
  ];

  // Branchenspezifische Root Causes
  const causes = [
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
  ];

  return (
    <PublicLayout>
      <SEOHead
        title="Automatisierung für Immobilienunternehmen | KRS Signature"
        description="Lead-Qualifizierung, Follow-up und Objektakquise systematisieren. Vertrieb planbar machen statt Portal-Abhängigkeit. Kostenlose Potenzial-Analyse."
        canonical="/immobilien"
      />
      <Hero
        headline="Leads sind keine Abschlüsse."
        problem="Portale machen abhängig. Systeme machen frei."
        solution="KI-Systeme machen Ihren Vertrieb planbar."
        subline=""
        badge="Nur für Unternehmer ab 100.000 € Umsatz"
        ctaText="Jetzt KI-Potenzial aufdecken"
        onCtaClick={goToQualifizierung}
      />

      <TargetAudienceSection yesPoints={yesPoints} noPoints={noPoints} />

      <RootCauseSection
        intro="Das echte Problem ist nicht der Markt – es ist fehlende Struktur im Vertrieb."
        causes={causes}
      />

      <SystemPhasesSection />

      <StructogramUSPSection />

      <FinalCTA
        headline="Bereit für KI-gestützte Effizienz?"
        subline="Sichere dir jetzt deine kostenlose KI-Potenzialanalyse und erfahre, wie KI deinen Immobilien-Vertrieb automatisiert."
        ctaText="Kostenlose KI-Potenzialanalyse sichern"
        onCtaClick={goToQualifizierung}
      />
    </PublicLayout>
  );
};

export default Immobilien;
