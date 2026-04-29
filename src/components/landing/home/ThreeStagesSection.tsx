import { Check, Star } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const aspects = ["Wissen", "Übergaben", "Skalierung", "Reaktionszeit", "Abhängigkeiten", "KI-Hebel"] as const;

const stages = [
  {
    title: "Manuell",
    sub: "Alles im Kopf",
    values: [
      "In Köpfen",
      "Mündlich, fehleranfällig",
      "Limitiert durch dich",
      "Stunden bis Tage",
      "Hoch",
      "Null",
    ],
  },
  {
    title: "Tools / Automation",
    sub: "Verteilte Werkzeuge",
    values: [
      "Verteilt in Tools",
      "Halbautomatisch",
      "Erkauft Geschwindigkeit",
      "Minuten",
      "Tool-abhängig",
      "Begrenzt",
    ],
  },
  {
    title: "Eigenes System",
    sub: "Wir",
    highlight: true,
    values: [
      "Zentral dokumentiert",
      "Nachvollziehbar definiert",
      "Strukturell möglich",
      "Sekunden bis Minuten",
      "Tool-unabhängig",
      "Voll nutzbar",
    ],
  },
];

export const ThreeStagesSection = () => {
  return (
    <section className={`${t.sectionPadding} bg-background`}>
      <div className={t.container}>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className={`${t.headline.h2} text-foreground mb-4`}>
            Drei Stufen — wo stehst du gerade?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Die meisten Unternehmen sind nicht zu langsam mit KI. Sie sind zu früh dran ohne Struktur.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block max-w-5xl mx-auto">
          <div className="grid grid-cols-[1.1fr_1fr_1fr_1.1fr] rounded-2xl overflow-hidden border border-border/40 bg-card">
            {/* Header row */}
            <div className="bg-muted/40 px-5 py-4 font-semibold text-sm text-foreground">Aspekt</div>
            {stages.map((s) => (
              <div
                key={s.title}
                className={`px-5 py-4 font-semibold text-sm relative ${
                  s.highlight
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{s.title}</span>
                  {s.highlight && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary-foreground/20 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3" /> Empfohlen
                    </span>
                  )}
                </div>
                <div className={`text-xs font-normal mt-0.5 ${s.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {s.sub}
                </div>
              </div>
            ))}

            {/* Rows */}
            {aspects.map((aspect, rowIdx) => (
              <div key={aspect} className="contents">
                <div
                  className={`px-5 py-4 text-sm font-medium text-foreground border-t border-border/30 ${
                    rowIdx % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                >
                  {aspect}
                </div>
                {stages.map((s, colIdx) => (
                  <div
                    key={`${aspect}-${colIdx}`}
                    className={`px-5 py-4 text-sm border-t border-border/30 ${
                      s.highlight
                        ? "bg-[#FFF3EB] text-foreground font-medium border-l-2 border-r-2 border-primary/40"
                        : rowIdx % 2 === 0
                        ? "bg-background text-muted-foreground"
                        : "bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    {s.highlight ? (
                      <span className="inline-flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        {s.values[rowIdx]}
                      </span>
                    ) : (
                      s.values[rowIdx]
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Stacked Cards */}
        <div className="md:hidden space-y-5 max-w-md mx-auto">
          {stages.map((s) => (
            <div
              key={s.title}
              className={`rounded-2xl p-5 ${
                s.highlight
                  ? "border-2 border-primary/40 bg-[#FFF3EB]"
                  : "border border-border/40 bg-card"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-foreground text-lg">{s.title}</h3>
                {s.highlight && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    <Star className="w-3 h-3" /> Empfohlen
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-4">{s.sub}</p>
              <dl className="space-y-2.5">
                {aspects.map((aspect, idx) => (
                  <div key={aspect} className="flex justify-between gap-3 text-sm border-t border-border/30 pt-2.5 first:border-t-0 first:pt-0">
                    <dt className="text-muted-foreground">{aspect}</dt>
                    <dd className={`text-right font-medium ${s.highlight ? "text-foreground" : "text-foreground/80"}`}>
                      {s.values[idx]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
