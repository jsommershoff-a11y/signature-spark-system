import {
  Quote,
  Star,
  ShieldCheck,
  TrendingUp,
  Users,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { BundleProof } from "@/data/bundles";

interface ProofBarProps {
  productCode?: string;
  /** Optionaler bundle-/zielgruppenspezifischer Proof. Wenn gesetzt, wird die generische Variante ersetzt. */
  proof?: BundleProof;
  /** Eyebrow-Label für die personalisierte Variante, z. B. "Starter-Bundle" */
  audienceLabel?: string;
}

const DEFAULT_ICONS = [TrendingUp, Users, ShieldCheck, Star] as const;

/**
 * Social-Proof-Sektion: Quick-Stats, Mitgliedervorteile, Beispiel-Ergebnisse und Zitat.
 * Standard-Variante (ohne `proof`) zeigt die generischen Vertrauensanker.
 * Mit `proof` wird die Sektion zielgruppen-spezifisch personalisiert (z. B. /start vs. /growth).
 */
export function ProofBar({ productCode, proof, audienceLabel }: ProofBarProps) {
  // Fallback auf generische Stats, wenn kein Bundle-Proof übergeben wurde
  const stats = proof?.stats ?? [
    { value: "50+", label: "produktive Automatisierungen ausgerollt" },
    { value: "7 Tage", label: "durchschnittliche Time-to-Live" },
    { value: "DSGVO", label: "EU-Hosting, AVV inklusive" },
    { value: "30 Tage", label: "Optimierungssupport inklusive" },
  ];

  const quote = proof?.quote ?? {
    text: `Wir hatten ${
      productCode ? `mit ${productCode} ` : ""
    }innerhalb der ersten Woche messbar weniger manuelle Arbeit am Telefon und im Postfach. Die Time-to-Value war ehrlich gesagt schneller als wir intern jemals geschafft hätten.`,
    author: "René Schreiner",
    role: "Geschäftsführung · KRS",
    initials: "RS",
  };

  return (
    <section className="bg-[#FFF3EB] border-y border-primary/10 py-10 md:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {audienceLabel && (
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Proof für {audienceLabel}
            </span>
          </div>
        )}

        {/* Quick-Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = DEFAULT_ICONS[idx] ?? TrendingUp;
            return (
              <div key={`${stat.value}-${idx}`} className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground leading-none">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mitgliedervorteile + Beispiel-Ergebnisse — nur in personalisierter Variante */}
        {proof && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-white border-primary/20">
              <CardContent className="p-5 md:p-6">
                <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                  Was {audienceLabel ?? "dieses Bundle"}-Kunden bekommen
                </h3>
                <ul className="space-y-2">
                  {proof.memberBenefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-primary/20">
              <CardContent className="p-5 md:p-6">
                <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                  Beispiel-Ergebnisse
                </h3>
                <ul className="space-y-3">
                  {proof.exampleResults.map((result) => (
                    <li
                      key={result.segment}
                      className="border-l-2 border-primary/40 pl-3"
                    >
                      <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                        {result.segment}
                      </div>
                      <div className="text-sm text-foreground mt-0.5">
                        {result.outcome}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {result.timeframe}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Zitat */}
        <Card className="bg-white border-primary/20">
          <CardContent className="p-6 md:p-7">
            <Quote className="h-7 w-7 text-primary/40 mb-3" />
            <p className="text-base md:text-lg text-foreground leading-relaxed font-medium mb-4">
              „{quote.text}"
            </p>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-9 w-9 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center">
                {quote.initials}
              </div>
              <div>
                <div className="font-semibold text-foreground">{quote.author}</div>
                <div className="text-xs text-muted-foreground">{quote.role}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
