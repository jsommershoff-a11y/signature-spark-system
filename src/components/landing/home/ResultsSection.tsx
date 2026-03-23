import { CheckCircle } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const results = [
  "sparen täglich Zeit",
  "verlieren keine Anfragen mehr",
  "arbeiten strukturierter",
  "entlasten sich selbst und ihr Team",
];

export const ResultsSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className={`${t.headline.h2} text-foreground mb-10`}>
          Unternehmen, die ihre Prozesse automatisieren:
        </h2>

        <div className="space-y-4 mb-10 text-left max-w-xl mx-auto">
          {results.map((r) => (
            <div key={r} className="flex items-center gap-4">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
              <p className="text-lg text-foreground">{r}</p>
            </div>
          ))}
        </div>

        <p className="text-lg text-muted-foreground mb-2">Und vor allem:</p>
        <p className="text-xl md:text-2xl font-semibold text-foreground">
          Sie gewinnen wieder Kontrolle über ihr Unternehmen.
        </p>
      </div>
    </section>
  );
};
