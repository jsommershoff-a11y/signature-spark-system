import { landingTokens as t } from "@/styles/landing-tokens";

export const AboutFounderSection = () => {
  return (
    <section className={`${t.sectionPadding} bg-muted/30`}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
          <p className="text-xl md:text-2xl font-semibold text-foreground">
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
          <p className="text-lg font-medium text-foreground">
            Und genau das bauen wir jetzt auch für dich.
          </p>
        </div>
      </div>
    </section>
  );
};
