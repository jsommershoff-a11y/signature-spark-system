import { MessageCircle } from "lucide-react";
import { CTAButton } from "./CTAButton";

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
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {headline}
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10">
            {intro}
          </p>
          
          <div className="space-y-4 mb-12 text-left max-w-xl mx-auto">
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
    </section>
  );
};
