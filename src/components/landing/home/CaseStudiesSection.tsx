import { User, Quote, Check } from "lucide-react";
import testimonialRene from "@/assets/testimonial-rene-schreiner.jpeg";
import { landingTokens as t } from "@/styles/landing-tokens";

const cases = [
  {
    name: "René Schreiner",
    company: "AS Gärten GmbH, Köln",
    image: testimonialRene,
    problem: "Unstrukturierte Prozesse, hoher manueller Aufwand in der Verwaltung und bei der Mitarbeitergewinnung.",
    goal: "Prozesse digitalisieren, Effizienz steigern und qualifizierte Mitarbeiter finden.",
    solution: "Implementierung eines zentralen CRMs, eines Planungs- und Mitarbeiterportals. Automatisierung des Bewerbungsprozesses.",
    result: "Neue Website, eigenes CRM, Planungs-, Mitarbeiter- und Kundenportal – alles aus einer Hand implementiert. Dazu über 40 Bewerbungen generiert und neue Mitarbeiter gewonnen. Die gesamten Prozesse wurden extrem erleichtert. Der Value ist ehrlich gesagt unmessbar.",
  },
];

const highlights = [
  { value: "40+", label: "neue Bewerbungen generiert" },
  { value: "1", label: "zentrales System statt 4 verstreuter Tools" },
  { value: <Check className="w-10 h-10 md:w-12 md:h-12 mx-auto text-primary" strokeWidth={3} />, label: "„Value ehrlich gesagt unmessbar"" },
];

export const CaseStudiesSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className={t.container}>
        <h2 className={`${t.headline.h2} text-foreground text-center mb-12`}>
          Ergebnisse unserer Partner
        </h2>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-primary/30 bg-[#FFF3EB] p-6 text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2 min-h-[3rem] flex items-center justify-center">
                {h.value}
              </div>
              <p className="text-sm text-foreground font-medium leading-snug">{h.label}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          {cases.map((c, i) => (
            <div key={i} className="rounded-3xl bg-card border border-border/30 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 md:p-10 relative">
              <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-8">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-7 h-7 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-foreground">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.company}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground text-base">Problem:</p>
                  <p className="text-muted-foreground mt-1">{c.problem}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-base">Ziel:</p>
                  <p className="text-muted-foreground mt-1">{c.goal}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-base">Lösung:</p>
                  <p className="text-muted-foreground mt-1">{c.solution}</p>
                </div>
                <div className="pt-5 border-t border-border/30">
                  <p className="font-semibold text-foreground text-base mb-3">Ergebnis:</p>
                  <blockquote className="relative pl-5 border-l-4 border-primary/40">
                    <Quote className="w-5 h-5 text-primary/50 absolute -left-2.5 -top-1 bg-card" aria-hidden />
                    <p className="text-foreground italic text-lg md:text-xl leading-relaxed">
                      „{c.result}"
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 max-w-2xl mx-auto">
          Weitere Referenzen auf Anfrage. Wir sprechen gern mit dir konkret über vergleichbare Projekte.
        </p>
      </div>
    </section>
  );
};
