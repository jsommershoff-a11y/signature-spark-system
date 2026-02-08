import { CTAButton } from "./CTAButton";
import founderPortrait from "@/assets/founder-portrait.jpeg";

interface PersonalSupportProps {
  headline: string;
  intro: string;
  points: string[];
  ctaText: string;
  onCtaClick: () => void;
}

export const PersonalSupport = ({ headline, intro, points, ctaText, onCtaClick }: PersonalSupportProps) => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Portrait */}
            <div className="order-2 md:order-1 flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/10">
                  <img 
                    src={founderPortrait} 
                    alt="Persönliches Sparring" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-xl -z-10" />
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary-light/20 rounded-lg -z-10" />
              </div>
            </div>
            
            {/* Content */}
            <div className="order-1 md:order-2 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {headline}
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8">
                {intro}
              </p>
              
              <div className="space-y-4 mb-10">
                {points.map((point, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      ✓
                    </div>
                    <p className="text-foreground text-lg pt-0.5">{point}</p>
                  </div>
                ))}
              </div>
              
              <CTAButton onClick={onCtaClick}>
                {ctaText}
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
