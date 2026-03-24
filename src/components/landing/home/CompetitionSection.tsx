import { TrendingUp, AlertCircle } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

export const CompetitionSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className={`${t.container} max-w-4xl`}>
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Left: Excuse */}
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 flex flex-col justify-center">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-3">
              „KI bringt mir nichts" ist die teuerste Ausrede im Mittelstand.
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Im Büro, in der Verwaltung, bei jedem Prozess der nicht am Kunden stattfindet – da bist du ersetzbar.
            </p>
            <p className="text-foreground font-semibold text-lg">
              Und dort verlierst du jeden Tag Geld.
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
      </div>
    </section>
  );
};
