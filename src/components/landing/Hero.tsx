import { CTAButton } from "./CTAButton";

interface HeroProps {
  headline: string;
  subline: string;
  ctaText: string;
  onCtaClick: () => void;
}

export const Hero = ({ headline, subline, ctaText, onCtaClick }: HeroProps) => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-background via-muted to-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-light/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-8">
            {headline}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-3xl mx-auto">
            {subline}
          </p>
          
          <CTAButton onClick={onCtaClick}>
            {ctaText}
          </CTAButton>
        </div>
      </div>
    </section>
  );
};
