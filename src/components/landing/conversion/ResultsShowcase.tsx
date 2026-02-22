import { ExternalLink } from "lucide-react";
import resultAsGaerten from "@/assets/result-as-gaerten-bewerber.jpeg";

const results = [
  {
    image: resultAsGaerten,
    company: "AS Gärten GmbH",
    location: "Köln",
    description:
      "Handwerksunternehmen im Garten- und Landschaftsbau – innerhalb weniger Wochen über Social-Media-Recruiting qualifizierte Fachkräfte gewonnen.",
    kpiValue: "53",
    kpiLabel: "Bewerber generiert",
    link: "https://www.as-gaerten-gmbh.de",
  },
];

export const ResultsShowcase = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Echte Ergebnisse unserer Kunden
          </h2>
          <p className="text-muted-foreground text-lg">
            Keine leeren Versprechen – messbare Resultate, die für sich sprechen.
          </p>
        </div>

        <div className="space-y-8">
          {results.map((r, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/40 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row"
            >
              {/* Screenshot */}
              <div className="md:w-1/2 relative bg-muted">
                <img
                  src={r.image}
                  alt={`Ergebnis für ${r.company}`}
                  className="w-full min-h-[300px] md:min-h-[400px] object-contain"
                />
              </div>

              {/* Content */}
              <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
                <div className="mb-6">
                  <span className="text-6xl md:text-7xl font-black text-primary leading-none">
                    {r.kpiValue}
                  </span>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {r.kpiLabel}
                  </p>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-1">
                  {r.company}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {r.location}
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {r.description}
                </p>

                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                >
                  Website besuchen
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
