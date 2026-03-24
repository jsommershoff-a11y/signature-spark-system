import { TrendingUp, AlertCircle } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";
import kiZeitfresser from "@/assets/ki-zeitfresser.png";

export const CompetitionSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className={`${t.container} max-w-4xl`}>
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Left: Excuse */}
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 flex flex-col justify-center">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-3">
              Du verlierst jeden Monat Geld durch manuelle Prozesse.
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Jeder Prozess, der nicht am Kunden stattfindet und trotzdem manuell läuft – Verwaltung, Buchhaltung, Angebote, Follow-ups – kostet dich operative Stunden.
            </p>
            <p className="text-foreground font-semibold text-lg mb-2">
              Stunden, die dir für Umsatz, Führung und Wachstum fehlen.
            </p>
            <p className="text-destructive font-bold text-lg">
              Das sind 2.000–5.000 € – jeden Monat.
            </p>
          </div>

          {/* Right: Competition */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 flex flex-col justify-center">
            <TrendingUp className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-3">
              Deine Konkurrenz automatisiert bereits.
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nicht perfekt. Aber besser als du.
            </p>
            <p className="text-foreground leading-relaxed">
              Und das reicht, um dir Kunden wegzunehmen, schneller Angebote rauszuschicken und mit weniger Aufwand{" "}
              <span className="font-bold text-primary">mehr Umsatz zu machen.</span>
            </p>
          </div>
        </div>

        {/* Visual */}
        <div className="mt-8 rounded-2xl overflow-hidden shadow-lg border border-border">
          <img
            src={kiZeitfresser}
            alt="Mittelstands-KI: Die Wahrheit über deine Zeitfresser – Deine Konkurrenz automatisiert schon"
            className="w-full h-auto"
          />
        </div>

        {/* Pattern Break */}
        <div className="mt-8 bg-primary text-primary-foreground rounded-2xl py-8 px-6 text-center">
          <p className="text-2xl md:text-3xl font-bold">
            Automatisierung ist kein Luxus. Es ist Pflicht.
          </p>
        </div>
      </div>
    </section>
  );
};
