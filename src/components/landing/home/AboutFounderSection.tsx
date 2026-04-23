import founderPersonal from "@/assets/founder-personal.jpeg";
import founderKiErfolg from "@/assets/founder-ki-erfolg.png";
import { landingTokens as t } from "@/styles/landing-tokens";

export const AboutFounderSection = () => {
  return (
    <section className={`${t.sectionPadding} bg-gradient-to-b from-muted/20 to-background`}>
      <div className={t.container}>
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="relative">
            <img
              src={founderPersonal}
              alt="Gründer KI Automationen"
              className="rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-full object-cover aspect-[4/5]"
            />
            <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-primary to-primary-light text-primary-foreground font-bold text-sm px-5 py-3 rounded-xl shadow-lg">
              Aus der Praxis, nicht aus dem Lehrbuch
            </div>
          </div>

          <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
              Ich bin kein klassischer Berater.
            </p>
            <p>
              Ich habe selbst erlebt, wie es ist, wenn alles an dir hängt, nichts strukturiert ist und du dauerhaft im operativen Stress feststeckst.
            </p>
            <p>
              Ich habe Systeme gebaut, die genau dieses Problem lösen.
            </p>
            <p>
              Heute laufen Prozesse, die früher Zeit gefressen haben, automatisiert im Hintergrund.
            </p>
            <p className="text-foreground font-semibold">
              Keine Theorie. Keine Frameworks. Funktionierende Systeme aus echter Praxis.
            </p>
            <p className="text-foreground font-semibold">
              Ich baue keine Chatbots. Ich baue Systeme.
            </p>
            <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-2xl p-5 border-l-4 border-primary">
              <p className="text-xl font-bold text-foreground">
                Dein Unternehmen funktioniert nur, solange du es tust. Das ändern wir.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Banner */}
        <div className="mt-14 max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.08)] border border-border/30">
          <img
            src={founderKiErfolg}
            alt="Jan Sommershoff – Mit KI zum Erfolg: Effizienter arbeiten, Zeit gewinnen, Teams entlasten"
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};
