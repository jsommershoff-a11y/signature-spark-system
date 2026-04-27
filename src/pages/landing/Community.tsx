import { useNavigate } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQSection";
import { SEOHead } from "@/components/landing/SEOHead";
import { Users, MessageCircle, Video, Zap, ArrowRight, CheckCircle, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const benefits = [
  {
    icon: Users,
    title: "Exklusive Community",
    description: "Vernetze dich mit Unternehmern, die den gleichen Weg gehen. Austausch auf Augenhöhe.",
  },
  {
    icon: Video,
    title: "Wöchentliche Live-Calls",
    description: "Jeden Mittwoch: Live Q&A mit dem Gründer. Deine Fragen, direkte Antworten.",
  },
  {
    icon: MessageCircle,
    title: "Direkter Draht zum Gründer",
    description: "Kein Support-Ticket. Stelle deine Frage direkt und erhalte persönliches Feedback.",
  },
  {
    icon: Zap,
    title: "Praxiserprobte KI-Strategien",
    description: "Lerne von echten Fallbeispielen, wie andere Unternehmer KI erfolgreich einsetzen.",
  },
];

const inclusions = [
  "Zugang zur geschlossenen Community",
  "Wöchentliche Live-Calls & Q&A Sessions",
  "Direkter Austausch mit dem Gründer",
  "Networking mit anderen Unternehmern",
  "Erste Einblicke ins KI-Automationen System",
];

const faqItems = [
  {
    question: "Was bekomme ich mit der Mitgliedschaft?",
    answer: "Vollen Zugang zur geschlossenen Skool-Community, wöchentliche Live-Calls und Q&A Sessions, direkten Austausch mit dem Gründer, Networking mit anderen Unternehmern und erste Einblicke ins KI-Automationen System.",
  },
  {
    question: "Kann ich jederzeit kündigen?",
    answer: "Ja, du kannst deine Mitgliedschaft jederzeit kündigen. Es gibt keine versteckten Kosten oder Mindestlaufzeiten über das gebuchte Jahr hinaus.",
  },
  {
    question: "Wo finden die Live-Calls statt?",
    answer: "In der geschlossenen Skool-Community. Termine werden in der Community angekündigt — du kannst live teilnehmen oder die Aufzeichnung im Anschluss ansehen.",
  },
  {
    question: "Wie geht es nach der Anfrage weiter?",
    answer: "Nach deiner Anfrage melden wir uns innerhalb von 24 Stunden bei dir. In einem kurzen Gespräch klären wir, ob die Community zu deiner Situation passt — und du bekommst direkt Zugang zur Skool-Community samt aller Features.",
  },
];

const Community = () => {
  const navigate = useNavigate();
  const goToQualifizierung = () => navigate("/qualifizierung");

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="KI-Community für Unternehmer | KI-Automationen"
        description="Geschlossene Community für Unternehmer: wöchentliche Live-Calls, direkter Gründer-Kontakt und praxiserprobte KI-Strategien. Jetzt Mitgliedschaft anfragen."
        canonical="/community"
      />
      <Header />

      <main className="flex-1">
        {/* ── 1. Hero ── */}
        <section className="pt-20 pb-16 md:pt-28 md:pb-24 bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-6 border-primary/40 text-primary font-semibold px-4 py-1.5">
                KI-Community für Unternehmer
              </Badge>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Werde Teil der{" "}
                <span className="text-primary">KI-Community</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Wöchentliche Live-Calls, direkter Draht zum Gründer und praxiserprobte KI-Strategien.
                Für Unternehmer, die KI nicht nur diskutieren, sondern operativ einsetzen wollen.
              </p>

              <Button
                size="lg"
                onClick={goToQualifizierung}
                className="gap-2 text-base px-10 py-6 text-lg font-semibold shadow-lg"
              >
                Jetzt anfragen
                <ArrowRight className="w-5 h-5" />
              </Button>

              <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Persönliches Vorgespräch · Jederzeit kündbar
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. Benefits ── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center mb-14">
              Was du als Mitglied bekommst
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

        {/* ── 3. Trust Logos ── */}
        <section className="py-12 md:py-16 bg-muted/30 border-y border-border/30">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
              Unsere Tools & Automatisierungen – powered by
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 max-w-4xl mx-auto opacity-70 hover:opacity-100 transition-opacity">
              {[
                { name: "n8n", url: "https://n8n.io", logo: "https://cdn.brandfetch.io/id2alue-rx/w/512/h/512/theme/dark/icon.jpeg?c=1id-4Ig6a1&t=1740622927026" },
                { name: "Make", url: "https://make.com", logo: "https://cdn.brandfetch.io/idnz0cZG3y/w/512/h/512/theme/dark/icon.jpeg?c=1id-4Ig6a1&t=1741462498220" },
                { name: "Stripe", url: "https://stripe.com", logo: "https://cdn.brandfetch.io/idxAg10C0L/w/512/h/512/theme/dark/icon.jpeg?c=1id-4Ig6a1&t=1668515654088" },
                { name: "PayPal", url: "https://paypal.com", logo: "https://cdn.brandfetch.io/idL0iThUjG/w/512/h/512/theme/dark/icon.jpeg?c=1id-4Ig6a1&t=1740547497069" },
                { name: "ChatGPT", url: "https://openai.com", logo: "https://cdn.brandfetch.io/idR3duQxYl/w/512/h/512/theme/dark/icon.jpeg?c=1id-4Ig6a1&t=1717836824484" },
                { name: "Google Drive", url: "https://drive.google.com", logo: "https://cdn.brandfetch.io/idnrSSPyKh/w/512/h/512/theme/dark/icon.jpeg?c=1id-4Ig6a1&t=1689610729878" },
                { name: "Outlook", url: "https://outlook.com", logo: "https://cdn.brandfetch.io/idchmboHEZ/w/512/h/512/theme/dark/icon.jpeg?c=1id-4Ig6a1&t=1730399385498" },
                { name: "Excel", url: "https://microsoft.com/excel", logo: "https://cdn.brandfetch.io/idchmboHEZ/w/512/h/512/theme/dark/icon.jpeg?c=1id-4Ig6a1&t=1730399385498" },
                { name: "Google Sheets", url: "https://sheets.google.com", logo: "https://cdn.brandfetch.io/idnrSSPyKh/w/512/h/512/theme/dark/icon.jpeg?c=1id-4Ig6a1&t=1689610729878" },
              ].map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                  title={tool.name}
                >
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    loading="lazy"
                  />
                  <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                    {tool.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Inclusions (Gain-Frame) ── */}
        <section className="py-16 md:py-24 bg-primary/5 border-y border-primary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                Das ist alles enthalten
              </h2>
              <p className="text-muted-foreground mb-10">
                Volle Mitgliedschaft, kein Add-on, keine versteckten Kosten.
              </p>

              <ul className="space-y-4 text-left max-w-md mx-auto mb-10">
                {inclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" onClick={goToQualifizierung} className="gap-2 text-base px-8 py-6">
                Jetzt anfragen
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── 5. CTA Card (Portal) ── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
                Mitgliedschaft im Überblick
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Im persönlichen Vorgespräch klären wir gemeinsam den passenden Zugang. Anschließend startest du direkt im Portal.
              </p>
            </div>

            <Card className="max-w-lg mx-auto border-2 border-primary shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="text-center">
                  <p className="text-sm font-semibold text-primary mb-4">MITGLIEDSCHAFT</p>

                  <ul className="space-y-3 text-left mb-6">
                    {inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Separator className="mb-6" />

                  <Button
                    size="lg"
                    onClick={goToQualifizierung}
                    className="w-full gap-2 text-base font-semibold"
                  >
                    Vorgespräch vereinbaren
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <p className="text-xs text-muted-foreground mt-4">
                    Bereits Mitglied?{" "}
                    <a href="/auth" className="text-primary font-medium hover:underline">
                      Zum Portal
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> SSL-verschlüsselt
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Persönliches Vorgespräch
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Direkter Portal-Zugang
              </span>
            </div>
          </div>
        </section>

        {/* ── 6. FAQ ── */}
        <FAQSection
          headline="Häufige Fragen"
          items={faqItems}
        />

        {/* ── 7. Final CTA ── */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Bereit für die Community?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Werde Teil der KI-Community und automatisiere mit Gleichgesinnten.
            </p>

            <Button
              size="lg"
              onClick={goToQualifizierung}
              className="gap-2 text-base px-10 py-6 text-lg font-semibold shadow-lg"
            >
              Jetzt anfragen
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
