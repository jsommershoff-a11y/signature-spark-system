import { CTAButton } from "./CTAButton";
import { landingTokens } from "@/styles/landing-tokens";

interface HeroProps {
  headline: string;
  subline: string;
  ctaText: string;
  onCtaClick: () => void;
  /** Optional problem statement below headline */
  problem?: string;
  /** Optional solution statement */
  solution?: string;
  /** Optional revenue badge (e.g., "Nur für Unternehmer ab 100.000 € Umsatz") */
  badge?: string;
  /** Analytics: CTA-Quelle/Funnel (Default: "qualifizierung") */
  trackingCta?: string;
}

export const Hero = ({ 
  headline, 
  subline, 
  ctaText, 
  onCtaClick,
  problem,
  solution,
  badge,
  trackingCta = "qualifizierung",
}: HeroProps) => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-background via-muted to-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-light/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Revenue Badge */}
          {badge && (
            <span className={`${landingTokens.badgeAccent} mb-6`}>
              {badge}
            </span>
          )}
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 mt-4">
            {headline}
          </h1>
          
          {/* Problem Statement */}
          {problem && (
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-4 max-w-3xl mx-auto">
              {problem}
            </p>
          )}
          
          {/* Solution Statement */}
          {solution && (
            <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed mb-6 max-w-3xl mx-auto">
              {solution}
            </p>
          )}
          
          {/* Original Subline (if no problem/solution) */}
          {!problem && !solution && (
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-3xl mx-auto">
              {subline}
            </p>
          )}
          
          {/* Subline when problem/solution are present */}
          {(problem || solution) && subline && (
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              {subline}
            </p>
          )}
          
          <CTAButton onClick={onCtaClick} trackingStage="hero" trackingCta={trackingCta}>
            {ctaText}
          </CTAButton>
        </div>
      </div>
    </section>
  );
};
