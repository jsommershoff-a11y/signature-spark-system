import { Search, Layout, Database, Target, Crown, Rocket } from "lucide-react";
import { landingTokens } from "@/styles/landing-tokens";

interface Phase {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface SystemPhasesSectionProps {
  phases?: Phase[];
}

const defaultPhases: Phase[] = [
  {
    number: 1,
    icon: <Search className="w-6 h-6" />,
    title: "Diagnose",
    description:
      "Wir analysieren dein Unternehmen: Wo blockiert es? Welche Systeme fehlen? Was kostet dich täglich Geld?",
  },
  {
    number: 2,
    icon: <Layout className="w-6 h-6" />,
    title: "Struktur",
    description:
      "Klare Prozesse für Vertrieb, Fulfillment und Führung. Alles dokumentiert, nichts mehr im Kopf.",
  },
  {
    number: 3,
    icon: <Database className="w-6 h-6" />,
    title: "CRM Setup",
    description:
      "Dein zentrales System für Leads, Kunden und Follow-ups. Automatisiert, nicht manuell.",
  },
  {
    number: 4,
    icon: <Target className="w-6 h-6" />,
    title: "Vertriebssystem",
    description:
      "Lead → Gespräch → Angebot → Abschluss. Ein planbarer Prozess statt Zufallstreffer.",
  },
  {
    number: 5,
    icon: <Crown className="w-6 h-6" />,
    title: "Führung",
    description:
      "KPIs, Dashboards und Routinen für dein Team. Du führst mit Daten, nicht mit Bauchgefühl.",
  },
  {
    number: 6,
    icon: <Rocket className="w-6 h-6" />,
    title: "Skalierung",
    description:
      "Systeme, die wachsen können. Neue Mitarbeiter, mehr Kunden – ohne dass du der Engpass bist.",
  },
];

export const SystemPhasesSection = ({
  phases = defaultPhases,
}: SystemPhasesSectionProps) => {
  return (
    <section className={`${landingTokens.sectionPadding} bg-background`}>
      <div className={landingTokens.container}>
        <div className="text-center mb-12">
          <span className={`${landingTokens.badgeAccent} mb-4`}>
            Das KI Automationen System
          </span>
          <h2 className={`${landingTokens.headline.h2} text-foreground mb-4 mt-4`}>
            6 Phasen zur operativen Freiheit
          </h2>
          <p className={`${landingTokens.text.body} max-w-2xl mx-auto`}>
            Kein Kurs, kein Coaching, keine Agentur. Ein strukturierter Eingriff
            in dein Unternehmen – mit messbaren Ergebnissen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {phases.map((phase) => (
            <div
              key={phase.number}
              className={`${landingTokens.card} relative overflow-hidden group`}
            >
              {/* Phase Number Background */}
              <div className="absolute -top-4 -right-4 text-8xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                {phase.number}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {phase.icon}
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    Phase {phase.number}
                  </span>
                </div>

                <h3 className={`${landingTokens.headline.h3} text-foreground mb-2`}>
                  {phase.title}
                </h3>
                <p className={landingTokens.text.body}>{phase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
