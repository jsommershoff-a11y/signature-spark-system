import { Brain, GitBranch, Eye } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

interface EmotionalHookSectionProps {
  onCtaClick: () => void;
}

const problems = [
  {
    icon: Brain,
    title: "Wissen steckt in Personen statt in Prozessen",
    text: "Wenn Wissen nicht dokumentiert ist, wird jede Veränderung zum Risiko.",
  },
  {
    icon: GitBranch,
    title: "Übergaben erzeugen Reibung statt Geschwindigkeit",
    text: "Manuelle Abstimmungen kosten Zeit, Qualität und Marge.",
  },
  {
    icon: Eye,
    title: "Zahlen, Zuständigkeiten und Entscheidungen sind verteilt",
    text: "Wer sein Unternehmen nicht im eigenen System abbildet, führt im Blindflug.",
  },
];

export const EmotionalHookSection = ({ onCtaClick }: EmotionalHookSectionProps) => {
  return (
    <section id="problem-section" className={t.sectionPadding}>
      <div className={t.container}>
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className={`${t.headline.h2} text-foreground mb-5`}>
            Das Problem ist nicht fehlende KI. Das Problem ist fehlende Systemkontrolle.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            In vielen Unternehmen liegt entscheidendes Wissen nicht im Prozess, sondern in Köpfen, Postfächern, WhatsApp-Nachrichten, Excel-Dateien oder bei externen Dienstleistern. Genau dadurch entstehen Rückfragen, Verzögerungen, Abhängigkeiten und operative Blindheit.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {problems.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border/40 bg-card p-7 flex flex-col"
            >
              <p.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={onCtaClick} className={t.ctaPrimary}>
            Kostenlose Potenzial-Analyse
          </button>
        </div>
      </div>
    </section>
  );
};
