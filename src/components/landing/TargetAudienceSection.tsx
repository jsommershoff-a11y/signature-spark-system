import { Check, X } from "lucide-react";
import { landingTokens } from "@/styles/landing-tokens";

interface TargetAudienceSectionProps {
  yesPoints?: string[];
  noPoints?: string[];
}

const defaultYesPoints = [
  "Du machst bereits 100.000 € Jahresumsatz oder mehr",
  "Du bist Geschäftsführer oder Inhaber mit Entscheidungsmacht",
  "Du willst Systeme – nicht noch mehr Arbeit im Kopf",
  "Du bist bereit, Dinge zu verändern, nicht nur zu konsumieren",
];

const defaultNoPoints = [
  "Du suchst ein weiteres Coaching oder einen Online-Kurs",
  "Du willst magische Abkürzungen ohne Struktur",
  "Du bist nicht bereit, operative Gewohnheiten zu ändern",
  "Du brauchst jemanden, der dir sagt, was du hören willst",
];

export const TargetAudienceSection = ({
  yesPoints = defaultYesPoints,
  noPoints = defaultNoPoints,
}: TargetAudienceSectionProps) => {
  return (
    <section className={`${landingTokens.sectionPadding} bg-background`}>
      <div className={landingTokens.container}>
        <div className="text-center mb-12">
          <h2 className={`${landingTokens.headline.h2} text-foreground mb-4`}>
            Ist das hier für dich?
          </h2>
          <p className={`${landingTokens.text.body} max-w-2xl mx-auto`}>
            KI-Automationen ist nicht für jeden. Wir arbeiten nur mit Unternehmern,
            die bereit sind, echte Veränderung zuzulassen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* YES Column */}
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6">
            <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
              <Check className="w-6 h-6" />
              Ja, wenn...
            </h3>
            <ul className="space-y-4">
              {yesPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* NO Column */}
          <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-6">
            <h3 className="text-xl font-semibold text-destructive mb-6 flex items-center gap-2">
              <X className="w-6 h-6" />
              Nein, wenn...
            </h3>
            <ul className="space-y-4">
              {noPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
