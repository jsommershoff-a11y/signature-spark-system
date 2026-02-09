import { Brain, Users, TrendingDown } from "lucide-react";
import { landingTokens } from "@/styles/landing-tokens";

interface RootCause {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface RootCauseSectionProps {
  intro?: string;
  causes?: RootCause[];
}

const defaultCauses: RootCause[] = [
  {
    icon: <Brain className="w-8 h-8" />,
    title: "Alles läuft über deinen Kopf",
    description:
      "Kein System, kein CRM, kein Prozess. Jeder Auftrag ist ein Einzelfall. Du bist der Engpass.",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Dein Team macht, was es will",
    description:
      "Keine klaren Abläufe, keine Verantwortlichkeiten. Du musst alles selbst kontrollieren – oder es passieren Fehler.",
  },
  {
    icon: <TrendingDown className="w-8 h-8" />,
    title: "Vertrieb ist Zufall, nicht System",
    description:
      "Leads kommen rein, aber ohne strukturierten Prozess versanden 80%. Abschlüsse sind Glückssache.",
  },
];

export const RootCauseSection = ({
  intro = "Das echte Problem ist nicht dein Produkt, deine Branche oder der Markt.",
  causes = defaultCauses,
}: RootCauseSectionProps) => {
  return (
    <section className={`${landingTokens.sectionPadding} bg-muted/30`}>
      <div className={landingTokens.container}>
        <div className="text-center mb-12">
          <h2 className={`${landingTokens.headline.h2} text-foreground mb-4`}>
            Die wahre Ursache
          </h2>
          <p className={`${landingTokens.text.body} max-w-2xl mx-auto text-xl`}>
            {intro}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {causes.map((cause, index) => (
            <div
              key={index}
              className={`${landingTokens.card} text-center hover:border-primary/40 transition-colors`}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                {cause.icon}
              </div>
              <h3 className={`${landingTokens.headline.h3} text-foreground mb-3`}>
                {cause.title}
              </h3>
              <p className={landingTokens.text.body}>{cause.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-xl font-semibold text-primary">
            Die Lösung ist nicht mehr Arbeit – sondern bessere Struktur.
          </p>
        </div>
      </div>
    </section>
  );
};
