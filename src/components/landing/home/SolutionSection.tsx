import { CheckCircle } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const points = [
  "Neue Anfragen werden automatisch erfasst und organisiert",
  "Kunden bekommen automatisch Follow-ups",
  "Aufgaben entstehen automatisch für dich und dein Team",
  "Prozesse laufen im Hintergrund, ohne dass du ständig eingreifen musst",
];

export const SolutionSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className="max-w-3xl mx-auto px-4">
        <h2 className={`${t.headline.h2} text-foreground text-center mb-4`}>
          Wir bauen dir einfache Automatisierungen, die dein Unternehmen sofort entlasten.
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-10">
          So sieht das konkret aus:
        </p>

        <div className="space-y-4 mb-10">
          {points.map((point) => (
            <div key={point} className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-foreground text-lg">{point}</p>
            </div>
          ))}
        </div>

        <div className="text-center space-y-1">
          <p className="text-lg text-muted-foreground">Das Ziel ist nicht mehr Arbeit.</p>
          <p className="text-xl font-semibold text-foreground">
            Das Ziel ist: weniger Chaos, mehr Kontrolle.
          </p>
        </div>
      </div>
    </section>
  );
};
