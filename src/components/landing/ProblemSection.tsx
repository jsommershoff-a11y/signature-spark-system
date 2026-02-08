import { AlertCircle } from "lucide-react";

interface ProblemSectionProps {
  intro: string;
  problems: string[];
  outro: string;
}

export const ProblemSection = ({ intro, problems, outro }: ProblemSectionProps) => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xl md:text-2xl text-foreground font-medium mb-10 text-center">
            {intro}
          </p>
          
          <div className="space-y-4 mb-10">
            {problems.map((problem, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border/50 shadow-sm"
              >
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-foreground text-lg">{problem}</p>
              </div>
            ))}
          </div>
          
          <p className="text-xl md:text-2xl text-primary font-semibold text-center">
            {outro}
          </p>
        </div>
      </div>
    </section>
  );
};
