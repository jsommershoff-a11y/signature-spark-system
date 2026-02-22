import { landingTokens as t } from "@/styles/landing-tokens";

export const EmotionalHookSection = () => {
  return (
    <section className={t.sectionPadding}>
      <div className="max-w-3xl mx-auto px-4">
        <h2 className={`${t.headline.h2} text-foreground text-center mb-10`}>
          Wenn ehrgeizige Ziele auf die operative Realität treffen...
        </h2>

        <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
          <p>
            Du bist angetreten, um etwas Großes aufzubauen. Ein Unternehmen, das nicht nur funktioniert, sondern dominiert. Aber der Alltag sieht oft anders aus, oder?
          </p>
          <p>
            Die Nächte werden länger, weil du der Einzige bist, der die wichtigen Entscheidungen treffen kann. Der Druck steigt, weil du für Gehälter, Kunden und das große Ganze verantwortlich bist. Du arbeitest <em className="text-foreground font-medium">im</em> Unternehmen, nicht <em className="text-foreground font-medium">am</em> Unternehmen. Du bist der beste Mitarbeiter, aber nicht der freie Unternehmer, der du sein wolltest.
          </p>
          <p>
            Du bist nicht allein. Ich kenne dieses Gefühl. Mit KRS Immobilien habe ich genau diese Phasen durchlebt und ein System entwickelt, um diese Fesseln zu sprengen. Heute steuert sich das Unternehmen größtenteils von selbst – weil die Prozesse stimmen.
          </p>
        </div>
      </div>
    </section>
  );
};
