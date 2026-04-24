import { Shield, Zap, GitBranch, TrendingUp } from "lucide-react";
import founderPortrait from "@/assets/founder-hero.jpeg";
import { landingTokens as t } from "@/styles/landing-tokens";

interface HeroSectionProps {
  onCtaClick: () => void;
}

const benefits = [
  { icon: Shield, text: "Weniger operative Abhängigkeit von einzelnen Personen" },
  { icon: Zap, text: "Schnellere Reaktionszeiten in Vertrieb und Service" },
  { icon: GitBranch, text: "Saubere Prozesse statt manueller Übergaben" },
  { icon: TrendingUp, text: "Mehr Planbarkeit für Wachstum und Skalierung" },
];

export const HeroSection = ({ onCtaClick }: HeroSectionProps) => {
  return (
    <section className="relative bg-gradient-to-b from-[#0f1419] via-[#0f1419] to-[#1a1a2e] overflow-hidden">
      <div className={`${t.container} relative z-10 py-20 md:py-28`}>
        <div className="grid md:grid-cols-[1fr_320px] gap-12 items-center max-w-6xl mx-auto">
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

            <p className="text-sm text-white/45 mb-8 max-w-2xl">
              Ein Steuerberater-Wechsel, ein Mitarbeiterausfall oder fehlende Dokumentation können dein Unternehmen in kurzer Zeit ausbremsen.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-3">
              <button onClick={onCtaClick} className={t.ctaPrimary}>
                Kostenlose Potenzial-Analyse
              </button>
            </div>
            <p className="text-xs text-white/40">
              30 Minuten. Klare Prioritäten. Keine Tool-Demo.
            </p>
          </div>

          {/* Right: Founder Trust Module */}
          <div className="hidden md:flex flex-col items-center">
            <img
              src={founderPortrait}
              alt="Jan Sommershoff – Gründer KI Automationen"
              className="w-48 h-48 rounded-2xl object-cover shadow-[0_8px_32px_rgba(0,0,0,0.3)] mb-5"
              width={192}
              height={192}
              loading="eager"
            />
            <p className="text-white font-semibold text-base">Jan Sommershoff</p>
            <p className="text-primary text-sm font-medium">KI Automationen</p>
            <p className="text-white/50 text-xs text-center mt-2 max-w-[260px] leading-relaxed">
              Systematisierung, Automatisierung und Skalierung für Unternehmen
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
