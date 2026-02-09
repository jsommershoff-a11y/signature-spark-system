import { Brain, Shield, BarChart3 } from "lucide-react";
import { landingTokens } from "@/styles/landing-tokens";

export const StructogramUSPSection = () => {
  return (
    <section className={`${landingTokens.sectionPadding} bg-muted/30`}>
      <div className={landingTokens.container}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className={`${landingTokens.badgeAccent} mb-4`}>
              Wissenschaftlich fundiert
            </span>
            <h2 className={`${landingTokens.headline.h2} text-foreground mb-4 mt-4`}>
              Structogram®-Integration
            </h2>
            <p className={`${landingTokens.text.body} max-w-2xl mx-auto`}>
              Wir nutzen die Biostruktur-Analyse, um Kommunikation zu
              personalisieren – kein Esoterik, sondern Hirnforschung.
            </p>
          </div>

          {/* Structogram Colors Explanation */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* ROT */}
            <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/5 p-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <div className="w-6 h-6 rounded-full bg-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Dominant (ROT)
              </h3>
              <p className={landingTokens.text.body}>
                Schnelle Entscheidungen, direkte Kommunikation, klare Deadlines.
                Keine Umwege, keine Floskeln.
              </p>
            </div>

            {/* GRÜN */}
            <div className="rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-6">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <div className="w-6 h-6 rounded-full bg-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
                Beziehung (GRÜN)
              </h3>
              <p className={landingTokens.text.body}>
                Vertrauen aufbauen, Sicherheit geben, persönliche Begleitung.
                Jeder Schritt wird gemeinsam gegangen.
              </p>
            </div>

            {/* BLAU */}
            <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-500/5 p-6">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                Analytisch (BLAU)
              </h3>
              <p className={landingTokens.text.body}>
                Daten, Fakten, Checklisten. Jede Empfehlung ist nachvollziehbar
                und messbar begründet.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-background rounded-2xl border border-border/40 p-8">
            <h3 className={`${landingTokens.headline.h3} text-foreground mb-6 text-center`}>
              Warum das einen Unterschied macht
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Personalisierte Führung
                  </h4>
                  <p className={landingTokens.text.small}>
                    Jeder Kunde wird nach seinem Typ geführt – nicht nach Schema F.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Weniger Reibungsverlust
                  </h4>
                  <p className={landingTokens.text.small}>
                    Kommunikation, die ankommt. Keine Missverständnisse, keine
                    Frustration.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Höhere Abschlussquoten
                  </h4>
                  <p className={landingTokens.text.small}>
                    Vertrieb, der zur Persönlichkeit des Kunden passt, verkauft
                    mehr.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
