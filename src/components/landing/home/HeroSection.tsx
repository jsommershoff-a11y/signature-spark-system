import { Star } from "lucide-react";
import founderPortrait from "@/assets/founder-hero.jpeg";
import { landingTokens as t } from "@/styles/landing-tokens";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export const HeroSection = ({ onCtaClick }: HeroSectionProps) => {
  const handleScrollDown = () => {
    const el = document.getElementById("problem-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${founderPortrait})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1419]/85 via-[#0f1419]/70 to-[#0f1419]/95" />

      <div className={`${t.container} relative z-10 py-24`}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-white mb-7">
            Jeder Tag ohne Automatisierung kostet dich Geld, Kunden und Wachstum.
          </h1>
          <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-5 leading-relaxed">
            Die meisten Unternehmen verlieren 2.000–5.000 € monatlich durch ineffiziente Prozesse. Jede Stunde, die du mit manuellen Abläufen verbringst, fehlt dir für Umsatz, Führung und strategische Entscheidungen.
          </p>

          <p className="text-xl md:text-2xl font-bold text-white mb-3">
            Dein Unternehmen funktioniert nur, solange du es tust.
            <br />
            <span className="text-primary">Genau das ist das Problem.</span>
          </p>

          <p className="text-sm text-white/40 mb-10 tracking-wide">
            Keine Chatbots. Keine Tools. Ein System, das funktioniert.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
            <button onClick={handleScrollDown} className="border border-white/20 text-white font-semibold text-lg px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300">
              System verstehen
            </button>
            <button onClick={onCtaClick} className={t.ctaPrimary}>
              Signature System aufbauen
            </button>
          </div>

          <p className="text-xs text-white/40 mb-10">
            Kostenlos und unverbindlich • Dauert nur 2 Minuten
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-white/60">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <span>Bereits über 150+ Unternehmern geholfen, ihre Prozesse zu systematisieren.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
