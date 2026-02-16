import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQSection";
import {
  StickyConversionHeader,
  CountdownBanner,
  ProblemAmplifier,
  SolutionSection,
  TestimonialGrid,
  PricingSection,
  GuaranteeSection,
  ExitIntentPopup,
} from "@/components/landing/conversion";

const faqItems = [
  {
    question: "Funktioniert das auch in meiner Branche?",
    answer: "Ja. Unser System ist branchenübergreifend erprobt – von Handwerk über Praxen bis zu Dienstleistern und Immobilien. Wir passen die KI-Strategie individuell an Ihre Geschäftsprozesse an.",
  },
  {
    question: "Wie schnell sehe ich Ergebnisse?",
    answer: "Die meisten Kunden sehen erste Effizienzgewinne innerhalb von 14–30 Tagen. Messbare Einsparungen bei Zeit und Kosten sind typischerweise nach 60–90 Tagen dokumentiert.",
  },
  {
    question: "Was passiert, wenn es nicht funktioniert?",
    answer: "Dann greift unsere 100% Erfolgs-Garantie. Wenn Sie nach 90 Tagen keine messbare Effizienzsteigerung in Ihren Kernprozessen sehen, arbeiten wir kostenlos weiter.",
  },
  {
    question: "Muss ich selbst etwas tun?",
    answer: "Minimal. Wir übernehmen Setup, Optimierung und laufende Betreuung. Sie investieren ca. 30 Minuten pro Woche für ein kurzes Status-Update.",
  },
  {
    question: "Ist das nicht zu teuer für ein kleines Unternehmen?",
    answer: "Die Frage ist: Was kostet Sie der manuelle Aufwand jeden Monat? Die meisten Unternehmer sparen durch Automatisierung ein Vielfaches der Investition – an Zeit und Personalkosten.",
  },
];

const MasterHome = () => {
  const navigate = useNavigate();
  const handleCTAClick = () => navigate("/qualifizierung");

  return (
    <div className="min-h-screen flex flex-col">
      <StickyConversionHeader onCtaClick={handleCTAClick} />

      <main className="flex-1 pt-14">
        {/* HERO */}
        <section className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-background via-muted to-background relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-light/5 rounded-full blur-3xl" />
          </div>
          <div className="max-w-6xl mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-destructive font-semibold text-sm md:text-base mb-6 tracking-wide uppercase">
                ⚠️ Achtung: Begrenzt auf 3 Unternehmen pro Monat
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground mb-6">
                Ihr Unternehmen arbeitet härter<br className="hidden md:block" /> als nötig
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
                Während Sie manuell planen, verwalten und nachfassen, automatisieren Ihre Wettbewerber längst –
                mit KI-Systemen, die <strong className="text-foreground">rund um die Uhr</strong> arbeiten.
              </p>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10">
                In den nächsten 3 Minuten zeigen wir Ihnen, welche Prozesse KI in Ihrem Unternehmen
                übernehmen kann – und wie über 150 Unternehmer damit Zeit und Geld sparen.
              </p>

              <button
                onClick={handleCTAClick}
                className="bg-primary hover:bg-primary-deep text-primary-foreground font-bold text-lg md:text-xl px-10 py-5 rounded-xl shadow-lg hover:shadow-[0_0_25px_hsl(30,90%,55%,0.4)] transition-all duration-300 mb-6"
              >
                Jetzt Potenzial aufdecken →
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <span>4.9/5 · Über 150 zufriedene Unternehmer</span>
              </div>
            </div>
          </div>
        </section>

        {/* COUNTDOWN BANNER */}
        <CountdownBanner />

        {/* PROBLEM */}
        <ProblemAmplifier />

        {/* SOLUTION */}
        <SolutionSection onCtaClick={handleCTAClick} />

        {/* TESTIMONIALS */}
        <TestimonialGrid />

        {/* PRICING */}
        <PricingSection onCtaClick={handleCTAClick} />

        {/* GUARANTEE */}
        <GuaranteeSection />

        {/* FAQ */}
        <FAQSection
          headline="Häufige Fragen – ehrlich beantwortet"
          items={faqItems}
        />

        {/* FINAL CTA */}
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Sie haben zwei Möglichkeiten
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-10 text-left">
              <div className="bg-muted/50 rounded-2xl p-6 border border-border/40">
                <p className="font-bold text-foreground mb-2">Option 1: Nichts tun</p>
                <p className="text-muted-foreground">
                  Weiter manuell arbeiten, Zeit und Geld in repetitive Prozesse stecken. Zusehen, wie die Konkurrenz automatisiert.
                </p>
              </div>
              <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary/30">
                <p className="font-bold text-foreground mb-2">Option 2: Jetzt handeln</p>
                <p className="text-muted-foreground">
                  KI-Systeme installieren, die Prozesse automatisieren und Ressourcen freisetzen. Ab heute. Mit Garantie.
                </p>
              </div>
            </div>
            <button
              onClick={handleCTAClick}
              className="bg-primary hover:bg-primary-deep text-primary-foreground font-bold text-lg md:text-xl px-10 py-5 rounded-xl shadow-lg hover:shadow-[0_0_25px_hsl(30,90%,55%,0.4)] transition-all duration-300"
            >
              Kostenlose KI-Potenzialanalyse sichern →
            </button>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ 100% kostenlos · ✓ Unverbindlich · ✓ In 2 Minuten erledigt
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <ExitIntentPopup />
    </div>
  );
};

export default MasterHome;
