import { BookOpen, Sparkles, Rocket, ArrowRight } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";
import founderEntlasten from "@/assets/founder-entlasten.png";

interface OfferSectionProps {
  onCtaClick: () => void;
}

// Stripe Payment Links — nach Setup hier die echten Links einsetzen
const STRIPE_LINK_EXPRESS = "https://buy.stripe.com/9B6eVd2A52E89p9cUN5wI00";
const STRIPE_LINK_SETUP_ANZAHLUNG = "https://buy.stripe.com/6oUdR98YtemQ30L2g95wI01";
const STRIPE_LINK_SETUP_VOLL = "https://buy.stripe.com/fZu9AT5Mh5QkdFp6wp5wI02";

export const OfferSection = ({ onCtaClick }: OfferSectionProps) => {
  return (
    <section className={`${t.sectionPadding} bg-gradient-to-b from-muted/20 to-background`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className={`${t.headline.h2} text-foreground text-center mb-5`}>
          Drei Wege, je nach Tiefe – fester Preis, kein Sales-Pitch
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Wähle, was zu deiner Situation passt. Vorabzahlung per Stripe – Termin direkt nach Zahlungseingang.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12 items-stretch">

          {/* Karte 1: Kostenlose Analyse */}
          <div className={`${t.card} text-center flex flex-col`}>
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Erst mal sehen
            </p>
            <p className="text-foreground font-semibold text-lg mb-2">
              Kostenlose Potenzial-Analyse
            </p>
            <p className="text-3xl font-bold text-foreground mb-1">0 €</p>
            <p className="text-xs text-muted-foreground mb-4">unverbindlich</p>
            <p className="text-muted-foreground leading-relaxed text-sm mb-6 flex-1">
              30 Min Gespräch. Ich zeige dir, wo bei dir konkret Hebel liegen – ohne Tool-Demo, ohne Verkaufs-Druck.
            </p>
            <button
              onClick={onCtaClick}
              className="text-primary font-semibold text-sm hover:underline mt-auto"
            >
              Termin vereinbaren →
            </button>
          </div>

          {/* Karte 2: KI-Klarheits-Call (EMPFOHLEN) */}
          <div className="rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-primary/3 shadow-[0_4px_24px_rgba(246,113,31,0.12)] hover:shadow-[0_4px_32px_rgba(246,113,31,0.2)] transition-all duration-300 p-7 text-center relative flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-light text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full shadow-md whitespace-nowrap">
              EMPFOHLEN
            </div>
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Wenn du Klarheit willst
            </p>
            <p className="text-foreground font-semibold text-lg mb-2">
              KI-Klarheits-Call
            </p>
            <p className="text-3xl font-bold text-foreground mb-1">490 €</p>
            <p className="text-xs text-muted-foreground mb-4">brutto, einmalig</p>
            <p className="text-muted-foreground leading-relaxed text-sm mb-6 flex-1">
              90 Min 1:1 + schriftlicher 5-Punkte-Plan, was bei dir mit Claude/MCP/Agents konkret automatisierbar ist. Inkl. Aufwand-/Nutzen-Schätzung pro Punkt.
            </p>
            <a
              href={STRIPE_LINK_EXPRESS}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-deep hover:to-primary text-primary-foreground font-semibold text-base px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2 mt-auto"
            >
              Jetzt buchen <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Karte 3: Produktiv-Setup */}
          <div className={`${t.card} text-center flex flex-col`}>
            <Rocket className="w-10 h-10 text-foreground mx-auto mb-4" />
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Wenn du loslegen willst
            </p>
            <p className="text-foreground font-semibold text-lg mb-2">
              KI-Produktiv-Setup
            </p>
            <p className="text-3xl font-bold text-foreground mb-1">2.490 €</p>
            <p className="text-xs text-muted-foreground mb-4">brutto · 50/50 Anzahlung</p>
            <p className="text-muted-foreground leading-relaxed text-sm mb-6 flex-1">
              2–3 Tage: Claude Code + 2–3 MCP-Server in deinem Stack + 1–2 Agent-Workflows + 90-Min-Schulung mit deinem Team.
            </p>
            <div className="flex flex-col gap-2 mt-auto">
              <a
                href={STRIPE_LINK_SETUP_ANZAHLUNG}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-foreground text-background hover:bg-foreground/90 font-semibold text-base px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                Anzahlung 1.245 € <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={STRIPE_LINK_SETUP_VOLL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
              >
                oder Vollzahlung 2.490 €
              </a>
            </div>
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

        <p className="text-center text-sm text-muted-foreground">
          Du bist unsicher, was passt?{" "}
          <button
            onClick={onCtaClick}
            className="text-primary underline underline-offset-4 hover:text-primary-light transition-colors font-medium"
          >
            Buche die kostenlose Analyse
          </button>{" "}
          – wir klären's in 30 Min.
        </p>
      </div>
    </section>
  );
};
