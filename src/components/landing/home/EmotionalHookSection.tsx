import { X } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const problems = [
  "Kundenanfragen liegen in WhatsApp, E-Mail und Excel verteilt",
  "Follow-ups werden vergessen, weil niemand sie trackt",
  "Dein Team fragt dich bei jeder Kleinigkeit, weil es keine klaren Abläufe gibt",
  "Angebote werden zu spät geschickt, weil der Prozess manuell ist",
  "Informationen stecken in Köpfen statt in Systemen",
  "Ohne dich steht alles still",
];

export const EmotionalHookSection = () => {
  return (
    <section id="problem-section" className={t.sectionPadding}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className={`${t.headline.h2} text-foreground text-center mb-5`}>
          Du bist nicht gestartet, um der beste Mitarbeiter in deinem eigenen Unternehmen zu sein.
        </h2>
        <p className="text-center text-lg text-muted-foreground mb-12">
          Aber genau das ist passiert:
        </p>

        <div className="space-y-3 mb-12">
          {problems.map((problem) => (
            <div
              key={problem}
              className="flex items-start gap-4 p-5 bg-gradient-to-r from-destructive/5 to-transparent rounded-2xl border border-destructive/15"
            >
              <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-foreground text-lg font-medium">{problem}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-lg text-muted-foreground mb-2">
          Und egal wie viel du arbeitest – es wird nicht wirklich leichter.
        </p>
        <div className="text-center space-y-1">
          <p className="text-lg text-muted-foreground">Das Problem ist nicht dein Einsatz.</p>
          <p className="text-2xl md:text-4xl font-bold text-foreground mt-5">
            Das Problem ist: Dir fehlt ein funktionierendes System.
          </p>
          <p className="text-lg text-muted-foreground mt-3">
            Und jeder Tag ohne System kostet dich bares Geld.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Unternehmen, die wir begleiten, gewinnen jede Woche mehrere Stunden zurück.
          </p>
        </div>

        {/* Pattern Break */}
        <div className="mt-12 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] text-white rounded-3xl py-10 px-8 text-center shadow-[0_0_60px_rgba(246,113,31,0.08)]">
          <p className="text-2xl md:text-4xl font-bold">
            Ohne System bist du der Engpass.
          </p>
        </div>
      </div>
    </section>
  );
};
