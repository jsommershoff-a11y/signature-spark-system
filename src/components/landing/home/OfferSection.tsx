import { BookOpen, Handshake, ArrowRight } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";
import founderEntlasten from "@/assets/founder-entlasten.png";

interface OfferSectionProps {
  onCtaClick: () => void;
}

export const OfferSection = ({ onCtaClick }: OfferSectionProps) => {
  return (
    <section className={`${t.sectionPadding} bg-gradient-to-b from-muted/20 to-background`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className={`${t.headline.h2} text-foreground text-center mb-5`}>
          Dein Signature System – zwei Wege:
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Warte nicht. Jeder Tag ohne System kostet dich Stunden und Umsatz.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className={`${t.card} text-center relative`}>
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-5" />
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">1. Du setzt es selbst um</p>
            <p className="text-foreground font-semibold text-lg mb-3">Struktur lernen & eigenständig automatisieren</p>
            <p className="text-muted-foreground leading-relaxed text-sm mb-4">
              Du bekommst eine klare Schritt-für-Schritt-Anleitung und setzt alles in deinem Tempo um.
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              Du sparst Geld, investierst aber Zeit.
            </p>
          </div>
          <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/3 shadow-[0_4px_24px_rgba(246,113,31,0.1)] hover:shadow-[0_4px_32px_rgba(246,113,31,0.15)] transition-all duration-300 p-7 text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-light text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full shadow-md">
              EMPFOHLEN
            </div>
            <Handshake className="w-12 h-12 text-primary mx-auto mb-5" />
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">2. Wir setzen es gemeinsam um</p>
            <p className="text-foreground font-semibold text-lg mb-3">Done-with-you in 30 Tagen</p>
            <p className="text-muted-foreground leading-relaxed text-sm mb-4">
              Wir bauen dein System mit dir auf – direkt in deinem Unternehmen, angepasst an deine Prozesse. Ergebnisse ab Tag 1.
            </p>
            <p className="text-sm font-semibold text-primary">
              Du investierst einmal, sparst ab Tag 1.
            </p>
          </div>
        </div>

        {/* Visual Banner */}
        <div className="mb-12 rounded-3xl overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.08)] border border-border/30">
          <img
            src={founderEntlasten}
            alt="Jan Sommershoff – Mitarbeiter entlasten und stärken durch bessere Prozesse und Automatisierung"
            className="w-full h-auto"
          />
        </div>

        <div className="text-center">
          <button onClick={onCtaClick} className={`${t.ctaPrimary} group hover:scale-[1.02] transition-transform duration-300`}>
            Kostenlose Potenzial-Analyse sichern
            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-sm text-muted-foreground mt-4">
            Kostenlos und unverbindlich • Sofort Ergebnis
          </p>
        </div>
      </div>
    </section>
  );
};
