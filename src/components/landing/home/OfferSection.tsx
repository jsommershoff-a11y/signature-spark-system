import { BookOpen, Handshake, ArrowRight } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

interface OfferSectionProps {
  onCtaClick: () => void;
}

export const OfferSection = ({ onCtaClick }: OfferSectionProps) => {
  return (
    <section className={`${t.sectionPadding} bg-muted/30`}>
      <div className="max-w-4xl mx-auto px-4">
        <h2 className={`${t.headline.h2} text-foreground text-center mb-4`}>
          Dein Signature System – zwei Wege:
        </h2>
        <p className="text-center text-muted-foreground mb-10 text-lg">
          Warte nicht. Jeder Tag ohne System kostet dich Stunden und Umsatz.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className={`${t.card} text-center relative`}>
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">1. Du setzt es selbst um</p>
            <p className="text-foreground font-medium mb-2">Struktur lernen & eigenständig automatisieren</p>
            <p className="text-muted-foreground leading-relaxed text-sm mb-3">
              Du bekommst eine klare Schritt-für-Schritt-Anleitung und setzt alles in deinem Tempo um.
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              Du sparst Geld, investierst aber Zeit.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 shadow-md hover:shadow-lg transition-all p-6 text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
              EMPFOHLEN
            </div>
            <Handshake className="w-10 h-10 text-primary mx-auto mb-4" />
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">2. Wir setzen es gemeinsam um</p>
            <p className="text-foreground font-medium mb-2">Done-with-you in 30 Tagen</p>
            <p className="text-muted-foreground leading-relaxed text-sm mb-3">
              Wir bauen dein System mit dir auf – direkt in deinem Unternehmen, angepasst an deine Prozesse. Ergebnisse ab Tag 1.
            </p>
            <p className="text-sm font-semibold text-primary">
              Du investierst einmal, sparst ab Tag 1.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button onClick={onCtaClick} className={`${t.ctaPrimary} group`}>
            Kostenlose Potenzial-Analyse sichern
            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-sm text-muted-foreground mt-3">
            Kostenlos und unverbindlich • Sofort Ergebnis
          </p>
        </div>
      </div>
    </section>
  );
};
