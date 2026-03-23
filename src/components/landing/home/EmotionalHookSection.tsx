import { AlertCircle } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const problems = [
  "Du bist in jedem Prozess involviert",
  "Entscheidungen bleiben an dir hängen",
  "Dein Team wartet auf dich",
  "Dinge gehen unter oder werden vergessen",
];

export const EmotionalHookSection = () => {
  return (
    <section id="problem-section" className={t.sectionPadding}>
      <div className="max-w-3xl mx-auto px-4">
        <h2 className={`${t.headline.h2} text-foreground text-center mb-4`}>
          Du bist nicht gestartet, um der beste Mitarbeiter in deinem eigenen Unternehmen zu sein.
        </h2>
        <p className="text-center text-lg text-muted-foreground mb-10">
          Aber genau das ist passiert:
        </p>

        <div className="space-y-4 mb-10">
          {problems.map((problem) => (
            <div
              key={problem}
              className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border/50 shadow-sm"
            >
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-foreground text-lg">{problem}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-lg text-muted-foreground mb-2">
          Und egal wie viel du arbeitest – es wird nicht wirklich leichter.
        </p>
        <div className="text-center space-y-1">
          <p className="text-lg text-muted-foreground">Das Problem ist nicht dein Einsatz.</p>
          <p className="text-xl font-semibold text-foreground">
            Das Problem ist: Dir fehlt ein funktionierendes System.
          </p>
        </div>
      </div>
    </section>
  );
};
