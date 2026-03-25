import { XCircle } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const points = [
  {
    title: "Keine klare Struktur",
    text: "Aufgaben entstehen, aber niemand weiß, wer was bis wann erledigt.",
  },
  {
    title: "Keine automatisierten Abläufe",
    text: "Jeder Handgriff passiert manuell und fehleranfällig.",
  },
  {
    title: "Keine saubere Organisation",
    text: "Informationen liegen verstreut, Übergaben gehen verloren.",
  },
];

export const FivePillarsSection = () => {
  return (
    <section className={`${t.sectionPadding} bg-gradient-to-b from-muted/20 to-background`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className={`${t.headline.h2} text-foreground mb-12`}>
          Die meisten Unternehmen haben:
        </h2>

        <div className="space-y-4 mb-12 max-w-xl mx-auto">
          {points.map((point) => (
            <div key={point.title} className="flex items-start gap-4 p-6 bg-gradient-to-r from-destructive/5 to-transparent rounded-2xl border border-destructive/15 text-left">
              <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground text-lg font-semibold">{point.title}</p>
                <p className="text-muted-foreground mt-1">{point.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-lg text-muted-foreground">Alles läuft manuell.</p>
          <p className="text-lg text-muted-foreground">Alles läuft über den Unternehmer.</p>
          <p className="text-xl md:text-2xl font-bold text-foreground mt-5">
            Und genau deshalb wächst dein Unternehmen nicht.
          </p>
        </div>
      </div>
    </section>
  );
};
