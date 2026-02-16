import { LineChart, Line, ResponsiveContainer } from "recharts";
import { AlertTriangle } from "lucide-react";

const declineData = [
  { v: 90 }, { v: 82 }, { v: 70 }, { v: 55 }, { v: 45 }, { v: 30 }, { v: 20 },
];

const painPoints = [
  "Sie investieren in Werbung – aber die Anfragen bleiben aus",
  "Ihre Website sieht gut aus – aber generiert keine Kunden",
  "Empfehlungen reichen nicht mehr – und planbarer Umsatz fehlt",
  "Sie wissen, dass online Potenzial liegt – aber nicht wo anfangen",
];

export const ProblemAmplifier = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-destructive font-semibold text-sm mb-4">
            <AlertTriangle className="w-4 h-4" />
            DIE UNBEQUEME WAHRHEIT
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Kommt Ihnen das bekannt vor?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Die meisten Unternehmer verlieren jeden Tag Kunden – ohne es zu merken.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <ul className="space-y-5">
            {painPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-sm font-bold shrink-0">✕</span>
                <span className="text-foreground text-base md:text-lg">{p}</span>
              </li>
            ))}
          </ul>

          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Ihre Kundengewinnung ohne System</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={declineData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="hsl(0, 84%, 60%)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground text-center mt-2">↓ Sinkende Anfragen & Umsatz</p>
          </div>
        </div>
      </div>
    </section>
  );
};
