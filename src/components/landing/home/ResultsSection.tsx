import { Zap, Shield, Eye, TrendingUp } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";
import founderAbout from "@/assets/founder-about.jpeg";

const outcomes = [
  {
    icon: Zap,
    title: "Schnellere Reaktionszeiten",
    text: "Weniger Rückfragen, klarere Übergaben, schnellere Entscheidungen.",
  },
  {
    icon: Shield,
    title: "Weniger Abhängigkeit",
    text: "Kritisches Wissen bleibt im Unternehmen, nicht bei Einzelpersonen.",
  },
  {
    icon: Eye,
    title: "Mehr operative Klarheit",
    text: "Prozesse, Verantwortungen und Status sind nachvollziehbar.",
  },
  {
    icon: TrendingUp,
    title: "Bessere Skalierbarkeit",
    text: "Wachstum basiert auf Strukturen, nicht auf Improvisation.",
  },
];

export const ResultsSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className={t.container}>
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <h2 className={`${t.headline.h2} text-foreground mb-10`}>
              Was sich verändert, wenn dein Unternehmen systematisiert ist
            </h2>

            <div className="space-y-4">
              {outcomes.map((o) => (
                <div key={o.title} className="flex items-start gap-4 p-4 rounded-2xl border-l-4 border-l-primary border border-border/30 bg-card">
                  <o.icon className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-foreground font-semibold">{o.title}</p>
                    <p className="text-muted-foreground text-sm">{o.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <img
              src={founderAbout}
              alt="Ergebnisse durch Systematisierung – KRS Signature"
              className="rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-full object-cover aspect-square"
              width={480}
              height={480}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
