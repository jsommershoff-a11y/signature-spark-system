import { CTAButton } from "./CTAButton";

interface FinalCTAProps {
  headline: string;
  subline: string;
  ctaText: string;
  onCtaClick: () => void;
}

export const FinalCTA = ({ headline, subline, ctaText, onCtaClick }: FinalCTAProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-dark via-primary to-primary-deep relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            {headline}
          </h2>
          
          <p className="text-lg text-primary-foreground/80 mb-10">
            {subline}
          </p>
          
          <CTAButton onClick={onCtaClick} trackingStage="final" trackingCta="qualifizierung">
            {ctaText}
          </CTAButton>
        </div>
      </div>
    </section>
  );
};
