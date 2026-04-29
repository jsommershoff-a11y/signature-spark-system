import { Quote } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";
import founderPortrait from "@/assets/founder-hero.jpeg";

interface ProcessStepsSectionProps {
  onCtaClick: () => void;
}

const steps = [
  {
    num: "1",
    title: "Analyse",
    text: "Wir identifizieren Engpässe, Abhängigkeiten und Datenbrüche.",
    duration: "ca. 1 Woche",
  },
  {
    num: "2",
    title: "System-Mapping",
    text: "Wir erfassen, wie Informationen, Prozesse und Zuständigkeiten tatsächlich laufen.",
    duration: "1–2 Wochen",
  },
  {
    num: "3",
    title: "Priorisierung",
    text: "Wir definieren, was zuerst systematisiert und automatisiert werden muss.",
    duration: "ca. 1 Woche",
  },
  {
    num: "4",
    title: "Umsetzung",
    text: "Wir bauen klare Abläufe, Dokumentation und sinnvolle Automatisierungen.",
    duration: "4–8 Wochen",
  },
  {
    num: "5",
    title: "Übergabe + Support",
    text: "Du bekommst ein System, das nachvollziehbar, nutzbar und skalierbar ist.",
    duration: "30 Tage Begleitung",
  },
];

export const ProcessStepsSection = ({ onCtaClick }: ProcessStepsSectionProps) => {
  return (
    <section id="vorgehen" className={`${t.sectionPadding} bg-gradient-to-b from-background to-muted/20 scroll-mt-20`}>
      <div className={t.container}>
        <h2 className={`${t.headline.h2} text-foreground text-center mb-14`}>
          So läuft die Zusammenarbeit
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-6xl mx-auto mb-8">
          {steps.map((s) => (
            <div
              key={s.num}
              className="relative rounded-2xl border border-border/40 bg-card p-5 text-left flex flex-col"
            >
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-bold shadow-md shrink-0">
                  {s.num}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wide bg-muted text-muted-foreground rounded px-2 py-1 leading-none whitespace-nowrap">
                  {s.duration}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-base font-semibold text-foreground mb-8">
          Typische Gesamtdauer eines Projekts: 8–12 Wochen bis Go-Live.
        </p>

        {/* Jan sagt */}
        <div className="max-w-2xl mx-auto mb-10 flex items-start gap-4 rounded-2xl border border-border/40 bg-card p-5">
          <img
            src={founderPortrait}
            alt="Jan Sommershoff"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
            width={48}
            height={48}
            loading="lazy"
          />
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Jan sagt</p>
            <p className="text-sm md:text-base text-foreground italic leading-relaxed">
              <Quote className="inline w-4 h-4 text-primary/40 mr-1 -mt-1" aria-hidden />
              Wir liefern keinen Tool-Stack, sondern eine dokumentierte Struktur, die ohne uns funktioniert.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button onClick={onCtaClick} className={t.ctaPrimary}>
            Kostenlose Potenzial-Analyse
          </button>
          <p className="text-xs text-muted-foreground mt-3">
            Kein Agentur-Theater. Klare Prioritäten und umsetzbare Struktur.
          </p>
        </div>
      </div>
    </section>
  );
};
