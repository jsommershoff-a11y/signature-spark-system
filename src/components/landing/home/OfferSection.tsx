import { landingTokens as t } from "@/styles/landing-tokens";

interface OfferSectionProps {
  onCtaClick: () => void;
}

export const OfferSection = ({ onCtaClick }: OfferSectionProps) => {
  return (
    <section className={`${t.sectionPadding} bg-muted/30`}>
      <div className="max-w-4xl mx-auto px-4">
        <h2 className={`${t.headline.h2} text-foreground text-center mb-10`}>
          Du hast zwei Möglichkeiten:
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className={`${t.card} text-center`}>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">1. Du setzt es selbst um</p>
            <p className="text-muted-foreground leading-relaxed">
              Du bekommst eine klare Struktur und lernst Schritt für Schritt, wie du dein Unternehmen automatisierst.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 shadow-sm hover:shadow-md transition-all p-6 text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">2. Wir setzen es gemeinsam um</p>
            <p className="text-muted-foreground leading-relaxed">
              Wir bauen dein System mit dir auf – direkt in deinem Unternehmen, angepasst an deine Prozesse.
            </p>
          </div>
        </div>

        <p className="text-center text-lg text-muted-foreground mb-8">
          Du entscheidest, wie tief du einsteigen willst.
        </p>

        <div className="text-center">
          <button onClick={onCtaClick} className={t.ctaPrimary}>
            Automatisierungen gemeinsam umsetzen
          </button>
        </div>
      </div>
    </section>
  );
};
