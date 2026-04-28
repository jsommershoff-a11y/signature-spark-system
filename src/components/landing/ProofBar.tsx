import { Quote, Star, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProofBarProps {
  productCode?: string;
}

/**
 * Social-Proof-Sektion: Zahlen, Vertrauenspunkte und ein konkretes Zitat.
 * Bewusst ohne fiktive Logos – stattdessen branchenneutrale Vertrauensanker.
 */
export function ProofBar({ productCode }: ProofBarProps) {
  return (
    <section className="bg-[#FFF3EB] border-y border-primary/10 py-10 md:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">50+</div>
              <div className="text-xs text-muted-foreground mt-1">
                produktive Automatisierungen ausgerollt
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">7 Tage</div>
              <div className="text-xs text-muted-foreground mt-1">
                durchschnittliche Time-to-Live
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">DSGVO</div>
              <div className="text-xs text-muted-foreground mt-1">
                EU-Hosting, AVV inklusive
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">30 Tage</div>
              <div className="text-xs text-muted-foreground mt-1">
                Optimierungssupport inklusive
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-white border-primary/20">
          <CardContent className="p-6 md:p-7">
            <Quote className="h-7 w-7 text-primary/40 mb-3" />
            <p className="text-base md:text-lg text-foreground leading-relaxed font-medium mb-4">
              „Wir hatten {productCode ? `mit ${productCode} ` : ""}innerhalb der ersten Woche
              messbar weniger manuelle Arbeit am Telefon und im Postfach. Die Time-to-Value war
              ehrlich gesagt schneller als wir intern jemals geschafft hätten."
            </p>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-9 w-9 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center">
                RS
              </div>
              <div>
                <div className="font-semibold text-foreground">René Schreiner</div>
                <div className="text-xs text-muted-foreground">Geschäftsführung · KRS</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
