import { ArrowRight } from "lucide-react";

interface OutcomeSectionProps {
  headline: string;
  outcomes: string[];
}

export const OutcomeSection = ({ headline, outcomes }: OutcomeSectionProps) => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            {headline}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {outcomes.map((outcome, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-primary-foreground" />
                </div>
                <p className="text-foreground text-lg font-medium">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
