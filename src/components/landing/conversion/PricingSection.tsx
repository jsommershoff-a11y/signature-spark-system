import { Check } from "lucide-react";

const plans = [
  {
    name: "KI-Prozess-Kickstart",
    price: "998",
    valuePrice: "2.500+",
    savings: "1.500",
    badge: null,
    featured: false,
    vip: false,
    features: [
      "KI-Prozessanalyse Ihres Unternehmens",
      "Individueller Automatisierungsplan",
      "30-Tage Umsetzungsbegleitung",
      "Wöchentliche Effizienz-Reports",
    ],
  },
  {
    name: "KI-Komplettpaket",
    price: "2.998",
    valuePrice: "8.000+",
    savings: "5.000",
    badge: "BELIEBTESTE WAHL",
    featured: true,
    vip: false,
    features: [
      "Alles aus dem Kickstart-Paket",
      "Setup von 10 individuellen Prozessen",
      "Automatisierte Workflows & Follow-ups",
      "30-Tage intensive Betreuung",
      "Persönlicher Ansprechpartner",
      "100% Erfolgs-Garantie",
    ],
  },
  {
    name: "KI-VIP Done-for-You",
    price: "9.998",
    valuePrice: "25.000+",
    savings: "15.000",
    badge: "MAXIMALER IMPACT",
    featured: false,
    vip: true,
    features: [
      "Alles aus dem Komplettpaket",
      "Komplettes KI-Setup für Ihr Unternehmen",
      "Sie oder ein Mitarbeiter werden zum KI-Prozess-Experten ausgebildet",
      "Dediziertes Experten-Team an Ihrer Seite",
      "90-Tage intensive 1:1 Betreuung",
      "Quartalsweise Strategie-Optimierung",
      "Direkter Draht zum Geschäftsführer",
      "Premium-Support mit 4h Reaktionszeit",
      "100% Erfolgs-Garantie",
    ],
  },
];

export const PricingSection = ({ onCtaClick }: { onCtaClick: () => void }) => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Wählen Sie Ihren Startpunkt
          </h2>
          <p className="text-muted-foreground text-lg">
            Drei Stufen. Ein Ziel: Mehr Effizienz, weniger Aufwand.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.featured
                  ? "border-primary bg-card shadow-lg ring-2 ring-primary/20"
                  : plan.vip
                  ? "border-accent bg-card shadow-lg ring-2 ring-accent/30"
                  : "border-border/40 bg-card shadow-sm"
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full ${
                    plan.vip
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <h3 className="text-xl font-bold text-foreground mb-4">{plan.name}</h3>

              {/* Value-First Pricing */}
              <div className="mb-6 space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Gesamtwert der Leistungen:</span>
                  <div className="text-2xl font-bold text-muted-foreground line-through">
                    {plan.valuePrice} €
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Ihre Investition:</span>
                  <div className="text-4xl font-bold text-foreground">
                    {plan.price} <span className="text-lg">€</span>
                  </div>
                </div>
                <div className="inline-block bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
                  Sie sparen über {plan.savings} €
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onCtaClick}
                className={`w-full font-semibold text-lg py-4 rounded-xl transition-all ${
                  plan.vip
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl"
                    : plan.featured
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
              >
                Jetzt starten →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
