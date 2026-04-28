import { AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BeforeAfterSectionProps {
  /** Eyebrow-Text über der Headline (optional). */
  eyebrow?: string;
  headline?: string;
  /** Pain-Beschreibung – optional ergänzt durch beforePoints */
  beforeIntro?: string;
  beforePoints?: string[];
  /** Solution-Beschreibung – optional ergänzt durch afterPoints */
  afterIntro?: string;
  afterPoints?: string[];
  /** Label für die "Mit"-Karte (z. B. Bot-Code oder Bundle-Name) */
  afterLabel?: string;
}

const DEFAULT_BEFORE = [
  "Manueller Aufwand bindet wertvolle Mitarbeiterstunden",
  "Inkonsistente Qualität, vergessene Vorgänge",
  "Skaliert nur durch teure Neueinstellungen",
];

const DEFAULT_AFTER = [
  "Klar definierte Prozesse laufen automatisch im Hintergrund",
  "Konstante Qualität – jeder Vorgang gleich gut bearbeitet",
  "Skaliert durch System, nicht durch zusätzliches Personal",
];

/**
 * Vorher/Nachher-Vergleich. Wiederverwendbar für Industry-, Bundle- und Produkt-Templates.
 */
export const BeforeAfterSection = ({
  eyebrow = "Schmerz vs. Lösung",
  headline = "So sieht dein Alltag aus — vorher und nachher",
  beforeIntro,
  beforePoints,
  afterIntro,
  afterPoints,
  afterLabel = "Mit System",
}: BeforeAfterSectionProps) => {
  const before = beforePoints && beforePoints.length > 0 ? beforePoints : DEFAULT_BEFORE;
  const after = afterPoints && afterPoints.length > 0 ? afterPoints : DEFAULT_AFTER;

  return (
    <section className="bg-background py-14 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 mb-3">
            {eyebrow}
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
            {headline}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold uppercase text-xs tracking-wider">Ohne System</h3>
              </div>
              {beforeIntro && (
                <p className="text-sm text-foreground leading-relaxed font-medium mb-3">
                  {beforeIntro}
                </p>
              )}
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {before.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-destructive shrink-0">✕</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3 text-primary">
                <Zap className="h-5 w-5" />
                <h3 className="font-bold uppercase text-xs tracking-wider">{afterLabel}</h3>
              </div>
              {afterIntro && (
                <p className="text-sm text-foreground leading-relaxed font-medium mb-3">
                  {afterIntro}
                </p>
              )}
              <ul className="space-y-1.5 text-sm">
                {after.map((a) => (
                  <li key={a} className="flex gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
