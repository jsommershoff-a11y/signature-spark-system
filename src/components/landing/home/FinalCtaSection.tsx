import { landingTokens as t } from "@/styles/landing-tokens";

interface FinalCtaSectionProps {
  onCtaClick: () => void;
}

export const FinalCtaSection = ({ onCtaClick }: FinalCtaSectionProps) => {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
          Bist du bereit, dein Unternehmen wirklich zu steuern, statt von ihm gesteuert zu werden?
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-10 text-left">
          <div className="bg-muted/50 rounded-2xl p-6 border border-border/40">
            <p className="font-bold text-foreground mb-2">Option 1: Nichts tun</p>
            <p className="text-muted-foreground">
              Du schließt diese Seite und alles bleibt, wie es ist. Der Stress, der operative Druck, das ungenutzte Potenzial.
            </p>
          </div>
          <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary/30">
            <p className="font-bold text-foreground mb-2">Option 2: Jetzt handeln</p>
            <p className="text-muted-foreground">
              Du nimmst dir 45 Minuten Zeit für eine kostenlose Potenzial-Analyse, die dir mehr Klarheit bringen wird als die letzten 12 Monate. Deine Entscheidung.
            </p>
          </div>
        </div>

        <button onClick={onCtaClick} className={`${t.ctaPrimary} mb-4`}>
          Jetzt Termin für deine kostenlose Potenzial-Analyse sichern
        </button>
        <p className="text-sm text-muted-foreground">
          ✓ 100% kostenlos · ✓ Unverbindlich · ✓ Garantiert ohne Verkaufsdruck
        </p>
      </div>
    </section>
  );
};
