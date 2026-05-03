import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout, Hero, FinalCTA } from "@/components/landing";
import { SEOHead } from "@/components/landing/SEOHead";
import { TrustLogosSection } from "@/components/landing/home/TrustLogosSection";
import { TestimonialGrid } from "@/components/landing/conversion/TestimonialGrid";
import { FAQSection } from "@/components/landing/FAQSection";
import { StickyBookingBar } from "@/components/landing/StickyBookingBar";
import { landingTokens } from "@/styles/landing-tokens";
import { trackEvent } from "@/lib/analytics";
import { CheckCircle2, Calendar, Target, ShieldCheck } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Klarheit über Engpässe",
    text: "Wir analysieren in 30 Minuten, wo dein Unternehmen Zeit, Umsatz oder Struktur verliert.",
  },
  {
    icon: Calendar,
    title: "Konkreter Fahrplan",
    text: "Du erhältst einen ersten Automatisierungs-Fahrplan – passend zu Branche und Größe.",
  },
  {
    icon: ShieldCheck,
    title: "Unverbindlich & ehrlich",
    text: "Kein Verkaufsgespräch. Wenn wir nicht passen, sagen wir es dir direkt.",
  },
];

const agenda = [
  "Status-Quo: Welche Prozesse kosten dich aktuell am meisten Zeit?",
  "Engpass-Analyse: Wo verlierst du Umsatz oder Mitarbeiterkapazität?",
  "Zielbild: Wie sieht dein Unternehmen in 12 Monaten automatisiert aus?",
  "Nächster Schritt: Lohnt sich eine tiefere Potenzial-Analyse?",
];

const faqItems = [
  {
    question: "Was kostet das Erstgespräch?",
    answer:
      "Das Erstgespräch ist zu 100 % kostenlos und unverbindlich. Es entstehen keinerlei Kosten – auch nicht im Nachgang, falls wir nicht zusammenarbeiten.",
  },
  {
    question: "Wie lange dauert das Erstgespräch?",
    answer:
      "Plane rund 30 Minuten ein. In dieser Zeit klären wir deinen Status quo, deine größten Engpässe und ob eine tiefere Potenzial-Analyse für dich sinnvoll ist.",
  },
  {
    question: "Wie bereite ich mich auf das Gespräch vor?",
    answer:
      "Du brauchst nichts vorbereiten – ein paar Stichpunkte zu deinen aktuell zeitintensivsten Prozessen (z. B. Angebotserstellung, Lead-Bearbeitung, Personalplanung) und ein grobes Gefühl für deine Ziele in den nächsten 12 Monaten reichen aus.",
  },
  {
    question: "Wer sollte am Gespräch teilnehmen?",
    answer:
      "Idealerweise du als Entscheider:in (Geschäftsführung / Inhaber:in). Wenn dein:e Operations- oder IT-Verantwortliche:r früh eingebunden werden soll, lade ihn/sie gern dazu – das spart später eine Schleife.",
  },
  {
    question: "Wird mir im Gespräch direkt etwas verkauft?",
    answer:
      "Nein. Das Gespräch dient ausschließlich der Analyse und gegenseitigen Einschätzung. Wenn wir einen Hebel sehen, schlagen wir einen nächsten Schritt vor – die Entscheidung liegt zu 100 % bei dir.",
  },
  {
    question: "Über welches Tool findet das Gespräch statt?",
    answer:
      "Per Zoom oder Google Meet (Link bekommst du nach Terminbestätigung per E-Mail). Auf Wunsch auch per Telefon.",
  },
  {
    question: "Was passiert, wenn wir nicht zusammenpassen?",
    answer:
      "Dann sagen wir es dir direkt und ehrlich – inklusive einer kurzen Empfehlung, was für dich aktuell der bessere Weg wäre. Kein Pitch, kein Druck.",
  },
];

const TRACKING_CTA = "erstgespraech";

const Erstgespraech = () => {
  const navigate = useNavigate();
  const goToBooking = () => navigate("/qualifizierung");

  // Page-View tracken (einmalig pro Mount)
  useEffect(() => {
    void trackEvent("erstgespraech_view", {
      path: "/erstgespraech",
      tracking_cta: TRACKING_CTA,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });
  }, []);

  return (
    <PublicLayout>
      <SEOHead
        title="Erstgespräch buchen – KI Automationen | 30 Min. kostenlos & unverbindlich"
        description="Sichere dir dein kostenloses 30-minütiges Erstgespräch. Wir analysieren deine Prozesse und zeigen dir konkrete Automatisierungs-Potenziale für dein Unternehmen."
        canonical="/erstgespraech"
      />

      <Hero
        badge="Kostenloses 30-Min. Erstgespräch"
        headline="Lerne uns kennen – ohne Verkaufsdruck."
        problem="Du weißt, dass dein Unternehmen automatisierter laufen müsste – aber nicht, wo du anfangen sollst?"
        solution="Im Erstgespräch finden wir gemeinsam heraus, wo dein größter Hebel liegt."
        subline=""
        ctaText="Termin sichern"
        onCtaClick={goToBooking}
        trackingCta={TRACKING_CTA}
      />

      {/* Trust: Tool-Logos + Testimonials direkt unter Hero */}
      <TrustLogosSection />
      <TestimonialGrid />

      {/* Benefits */}
      <section className={`${landingTokens.sectionPadding} bg-background`}>
        <div className={landingTokens.container}>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className={landingTokens.badge}>Was du bekommst</span>
            <h2 className={`${landingTokens.headline.h2} text-foreground mt-5`}>
              30 Minuten, die deine nächsten 12 Monate verändern
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className={landingTokens.card}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className={`${landingTokens.headline.h3} text-foreground mb-2`}>
                  {b.title}
                </h3>
                <p className={landingTokens.text.body}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agenda */}
      <section className={`${landingTokens.sectionPadding} bg-muted/30`}>
        <div className={landingTokens.container}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className={landingTokens.badgeAccent}>Agenda</span>
              <h2 className={`${landingTokens.headline.h2} text-foreground mt-5 mb-5`}>
                So läuft dein Erstgespräch ab
              </h2>
              <p className={landingTokens.text.body}>
                Strukturiert, fokussiert und mit klarer Empfehlung am Ende –
                nicht mit einem PDF-Angebot, sondern mit echter Klarheit.
              </p>
            </div>
            <ul className="space-y-4">
              {agenda.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/40"
                >
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FAQSection
        headline="Häufige Fragen zum Erstgespräch"
        items={faqItems}
        mobilePriority={["kostet", "dauert", "vorbereit", "teilnehmen"]}
        trackingSection="erstgespraech"
      />

      <FinalCTA
        headline="Bereit für dein Erstgespräch?"
        subline="Wähle einen freien Termin – wir freuen uns auf dich."
        ctaText="Jetzt Termin sichern"
        onCtaClick={goToBooking}
        trackingCta={TRACKING_CTA}
      />
    </PublicLayout>
  );
};

export default Erstgespraech;
