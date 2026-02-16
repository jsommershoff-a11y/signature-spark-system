import { Check } from "lucide-react";

const plans = [
  {
    name: "KI-Prozess-Kickstart",
    price: "299",
    originalPrice: null,
    badge: null,
    featured: false,
    features: [
      "KI-Prozessanalyse Ihres Unternehmens",
      "Individueller Automatisierungsplan",
      "30-Tage Umsetzungsbegleitung",
      "Wöchentliche Effizienz-Reports",
    ],
  },
  {
    name: "KI-Komplettpaket",
    price: "999",
    originalPrice: "2.499",
    badge: "BELIEBTESTE WAHL",
    featured: true,
    features: [
      "Alles aus dem Kickstart-Paket",
      "Komplett-Setup aller Geschäftsprozesse",
      "Automatisierte Workflows & Follow-ups",
      "90-Tage intensive Betreuung",
      "Persönlicher Ansprechpartner",
      "100% Erfolgs-Garantie",
    ],
  },
];

export const PricingSection = ({ onCtaClick }: { onCtaClick: () => void }) => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Wählen Sie Ihren Startpunkt
          </h2>
          <p className="text-muted-foreground text-lg">
            Zwei Optionen. Ein Ziel: Mehr Effizienz, weniger Aufwand.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.featured
                  ? "border-primary bg-card shadow-lg ring-2 ring-primary/20"
                  : "border-border/40 bg-card shadow-sm"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="mb-6">
                {plan.originalPrice && (
                  <span className="text-muted-foreground line-through text-lg mr-2">{plan.originalPrice} €</span>
                )}
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-lg"> €</span>
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
                  plan.featured
                    ? "bg-primary hover:bg-primary-deep text-primary-foreground shadow-lg hover:shadow-xl"
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
