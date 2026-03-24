import founderPersonal from "@/assets/founder-personal.jpeg";
import { landingTokens as t } from "@/styles/landing-tokens";

export const AboutFounderSection = () => {
  return (
    <section className={`${t.sectionPadding} bg-muted/30`}>
      <div className={`${t.container}`}>
        <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
          <div className="relative">
            <img
              src={founderPersonal}
              alt="Gründer KRS Signature"
              className="rounded-2xl shadow-xl w-full object-cover aspect-[4/5]"
            />
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground font-bold text-sm px-5 py-3 rounded-xl shadow-lg">
              Aus der Praxis, nicht aus dem Lehrbuch
            </div>
          </div>

          <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p className="text-2xl md:text-3xl font-bold text-foreground">
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
            <p className="text-xl font-bold text-foreground border-l-4 border-primary pl-4">
              Dein Unternehmen funktioniert nur, solange du es tust. Das ändern wir.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
