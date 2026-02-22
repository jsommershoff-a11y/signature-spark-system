import { useNavigate } from "react-router-dom";
import { Play, Star } from "lucide-react";
import founderPortrait from "@/assets/founder-portrait.jpeg";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { landingTokens as t } from "@/styles/landing-tokens";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export const HeroSection = ({ onCtaClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${founderPortrait})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/70 to-foreground/90" />

      <div className={`${t.container} relative z-10 py-20`}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white mb-6">
            Die 5 unternehmerischen Fesseln, die dich aktuell davon abhalten, dein Unternehmen wirklich zu skalieren.
          </h1>
          <h2 className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 font-normal leading-relaxed">
            Wie du durch ein bewährtes System aus dem operativen Stress ausbrichst, deinen Gewinn planbar steigerst und als Unternehmer wieder frei wirst.
          </h2>

          {/* Video placeholder */}
          <div className="max-w-3xl mx-auto mb-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <AspectRatio ratio={16 / 9}>
              <div
                className="w-full h-full bg-cover bg-center relative cursor-pointer group"
                style={{ backgroundImage: `url(${founderPortrait})` }}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
            </AspectRatio>
          </div>

          {/* CTA */}
          <button onClick={onCtaClick} className={`${t.ctaPrimary} mb-6`}>
            Jetzt kostenlose Potenzial-Analyse buchen
          </button>

          {/* Social proof */}
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
