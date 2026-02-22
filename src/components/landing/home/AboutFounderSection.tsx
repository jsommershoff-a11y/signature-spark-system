import founderPortrait from "@/assets/founder-about.jpeg";
import { landingTokens as t } from "@/styles/landing-tokens";

export const AboutFounderSection = () => {
  return (
    <section className={`${t.sectionPadding} bg-muted/30`}>
      <div className={t.container}>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Image */}
          <div className="flex justify-center">
            <img
              src={founderPortrait}
              alt="Jan Sommershoff – Gründer von KRS Signature"
              className="rounded-2xl shadow-xl max-w-sm w-full object-cover"
            />
          </div>

          {/* Text */}
          <div>
            <h2 className={`${t.headline.h2} text-foreground mb-6`}>
              Dein Partner auf Augenhöhe – aus der Praxis, für die Praxis.
            </h2>
            <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              <p>
                Ich bin kein theoretischer Berater. Ich bin Unternehmer. Durch und durch.
              </p>
              <p>
                Mit der KRS Immobilien GmbH habe ich ein Unternehmen aufgebaut, das heute in einem der härtesten Märkte Deutschlands erfolgreich und systemgetrieben agiert. Die 5 Säulen, die ich dir zeige, sind kein theoretisches Konzept – sie sind das exakte Betriebssystem, das mein eigenes Unternehmen antreibt.
              </p>
              <p>
                Ich habe die Fehler gemacht, damit du sie nicht machen musst. Ich habe die Systeme gebaut, damit du sie direkt nutzen kannst. Mein Ziel ist es, dir nicht nur zu erzählen, wie es geht, sondern es mit dir gemeinsam umzusetzen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
