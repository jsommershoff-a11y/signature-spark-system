import { User } from "lucide-react";
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
        <h2 className={`${t.headline.h2} text-foreground text-center mb-14`}>
          Ergebnisse unserer Partner
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((c, i) => (
            <div key={i} className="border-l-4 border-primary rounded-2xl bg-background shadow-sm p-6">
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-6">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.company}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-foreground">Problem:</p>
                  <p className="text-muted-foreground">{c.problem}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Ziel:</p>
                  <p className="text-muted-foreground">{c.goal}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Lösung:</p>
                  <p className="text-muted-foreground">{c.solution}</p>
                </div>
                <div className="pt-2 border-t border-border/40">
                  <p className="font-semibold text-foreground">Ergebnis:</p>
                  <p className="text-muted-foreground italic">{c.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
