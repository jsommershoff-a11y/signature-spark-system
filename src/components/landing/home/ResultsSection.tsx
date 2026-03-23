import { CheckCircle, TrendingUp, Clock, ShieldCheck, Users } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";
import founderAbout from "@/assets/founder-about.jpeg";

const results = [
  { text: "sparen täglich 2–4 Stunden operative Arbeit", icon: Clock },
  { text: "verlieren keine einzige Anfrage mehr", icon: ShieldCheck },
  { text: "arbeiten strukturierter als 95 % ihrer Wettbewerber", icon: TrendingUp },
  { text: "entlasten sich selbst und ihr Team sofort", icon: Users },
];

export const ResultsSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className={t.container}>
        <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
          {/* Content */}
          <div>
            <h2 className={`${t.headline.h2} text-foreground mb-8`}>
              Unternehmen, die ihre Prozesse automatisieren:
            </h2>

            <div className="space-y-4 mb-8">
              {results.map((r) => (
                <div key={r.text} className="flex items-center gap-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <r.icon className="w-6 h-6 text-primary flex-shrink-0" />
                  <p className="text-foreground font-medium">{r.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-foreground text-background rounded-2xl p-6 text-center">
              <p className="text-lg mb-1">Und vor allem:</p>
              <p className="text-xl md:text-2xl font-bold">
                Sie gewinnen wieder Kontrolle über ihr Unternehmen.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="hidden md:block">
            <img
              src={founderAbout}
              alt="Ergebnisse mit KRS Signature"
              className="rounded-2xl shadow-xl w-full object-cover aspect-square"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
