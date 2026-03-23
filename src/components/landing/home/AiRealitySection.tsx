import { AlertTriangle, XCircle, Brain, ShieldAlert } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";

const misconceptions = [
  "Sie bauen Chatbots, die keiner braucht.",
  "Sie automatisieren Dinge, die keinen ROI haben.",
  "Und verpassen die einfachsten Hebel, die sofort Zeit sparen würden.",
];

const dangers = [
  {
    icon: ShieldAlert,
    headline: "Niemand will mit deiner KI telefonieren.",
    text: "Deine Kunden wollen mit dir sprechen. Wenn du KI falsch einsetzt, verlierst du Vertrauen – nicht nur Zeit.",
  },
  {
    icon: Brain,
    headline: "Strategie gehört in den Kopf – nicht in ein Tool.",
    text: "Die größte Gefahr ist nicht, keine KI zu nutzen. Es ist, KI Entscheidungen treffen zu lassen, die du selbst nicht verstehst.",
  },
  {
    icon: AlertTriangle,
    headline: "KI ist nur so gut wie dein System.",
    text: "Wenn du dein Wissen nicht strukturierst, kann auch keine KI daraus etwas bauen. Die meisten hoffen, dass KI „mitdenkt". Die Realität: Sie verstärkt nur dein Chaos.",
  },
];

const simpleProcesses = [
  "Buchhaltung",
  "Angebote",
  "Follow-ups",
  "Personalplanung",
];

export const AiRealitySection = () => {
  return (
    <section className={`${t.sectionPadding} bg-muted/30`}>
      <div className={`${t.container}`}>
        {/* Opener */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className={`${t.badgeAccent} mb-4`}>KI-Realitätscheck</span>
          <h2 className={`${t.headline.h2} text-foreground mt-4 mb-4`}>
            Die meisten Unternehmen setzen KI komplett falsch ein.
          </h2>
          <div className="space-y-3 mt-8">
            {misconceptions.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 bg-destructive/5 rounded-xl border border-destructive/20 text-left max-w-xl mx-auto"
              >
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-foreground text-lg font-medium">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-lg mt-6">
            Währenddessen verlieren sie jeden Tag Stunden – unnötig.
          </p>
          <p className="text-2xl md:text-3xl font-bold text-foreground mt-6">
            Du brauchst keinen weiteren KI-Assistenten.
            <br />
            <span className="text-primary">Du brauchst Systeme.</span>
          </p>
        </div>

        {/* Danger Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {dangers.map((d) => (
            <div
              key={d.headline}
              className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 flex flex-col"
            >
              <d.icon className="w-8 h-8 text-destructive mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">{d.headline}</h3>
              <p className="text-muted-foreground leading-relaxed">{d.text}</p>
            </div>
          ))}
        </div>

        {/* Simple Processes */}
        <div className="max-w-3xl mx-auto text-center">
          <h3 className={`${t.headline.h3} text-foreground mb-2`}>
            Die größten Gewinne liegen nicht in komplexer KI.
          </h3>
          <p className="text-muted-foreground text-lg mb-6">
            Sondern in den einfachen Prozessen, die jeden Tag Zeit fressen:
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {simpleProcesses.map((p) => (
              <span
                key={p}
                className="px-5 py-2.5 bg-primary/10 text-primary font-semibold rounded-full border border-primary/20 text-base"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="text-foreground font-semibold text-lg">
            Das ist kein Zukunftsthema.
            <br />
            Das ist operatives Versagen.
          </p>
        </div>
      </div>
    </section>
  );
};
