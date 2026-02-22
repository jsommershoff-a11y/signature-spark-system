import { ArrowRight } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const steps = [
  {
    num: "1",
    title: "Kostenlose Potenzial-Analyse (45 Min.)",
    text: "In einem direkten Gespräch analysieren wir dein Unternehmen, decken die größten Wachstumshebel und Systemlücken auf und definieren ein klares Ziel.",
  },
  {
    num: "2",
    title: "Strategie-Entwicklung",
    text: "Basierend auf der Analyse entwickle ich eine maßgeschneiderte Strategie, die auf den 5 Säulen aufbaut und dir einen klaren 90-Tage-Plan an die Hand gibt.",
  },
  {
    num: "3",
    title: "Umsetzung & Begleitung",
    text: "Wir setzen den Plan gemeinsam um. Du erhältst nicht nur die Systeme, sondern auch das Wissen, um sie selbstständig zu steuern und dein Unternehmen auf das nächste Level zu heben.",
  },
];

export const ProcessStepsSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className={t.container}>
        <h2 className={`${t.headline.h2} text-foreground text-center mb-14`}>
          In 3 Schritten zu einem systemgesteuerten Unternehmen
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {steps.map((s, i) => (
            <div key={s.num} className="relative flex flex-col items-center text-center">
              {/* Number badge */}
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4 shadow-lg">
                {s.num}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{s.text}</p>

              {/* Arrow between steps (desktop only) */}
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-3 top-7 w-6 h-6 text-primary" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
