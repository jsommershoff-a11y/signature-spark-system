import { CheckCircle } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const points = [
  "Keine Anfrage geht mehr verloren – egal ob sie per E-Mail, Formular oder WhatsApp kommt",
  "Kein Follow-up wird mehr vergessen – dein System erinnert automatisch",
  "Dein Team weiß immer, was als Nächstes zu tun ist – ohne Rückfragen",
  "Prozesse laufen zuverlässig im Hintergrund – du greifst nur noch ein, wenn du willst",
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
          <p className="text-xl font-semibold text-foreground">
            Weniger Chaos. Weniger Abhängigkeit. Mehr Kontrolle über dein Unternehmen.
          </p>
        </div>
      </div>
    </section>
  );
};
