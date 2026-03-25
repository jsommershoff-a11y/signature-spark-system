import { User, Quote } from "lucide-react";
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
    result: "\u201ENeue Website, eigenes CRM, Planungs-, Mitarbeiter- und Kundenportal \u2013 alles aus einer Hand implementiert. Dazu \u00FCber 40 Bewerbungen generiert und neue Mitarbeiter gewonnen. Die gesamten Prozesse wurden extrem erleichtert. Der Value ist ehrlich gesagt unmessbar.\u201C",
  },
];

export const CaseStudiesSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className={t.container}>
        <h2 className={`${t.headline.h2} text-foreground text-center mb-16`}>
          Ergebnisse unserer Partner
        </h2>

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
                <div className="pt-4 border-t border-border/30">
                  <p className="font-semibold text-foreground text-base">Ergebnis:</p>
                  <p className="text-muted-foreground italic mt-1 leading-relaxed">{c.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
