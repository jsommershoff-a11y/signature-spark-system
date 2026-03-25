import { Users, Zap, GitBranch, TrendingUp } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";
import founderAbout from "@/assets/founder-about.jpeg";

const results = [
  { text: "Weniger operative Abhängigkeit von einzelnen Personen", icon: Users },
  { text: "Schnellere Reaktionszeiten auf Kundenanfragen", icon: Zap },
  { text: "Sauberere Prozesse mit weniger manuellen Übergaben", icon: GitBranch },
  { text: "Bessere Planbarkeit für Wachstum und Skalierung", icon: TrendingUp },
];

export const ResultsSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className={t.container}>
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <h2 className={`${t.headline.h2} text-foreground mb-10`}>
              Unternehmen, die ihre Prozesse automatisieren:
            </h2>

            <div className="space-y-4 mb-8">
              {results.map((r) => (
                <div key={r.text} className="flex items-center gap-4 p-4 rounded-2xl border-l-4 border-l-primary border border-border/30 bg-card">
                  <r.icon className="w-7 h-7 text-primary flex-shrink-0" />
                  <p className="text-foreground font-medium">{r.text}</p>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground text-sm mb-10">
              Unternehmen, die wir begleiten, gewinnen jede Woche mehrere Stunden zurück – durch weniger manuelle Übergaben und klarere Abläufe.
            </p>

            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] text-white rounded-3xl p-7 text-center shadow-[0_0_40px_rgba(246,113,31,0.06)]">
              <p className="text-lg mb-1 text-white/70">Und vor allem:</p>
              <p className="text-xl md:text-2xl font-bold">
                Sie gewinnen wieder Kontrolle über ihr Unternehmen.
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <img
              src={founderAbout}
              alt="Ergebnisse mit dem Signature System"
              className="rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-full object-cover aspect-square"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
