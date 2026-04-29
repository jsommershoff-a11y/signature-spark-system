import { Shield, Zap, GitBranch, TrendingUp, ShieldCheck, UserCheck, Clock, ArrowRight } from "lucide-react";
import founderPortrait from "@/assets/founder-hero.jpeg";
import { landingTokens as t } from "@/styles/landing-tokens";

interface HeroSectionProps {
  onCtaClick: () => void;
}

const benefits = [
  { icon: Shield, text: "Weniger operative Abhängigkeit von einzelnen Personen" },
  { icon: Zap, text: "Schnellere Reaktionszeiten – z. B. Lead-Antwort in unter 2 Min. statt 4 Std." },
  { icon: GitBranch, text: "Saubere Prozesse statt manueller Übergaben" },
  { icon: TrendingUp, text: "Mehr Planbarkeit für Wachstum und Skalierung" },
];

const trustBadges = [
  { icon: ShieldCheck, text: "DSGVO-konform · Eigener Server in der EU" },
  { icon: UserCheck, text: "Berater + Umsetzer in einer Person" },
  { icon: Clock, text: "30 Tage Begleitung nach Go-Live" },
];

const founderQuote = "Ich baue für meine Kunden nur Systeme, die ich selbst nutzen würde.";

export const HeroSection = ({ onCtaClick }: HeroSectionProps) => {
  const handleSecondaryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("vorgehen")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative bg-gradient-to-b from-[#0a2a20] via-[#0a2a20] to-[#0F3E2E] overflow-hidden">
      <div className={`${t.container} relative z-10 py-16 md:py-28`}>
        <div className="grid md:grid-cols-[1fr_320px] gap-10 md:gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Copy */}
          <div>
            <span className="inline-block text-primary text-sm font-semibold tracking-wide uppercase mb-4">
              Automatisierung für Unternehmen
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] text-white mb-6">
              Automatisierung für Unternehmen funktioniert erst, wenn deine Informationen im eigenen System liegen.
            </h1>

            <p className="text-base md:text-lg text-white/70 leading-relaxed mb-4 max-w-2xl">
              Solange Wissen, Prozesse und Entscheidungen in Köpfen, Chats oder bei externen Partnern hängen, beschleunigt KI nur Chaos. Wir systematisieren dein Unternehmen so, dass du Kontrolle, Geschwindigkeit und Skalierbarkeit zurückgewinnst.
            </p>

            <p className="text-sm text-white/45 mb-6 max-w-2xl">
              Ein Steuerberater-Wechsel, ein Mitarbeiterausfall oder fehlende Dokumentation können dein Unternehmen in kurzer Zeit ausbremsen.
            </p>

            {/* Trust Badges */}
            <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mb-8">
              {trustBadges.map((b) => (
                <li
                  key={b.text}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs sm:text-[13px] text-white/85 backdrop-blur-sm"
                >
                  <b.icon className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden />
                  <span className="leading-tight">{b.text}</span>
                </li>
              ))}
            </ul>

            {/* Mobile Founder mini-card */}
            <div className="md:hidden flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 mb-6">
              <img
                src={founderPortrait}
                alt="Jan Sommershoff – Gründer KI-Automationen"
                className="w-14 h-14 rounded-xl object-cover shrink-0"
                width={56}
                height={56}
                loading="eager"
              />
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm">Jan Sommershoff</p>
                <p className="text-primary text-xs font-medium mb-1">KI-Automationen</p>
                <p className="text-white/60 text-xs italic leading-snug">„{founderQuote}"</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-3">
              <button onClick={onCtaClick} className={t.ctaPrimary}>
                Kostenlose Potenzial-Analyse
              </button>
            </div>
            <p className="text-xs text-white/40 mb-3">
              30 Minuten. Klare Prioritäten. Keine Tool-Demo.
            </p>

            <a
              href="#vorgehen"
              onClick={handleSecondaryClick}
              className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-primary underline underline-offset-4 decoration-white/30 hover:decoration-primary transition-colors"
            >
              <ArrowRight className="w-4 h-4" aria-hidden />
              So läuft die Zusammenarbeit ab
            </a>
            <p className="text-[11px] text-white/35 mt-2">
              30 Min · Ohne Verkaufsdruck · Kein Tool-Pitch
            </p>
          </div>

          {/* Right: Founder Trust Module (Desktop) */}
          <div className="hidden md:flex flex-col items-center">
            <img
              src={founderPortrait}
              alt="Jan Sommershoff – Gründer KI-Automationen"
              className="w-48 h-48 rounded-2xl object-cover shadow-[0_8px_32px_rgba(0,0,0,0.3)] mb-5"
              width={192}
              height={192}
              loading="eager"
            />
            <p className="text-white font-semibold text-base">Jan Sommershoff</p>
            <p className="text-primary text-sm font-medium">KI-Automationen</p>
            <p className="text-white/50 text-xs text-center mt-2 max-w-[260px] leading-relaxed">
              Systematisierung, Automatisierung und Skalierung für Unternehmen
            </p>
            <p className="text-white/70 text-xs italic text-center mt-3 max-w-[260px] leading-relaxed border-t border-white/10 pt-3">
              „{founderQuote}"
            </p>
          </div>
        </div>

        {/* Benefit Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-5xl mx-auto">
          {benefits.map((b) => (
            <div
              key={b.text}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 text-center"
            >
              <b.icon className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="text-white/80 text-sm font-medium leading-snug">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
