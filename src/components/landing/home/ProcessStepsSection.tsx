import { landingTokens as t } from "@/styles/landing-tokens";

interface ProcessStepsSectionProps {
  onCtaClick: () => void;
}

const steps = [
  {
    num: "1",
    title: "Analyse",
    text: "Wir identifizieren Engpässe, Abhängigkeiten und Datenbrüche.",
  },
  {
    num: "2",
    title: "System-Mapping",
    text: "Wir erfassen, wie Informationen, Prozesse und Zuständigkeiten tatsächlich laufen.",
  },
  {
    num: "3",
    title: "Priorisierung",
    text: "Wir definieren, was zuerst systematisiert und automatisiert werden muss.",
  },
  {
    num: "4",
    title: "Umsetzung",
    text: "Wir bauen klare Abläufe, Dokumentation und sinnvolle Automatisierungen.",
  },
  {
    num: "5",
    title: "Übergabe",
    text: "Du bekommst ein System, das nachvollziehbar, nutzbar und skalierbar ist.",
  },
];

export const ProcessStepsSection = ({ onCtaClick }: ProcessStepsSectionProps) => {
  return (
    <section className={`${t.sectionPadding} bg-gradient-to-b from-background to-muted/20`}>
      <div className={t.container}>
        <h2 className={`${t.headline.h2} text-foreground text-center mb-14`}>
          So läuft die Zusammenarbeit
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto mb-14">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mb-4 shadow-lg">
                {s.num}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={onCtaClick} className={t.ctaPrimary}>
            Kostenlose Potenzial-Analyse
          </button>
          <p className="text-xs text-muted-foreground mt-3">
            Kein Agentur-Theater. Klare Prioritäten und umsetzbare Struktur.
          </p>
        </div>
      </div>
    </section>
  );
};
