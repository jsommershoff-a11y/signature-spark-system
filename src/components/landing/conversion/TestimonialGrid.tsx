import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Thomas M.",
    company: "Handwerksbetrieb, München",
    quote: "20 Stunden pro Woche eingespart – Angebote, Nachfassen und Planung laufen jetzt automatisch.",
    badge: "20h/Woche gespart",
    initials: "TM",
  },
  {
    name: "Sandra K.",
    company: "Zahnarztpraxis, Hamburg",
    quote: "Verwaltungsaufwand halbiert. Mein Team konzentriert sich endlich wieder auf die Patienten.",
    badge: "-50% Verwaltung",
    initials: "SK",
  },
  {
    name: "Michael R.",
    company: "Immobilienmakler, Berlin",
    quote: "ROI von 12x in den ersten 90 Tagen. Prozesse, die früher Tage dauerten, erledigt die KI in Minuten.",
    badge: "12x ROI",
    initials: "MR",
  },
];

export const TestimonialGrid = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Das sagen unsere Kunden
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-muted-foreground">4.9 von 5 Sternen · Über 150 Unternehmer vertrauen uns</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{t.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.company}</p>
                </div>
              </div>
              <p className="text-foreground mb-4 italic">"{t.quote}"</p>
              <span className="inline-block bg-primary/10 text-primary font-bold text-sm px-3 py-1 rounded-full">
                {t.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
