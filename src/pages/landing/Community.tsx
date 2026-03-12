import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Users, MessageCircle, Video, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SKOOL_URL = "https://www.skool.com/dein-erfolg";

const benefits = [
  {
    icon: Users,
    title: "Exklusive Community",
    description: "Vernetze dich mit Unternehmern, die den gleichen Weg gehen. Austausch auf Augenhöhe, keine Anfänger-Fragen.",
  },
  {
    icon: Video,
    title: "Wöchentliche Live-Calls",
    description: "Jeden Mittwoch: Live Q&A mit dem Gründer. Deine Fragen, direkte Antworten, sofort umsetzbar.",
  },
  {
    icon: MessageCircle,
    title: "Direkter Draht zum Gründer",
    description: "Kein Support-Ticket, kein Warten. Stelle deine Frage direkt in der Community und erhalte persönliches Feedback.",
  },
  {
    icon: Zap,
    title: "Praxiserprobte KI-Strategien",
    description: "Lerne von echten Fallbeispielen, wie andere Unternehmer KI bereits erfolgreich im Alltag einsetzen.",
  },
];

const included = [
  "Zugang zur geschlossenen Skool-Community",
  "Wöchentliche Live-Calls & Q&A Sessions",
  "Direkter Austausch mit dem Gründer",
  "Networking mit anderen Unternehmern",
  "Erste Einblicke ins KRS Signature System",
];

const Community = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <span className="inline-block bg-primary/10 text-primary font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
                Kostenloser Einstieg
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Werde Teil der KI-Unternehmer-Community
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Der einfachste Weg, KI in deinem Unternehmen zu nutzen – gemeinsam mit Gleichgesinnten, die denselben Weg gehen.
              </p>
              <a href={SKOOL_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2 text-base px-8 py-6">
                  Jetzt kostenlos beitreten
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-14">
              Was dich in der Community erwartet
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {benefits.map((b, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-2xl bg-card border border-border/40 shadow-sm">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <b.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">{b.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included + CTA */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
                Alles inklusive – kostenlos
              </h2>
              <ul className="space-y-4 text-left mb-12">
                {included.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <a href={SKOOL_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2 text-base px-8 py-6">
                  Jetzt der Community beitreten
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              <p className="text-sm text-muted-foreground mt-4">
                Kein Risiko. Kein Abo. Jederzeit verlassen.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
