import { landingTokens as t } from "@/styles/landing-tokens";

interface FinalCtaSectionProps {
  onCtaClick: () => void;
}

export const FinalCtaSection = ({ onCtaClick }: FinalCtaSectionProps) => {
  const handleScrollDown = () => {
    const el = document.getElementById("problem-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className={t.sectionPadding}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className={`${t.headline.h2} text-foreground mb-10`}>
          Du hast zwei Optionen:
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-10 text-left">
          <div className="bg-muted/50 rounded-2xl p-6 border border-border/40">
            <p className="font-bold text-foreground mb-3">Option 1:</p>
            <p className="text-foreground mb-2">Du machst weiter wie bisher</p>
            <p className="text-muted-foreground">
              → mehr Stress, mehr Chaos, mehr Abhängigkeit
            </p>
          </div>
          <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary/30">
            <p className="font-bold text-foreground mb-3">Option 2:</p>
            <p className="text-foreground mb-2">Du baust ein System, das dich entlastet</p>
            <p className="text-muted-foreground">
              → mehr Struktur, mehr Zeit, mehr Kontrolle
            </p>
          </div>
        </div>

        <p className="text-lg text-muted-foreground mb-8">
          Die Entscheidung liegt bei dir.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={handleScrollDown} className="border-2 border-border text-foreground font-semibold text-lg px-8 py-4 rounded-xl hover:bg-muted/50 transition-all">
            Automatisierungen verstehen
          </button>
          <button onClick={onCtaClick} className={t.ctaPrimary}>
            Automatisierungen gemeinsam umsetzen
          </button>
        </div>
      </div>
    </section>
  );
};
