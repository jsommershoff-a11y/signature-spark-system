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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${founderPortrait})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/70 to-foreground/90" />

      <div className={`${t.container} relative z-10 py-20`}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white mb-6">
            Jeder Tag ohne Automatisierung kostet dich Geld, Kunden und Wachstum.
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-4 leading-relaxed">
            Die meisten Unternehmen verlieren 2.000–5.000 € monatlich durch ineffiziente Prozesse. Jede Stunde, die du mit manuellen Abläufen verbringst, fehlt dir für Umsatz, Führung und strategische Entscheidungen.
          </p>

          <p className="text-xl md:text-2xl font-bold text-white mb-3">
            Dein Unternehmen funktioniert nur, solange du es tust.
            <br />
            <span className="text-primary">Genau das ist das Problem.</span>
          </p>

          <p className="text-sm text-white/50 mb-8 tracking-wide">
            Keine Chatbots. Keine Tools. Ein System, das funktioniert.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <button onClick={handleScrollDown} className="border-2 border-white/40 text-white font-semibold text-lg px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
              System verstehen
            </button>
            <button onClick={onCtaClick} className={t.ctaPrimary}>
              Signature System aufbauen
            </button>
          </div>

          <p className="text-xs text-white/50 mb-6">
            Kostenlos und unverbindlich • Dauert nur 2 Minuten
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-white/70">
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
