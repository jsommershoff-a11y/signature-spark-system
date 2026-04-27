import { ArrowRight, Calendar, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Portal-CTA Section
 *
 * Ersetzt die frühere öffentliche Pricing-Übersicht. Alle Preisangaben werden
 * ausschließlich nach einem persönlichen Vorgespräch und im eingeloggten
 * Portal kommuniziert.
 */
export const PricingSection = ({ onCtaClick }: { onCtaClick: () => void }) => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Persönliches Vorgespräch
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Dein passendes System – nach Maß
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Jedes Unternehmen ist anders. Im kostenlosen Erstgespräch analysieren wir deine
            Situation und stimmen das passende Paket gemeinsam ab. Den vollen Überblick
            inklusive Konditionen erhältst du direkt im Portal.
          </p>
        </div>

        <Card className="border-2 border-primary/30 shadow-xl bg-card">
          <CardContent className="p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Erstgespräch sichern
            </h3>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Unverbindlich, kostenlos, ohne Verkaufsdruck. Wir prüfen, ob unser System
              zu deinem Unternehmen passt – und du erhältst sofort einen klaren Fahrplan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Button
                size="lg"
                onClick={onCtaClick}
                className="gap-2 text-base font-semibold"
              >
                <Calendar className="w-4 h-4" />
                Vorgespräch vereinbaren
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="gap-2 text-base font-semibold"
              >
                <a href="/auth">
                  Bereits Kunde? Zum Portal
                </a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground border-t border-border pt-6">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                100% unverbindlich
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                15-Min Erstgespräch
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Persönliches Konzept
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
