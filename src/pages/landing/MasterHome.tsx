import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { landingTokens } from "@/styles/landing-tokens";
import { Button } from "@/components/ui/button";

const MasterHome = () => {
  return (
    <PublicLayout>
      {/* HERO Section */}
      <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-background via-muted to-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-light/5 rounded-full blur-3xl" />
        </div>

        <div className={`${landingTokens.container} py-20 relative z-10`}>
          <div className="max-w-4xl mx-auto text-center">
            {/* Umsatz Badge */}
            <span className={`${landingTokens.badge} mb-8`}>
              Nur für Unternehmer ab 100.000 € Jahresumsatz
            </span>

            {/* Headline */}
            <h1 className={`${landingTokens.headline.h1} text-foreground mb-8`}>
              Struktur schlägt Talent.
              <br />
              Systeme schlagen Chaos.
            </h1>

            {/* Subtext */}
            <p className={`${landingTokens.text.body} max-w-3xl mx-auto mb-10`}>
              KRS Signature ist kein Kurs, kein Coaching und keine Agentur.
              Es ist ein strukturierter Eingriff in Unternehmen,
              die bereits Umsatz machen – aber operativ blockieren.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/qualifizierung">
                <Button className={landingTokens.ctaPrimary}>
                  Kostenlose Systemanalyse sichern
                </Button>
              </Link>
              <Link to="/qualifizierung" className={landingTokens.ctaSecondary}>
                Passt das überhaupt zu mir?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE CARDS Section */}
      <section className={`${landingTokens.sectionPadding} bg-muted/30`}>
        <div className={landingTokens.container}>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className={landingTokens.card}>
              <h3 className={`${landingTokens.headline.h3} text-foreground mb-3`}>
                Vertrieb planbar machen
              </h3>
              <p className={landingTokens.text.body}>
                Lead → Gespräch → Entscheidung → Abschluss.
                Ohne Zufall. Ohne Chaos.
              </p>
            </div>

            {/* Card 2 */}
            <div className={landingTokens.card}>
              <h3 className={`${landingTokens.headline.h3} text-foreground mb-3`}>
                Unternehmer entlasten
              </h3>
              <p className={landingTokens.text.body}>
                Prozesse, CRM und Follow-ups laufen als System –
                nicht im Kopf des Inhabers.
              </p>
            </div>

            {/* Card 3 */}
            <div className={landingTokens.card}>
              <h3 className={`${landingTokens.headline.h3} text-foreground mb-3`}>
                KI als Steuerungshebel
              </h3>
              <p className={landingTokens.text.body}>
                KI ersetzt keine Führung –
                sie verstärkt Struktur und Kontrolle.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default MasterHome;
