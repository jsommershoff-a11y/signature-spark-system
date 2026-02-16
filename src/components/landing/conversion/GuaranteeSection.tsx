import { ShieldCheck, Award, MapPin } from "lucide-react";

const trustBadges = [
  { icon: ShieldCheck, label: "TÜV-geprüfter Prozess" },
  { icon: Award, label: "Google Partner" },
  { icon: MapPin, label: "Made in Germany" },
];

export const GuaranteeSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-2xl border-2 border-primary/30 bg-card p-8 md:p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            100% Erfolgs-Garantie
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Wenn Sie nach 90 Tagen nicht mindestens <strong className="text-foreground">30% mehr qualifizierte Anfragen</strong> erhalten,
            arbeiten wir kostenlos weiter – bis das Ergebnis stimmt. Ohne Wenn und Aber.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <badge.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
