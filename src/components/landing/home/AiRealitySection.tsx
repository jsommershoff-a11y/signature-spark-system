import { FileText, Database, Users, ArrowRightLeft } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

interface AiRealitySectionProps {
  onCtaClick: () => void;
}

const checklist = [
  { icon: FileText, text: "Dokumentierte Prozesse" },
  { icon: Database, text: "Zentrale Informationen im eigenen System" },
  { icon: Users, text: "Klare Zuständigkeiten" },
  { icon: ArrowRightLeft, text: "Saubere Inputs und Outputs für Automatisierungen" },
];

export const AiRealitySection = ({ onCtaClick }: AiRealitySectionProps) => {
  return (
    <section className={`${t.sectionPadding} bg-gradient-to-b from-muted/20 to-background`}>
      <div className={t.container}>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className={`${t.headline.h2} text-foreground mb-5`}>
            Wenn du die KI-Chance nutzen willst, musst du zuerst alles über dein eigenes Unternehmen wissen.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            KI bringt nur dann einen echten Vorteil, wenn deine Informationen sauber erfasst, zugänglich und strukturiert sind. Wer interne Abläufe, Verantwortlichkeiten, Übergaben und Wissen nicht im eigenen System hält, automatisiert am Ende nur Unklarheit.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto mb-12">
          {checklist.map((item) => (
            <div
              key={item.text}
              className="rounded-2xl border border-primary/15 bg-primary/5 p-6 text-center flex flex-col items-center"
            >
              <item.icon className="w-7 h-7 text-primary mb-3" />
              <p className="text-foreground font-medium text-sm leading-snug">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-foreground font-semibold mb-8">
            Erst Struktur. Dann Automatisierung. Dann KI mit Wirkung.
          </p>
          <button onClick={onCtaClick} className={t.ctaPrimary}>
            Kostenlose Potenzial-Analyse
          </button>
        </div>
      </div>
    </section>
  );
};
