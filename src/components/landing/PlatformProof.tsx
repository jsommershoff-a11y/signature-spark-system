import { Check } from "lucide-react";

interface PlatformProofProps {
  headline: string;
  intro: string;
  features: string[];
}

export const PlatformProof = ({ headline, intro, features }: PlatformProofProps) => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-6">
            {headline}
          </h2>
          
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            {intro}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <p className="text-foreground font-medium">{feature}</p>
              </div>
            ))}
          </div>
          
          {/* Screenshot placeholder */}
          <div className="relative rounded-xl overflow-hidden border border-border shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📱</span>
                </div>
                <p className="text-muted-foreground text-lg">
                  Screenshot des Mitgliederbereichs
                </p>
                <p className="text-muted-foreground/70 text-sm mt-2">
                  Platzhalter für Screenshot
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
