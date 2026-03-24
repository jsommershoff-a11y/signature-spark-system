import { CheckCircle, Search, Target, Zap, TrendingUp } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const points = [
  "Keine Anfrage geht mehr verloren – egal ob sie per E-Mail, Formular oder WhatsApp kommt",
  "Kein Follow-up wird mehr vergessen – dein System erinnert automatisch",
  "Dein Team weiß immer, was als Nächstes zu tun ist – ohne Rückfragen",
  "Prozesse laufen zuverlässig im Hintergrund – du greifst nur noch ein, wenn du willst",
];

const steps = [
  { icon: Search, label: "Analyse deiner Prozesse" },
  { icon: Target, label: "Größte Zeitfresser identifizieren" },
  { icon: Zap, label: "Erste Automatisierungen (7–14 Tage)" },
  { icon: TrendingUp, label: "Skalierung & Erweiterung" },
];

export const SolutionSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className="max-w-3xl mx-auto px-4">
        <h2 className={`${t.headline.h2} text-foreground text-center mb-4`}>
          Das Signature System entlastet dein Unternehmen sofort.
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

        {/* Mini-Prozess */}
        <div className="mb-10">
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
            So läuft es ab
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <div key={s.label} className="text-center p-4 rounded-xl bg-muted/50 border border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mx-auto mb-3">
                  {i + 1}
                </div>
                <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-foreground text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xl font-semibold text-foreground">
            Weniger Chaos. Weniger Abhängigkeit. Mehr Kontrolle über dein Unternehmen.
          </p>
        </div>
      </div>
    </section>
  );
};
