import { XCircle } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const points = [
  "keine klare Struktur",
  "keine automatisierten Abläufe",
  "keine saubere Organisation",
];

export const FivePillarsSection = () => {
  return (
    <section className={`${t.sectionPadding} bg-muted/30`}>
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className={`${t.headline.h2} text-foreground mb-10`}>
          Die meisten Unternehmen haben:
        </h2>

        <div className="space-y-4 mb-10 max-w-md mx-auto">
          {points.map((point) => (
            <div key={point} className="flex items-center gap-4 p-4 bg-destructive/5 rounded-xl border border-destructive/20">
              <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
              <p className="text-foreground text-lg text-left">{point}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-lg text-muted-foreground">Alles läuft manuell.</p>
          <p className="text-lg text-muted-foreground">Alles läuft über den Unternehmer.</p>
          <p className="text-xl font-semibold text-foreground mt-4">
            Und genau deshalb entsteht Chaos.
          </p>
        </div>
      </div>
    </section>
  );
};
