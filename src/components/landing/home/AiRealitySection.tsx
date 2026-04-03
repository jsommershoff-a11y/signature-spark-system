import { AlertTriangle, XCircle, Brain, ShieldAlert, Wrench, Bot, Cog, Clock, TrendingDown, CheckCircle2, BarChart3 } from "lucide-react";
import { landingTokens as t } from "@/styles/landing-tokens";
import founderKiSystem from "@/assets/founder-ki-system.png";

const misconceptions = [
  "Sie bezahlen Agenturen für Chatbots, die kein Kunde nutzt.",
  "Sie automatisieren Dinge, die keinen ROI haben.",
  "Und verpassen die einfachsten Hebel, die sofort Zeit sparen würden.",
];

const wrongSide = [
  { icon: Bot, text: "Chat-Prozesse ohne Strategie" },
  { icon: TrendingDown, text: "KI-Tools ohne ROI" },
  { icon: Clock, text: "Effizienz-Verlust durch Komplexität" },
];

const rightSide = [
  { icon: Cog, text: "Integriertes System statt Einzeltools" },
  { icon: BarChart3, text: "Messbare Zeiteinsparung & Effizienz" },
  { icon: CheckCircle2, text: "Automatisierte Prozesse im Hintergrund" },
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
    text: "Wenn du dein Wissen nicht strukturierst, kann auch keine KI daraus etwas bauen. Die meisten hoffen, dass KI mitdenkt. Die Realität: Sie verstärkt nur dein Chaos.",
  },
];

const simpleProcesses = [
  "Buchhaltung", "Angebote", "Follow-ups", "Personalplanung",
  "Terminplanung", "Dokumentation", "Rechnungsstellung",
];

export const AiRealitySection = () => {
  return (
    <section className={`${t.sectionPadding} bg-gradient-to-b from-muted/20 to-background`}>
      <div className={t.container}>
        {/* Opener */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className={`${t.badgeAccent} mb-5`}>KI-Realitätscheck</span>
           <h2 className={`${t.headline.h2} text-foreground mt-5 mb-5`}>
            Die meisten Unternehmen setzen KI komplett falsch ein.
          </h2>
          <p className="text-lg text-muted-foreground font-medium mb-3">
            Wir bauen keine Chatbots. Wir verkaufen keine Tools. Wir bauen Systeme, die funktionieren.
          </p>
          <p className="text-base text-muted-foreground">
            Wenn du die KI-Chance nutzen willst, musst du zuerst sicherstellen, dass du alles über dein eigenes Unternehmen weißt.
            Automatisierungen beginnen mit deinen eigenen Informationen in deinem eigenen System.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <div className="space-y-3 mt-8">
            {misconceptions.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-5 bg-gradient-to-r from-destructive/5 to-transparent rounded-2xl border border-destructive/15 text-left max-w-xl mx-auto"
              >
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-foreground text-lg font-medium">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-lg mt-8 text-center">
            Währenddessen verlieren sie jeden Tag Stunden – unnötig.
          </p>
          <p className="text-2xl md:text-4xl font-bold text-foreground mt-6 text-center leading-tight">
            Du brauchst keinen weiteren KI-Assistenten.
            <br />
            <span className="text-primary">Du brauchst dein Signature System.</span>
          </p>
        </div>

        {/* Falsch vs. Richtig Comparison */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-border/40 shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
            {/* FALSCH */}
            <div className="bg-gradient-to-br from-destructive/5 to-destructive/3 p-8 md:p-10 border-b md:border-b-0 md:border-r border-destructive/15 relative">
              <div className="absolute top-5 left-5 md:top-7 md:left-7">
                <span className="inline-block bg-destructive text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Falsch
                </span>
              </div>
              <div className="mt-12 text-center mb-7">
                <Bot className="w-12 h-12 text-destructive mx-auto mb-3 opacity-80" />
                <h3 className="text-xl md:text-2xl font-bold text-foreground">Unnötige Chatbots</h3>
                <p className="text-muted-foreground text-sm mt-1">Komplexität ohne Ergebnis</p>
              </div>
              <div className="space-y-3">
                {wrongSide.map((item) => (
                  <div key={item.text} className="flex items-center gap-3 p-3.5 bg-destructive/8 rounded-xl border border-destructive/10">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <span className="text-foreground font-medium text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RICHTIG */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/3 p-8 md:p-10 relative">
              <div className="absolute top-5 right-5 md:top-7 md:right-7">
                <span className="inline-block bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Richtig
                </span>
              </div>
              <div className="mt-12 text-center mb-7">
                <Cog className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-xl md:text-2xl font-bold text-foreground">Effektive Systeme</h3>
                <p className="text-muted-foreground text-sm mt-1">Zeiteinsparung: Maximal</p>
              </div>
              <div className="space-y-3">
                {rightSide.map((item) => (
                  <div key={item.text} className="flex items-center gap-3 p-3.5 bg-primary/8 rounded-xl border border-primary/10">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Danger Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {dangers.map((d) => (
            <div key={d.headline} className="rounded-3xl border border-destructive/15 bg-gradient-to-br from-destructive/5 to-transparent p-7 flex flex-col">
              <d.icon className="w-8 h-8 text-destructive mb-5" />
              <h3 className="text-lg font-bold text-foreground mb-3">{d.headline}</h3>
              <p className="text-muted-foreground leading-relaxed">{d.text}</p>
            </div>
          ))}
        </div>

        {/* Simple Processes */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h3 className={`${t.headline.h3} text-foreground mb-3`}>
            Die größten Gewinne liegen nicht in komplexer KI.
          </h3>
          <p className="text-muted-foreground text-lg mb-8">
            Sondern in den einfachen Prozessen, die jeden Tag Zeit fressen:
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {simpleProcesses.map((p) => (
              <span key={p} className="px-5 py-2.5 border border-primary/20 text-primary font-semibold rounded-full text-base bg-transparent">
                {p}
              </span>
            ))}
          </div>
          <p className="text-foreground font-semibold text-lg">
            Das ist kein Zukunftsthema.<br />Das ist operatives Versagen.
          </p>
        </div>

        {/* Visual Banner */}
        <div className="max-w-4xl mx-auto mb-16 rounded-3xl overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.08)] border border-border/30">
          <img
            src={founderKiSystem}
            alt="Jan Sommershoff – KI für Unternehmer: Zeitsparnis, Team-Entlastung, automatisierte Prozesse"
            className="w-full h-auto"
          />
        </div>

        {/* Handwerker / Mittelstand Block */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-border/30 bg-card p-8 md:p-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <Wrench className="w-10 h-10 text-primary mx-auto mb-5" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              „KI bringt mir nichts" ist die teuerste Ausrede im Mittelstand.
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              Auf der Baustelle, in der Werkstatt, beim Kunden – da bist du unersetzlich.
              Aber in der Buchhaltung, Terminplanung, Angebotserstellung und Dokumentation?
              Da verlierst du jeden Tag Geld.
              <span className="block mt-3 text-foreground font-semibold">
                Und genau dort greifen einfache Automatisierungen sofort.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
