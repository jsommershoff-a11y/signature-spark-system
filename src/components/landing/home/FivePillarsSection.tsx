import { Target, BarChart3, Bot, Users, Compass } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

interface FivePillarsSectionProps {
  onCtaClick: () => void;
}

const pillars = [
  {
    icon: Target,
    title: "Strategische Positionierung & Medienpräsenz",
    text: "Wie du als Experte Nr. 1 in deinem Markt wahrgenommen wirst und die richtigen Kunden magnetisch anziehst.",
  },
  {
    icon: BarChart3,
    title: "Systematisierter Vertrieb",
    text: "Aufbau einer planbaren Neukunden-Maschine, die ohne dich funktioniert – vom ersten Kontakt bis zum Abschluss.",
  },
  {
    icon: Bot,
    title: "KI & Prozessautomatisierung",
    text: "Effizienz steigern, Kosten senken und Zeit gewinnen durch intelligente Systeme, die 24/7 für dich arbeiten.",
  },
  {
    icon: Users,
    title: "Mitarbeiterführung & A-Player-Kultur",
    text: "Die richtigen Leute finden, zu Höchstleistungen motivieren und eine Kultur schaffen, in der jeder Verantwortung übernimmt.",
  },
  {
    icon: Compass,
    title: "Unternehmer-Mindset & Persönliche Freiheit",
    text: "Der Weg raus aus dem operativen Hamsterrad, hin zu strategischer Steuerung und einem selbstbestimmten Leben.",
  },
];

export const FivePillarsSection = ({ onCtaClick }: FivePillarsSectionProps) => {
  return (
    <section className={`${t.sectionPadding} bg-muted/30`}>
      <div className={t.container}>
        <div className="text-center mb-14">
          <h2 className={`${t.headline.h2} text-foreground mb-4`}>
            Das KRS Signature 5-Säulen-System
          </h2>
          <p className={t.text.body}>
            Wir implementieren nicht nur Tools – wir installieren das Betriebssystem für deinen unternehmerischen Erfolg.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {pillars.map((p) => (
            <div key={p.title} className={t.card}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <p.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={onCtaClick} className={t.ctaPrimary}>
            Potenzial-Analyse anfordern
          </button>
        </div>
      </div>
    </section>
  );
};
