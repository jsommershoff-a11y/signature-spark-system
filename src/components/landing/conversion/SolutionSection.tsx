import { LineChart, Line, ResponsiveContainer } from "recharts";
import { CheckCircle2 } from "lucide-react";

const growthData = [
  { v: 10 }, { v: 18 }, { v: 30 }, { v: 48 }, { v: 62 }, { v: 80 }, { v: 95 },
];

const benefits = [
  "KI-gestützte Automatisierung von Vertrieb, Verwaltung und Kommunikation",
  "Zeitersparnis durch intelligente Prozesse – rund um die Uhr",
  "Mehr Kapazität für Ihr Kerngeschäft statt Verwaltungsaufwand",
  "Messbare Ergebnisse ab den ersten 30 Tagen",
];

export const SolutionSection = ({ onCtaClick }: { onCtaClick: () => void }) => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm mb-4">
            <CheckCircle2 className="w-4 h-4" />
            DIE LÖSUNG
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Wir installieren Ihnen ein System,<br className="hidden md:block" /> das Ihre Prozesse 24/7 automatisiert
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Kein Rätselraten. Kein manueller Aufwand. Ein bewährtes KI-System, das Ressourcen freisetzt und Kosten senkt.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm order-2 md:order-1">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Ihre Effizienz mit KRS System</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={growthData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="hsl(30, 90%, 55%)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground text-center mt-2">↑ Steigende Effizienz & sinkende Kosten</p>
          </div>

          <div className="order-1 md:order-2">
            <ul className="space-y-5 mb-8">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground text-base md:text-lg">{b}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={onCtaClick}
              className="bg-primary hover:bg-primary-deep text-primary-foreground font-semibold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
            >
              Ja, ich will effizientere Prozesse →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
