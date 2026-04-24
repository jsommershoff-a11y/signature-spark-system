import { useRef, useState, useEffect } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQSection";
import { SEOHead } from "@/components/landing/SEOHead";
import { Users, MessageCircle, Video, Zap, ArrowDown, CheckCircle, XCircle, Shield, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import n8nLogo from "@/assets/trust/n8n.png";
import makeLogo from "@/assets/trust/make.png";
import stripeLogo from "@/assets/trust/stripe.png";
import paypalLogo from "@/assets/trust/paypal.png";
import chatgptLogo from "@/assets/trust/chatgpt.png";
import gdriveLogo from "@/assets/trust/gdrive.png";
import outlookLogo from "@/assets/trust/outlook.png";
import excelLogo from "@/assets/trust/excel.png";
import gsheetsLogo from "@/assets/trust/gsheets.png";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'pricing-table-id': string;
          'publishable-key': string;
        },
        HTMLElement
      >;
    }
  }
}

const DEADLINE = new Date("2026-03-21T23:59:59").getTime();

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

const losses = [
  "Zugang zur geschlossenen Community",
  "Wöchentliche Live-Calls & Q&A Sessions",
  "Direkter Austausch mit dem Gründer",
  "Networking mit 61 anderen Unternehmern",
  "Erste Einblicke ins KI-Automationen System",
];

const faqItems = [
  {
    question: "Was passiert, wenn ich nicht bis zum 21. März buche?",
    answer: "Dein Zugang zur Skool-Community wird leider entfernt. Der kostenlose Testzeitraum endet, und ohne aktive Mitgliedschaft können wir dir keinen Zugang mehr gewähren.",
  },
  {
    question: "Kann ich jederzeit kündigen?",
    answer: "Ja, du kannst deine Mitgliedschaft jederzeit kündigen. Es gibt keine versteckten Kosten oder Mindestlaufzeiten über das gebuchte Jahr hinaus.",
  },
  {
    question: "Was genau ist im Founder-Preis enthalten?",
    answer: "Alles, was du aktuell kostenlos nutzt – Community-Zugang, wöchentliche Live-Calls, direkter Gründer-Kontakt, Networking und erste Einblicke ins KI-Automationen System. Plus alle zukünftigen Inhalte und Features, die wir hinzufügen.",
  },
  {
    question: "Warum wird der Preis auf 50 €/Monat erhöht?",
    answer: "Der Founder-Preis war ein exklusives Angebot für unsere ersten Mitglieder. Mit wachsendem Umfang der Community, mehr Inhalten und intensiverem Support wird der reguläre Preis ab dem 21. März 50 €/Monat (600 €/Jahr) betragen.",
  },
];

function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, DEADLINE - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const expired = diff <= 0;

  return { days, hours, minutes, seconds, expired };
}

const pad = (n: number) => String(n).padStart(2, "0");

const Community = () => {
  const checkoutRef = useRef<HTMLDivElement>(null);
  const { days, hours, minutes, seconds, expired } = useCountdown();

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="KI-Community für Unternehmer | KI-Automationen"
        description="Exklusive Community für Unternehmer: Wöchentliche Live-Calls, direkter Gründer-Kontakt und praxiserprobte KI-Strategien. Jetzt Founder-Preis sichern."
        canonical="/community"
      />
      <Header />

      <main className="flex-1">
        {/* ── 1. Urgency Banner (sticky) ── */}
        <div className="sticky top-0 z-50 bg-destructive text-destructive-foreground py-3 px-4 shadow-md">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span className="font-semibold">Founder-Preis endet in:</span>
            </div>
            {expired ? (
              <span className="font-bold">Angebot abgelaufen</span>
            ) : (
              <span className="font-mono font-bold text-lg">
                {days}d {pad(hours)}:{pad(minutes)}:{pad(seconds)}
              </span>
            )}
            <span className="hidden sm:inline opacity-60">|</span>
            <span className="text-center">
              Danach <span className="font-bold">50 €/Monat</span> statt 199 €/Jahr
            </span>
          </div>
        </div>

        {/* ── 2. Hero ── */}
        <section className="pt-20 pb-16 md:pt-28 md:pb-24 bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-6 border-primary/40 text-primary font-semibold px-4 py-1.5">
                Exklusiv für bestehende Mitglieder
              </Badge>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Sichere dir den Founder-Preis:{" "}
                <span className="text-primary">199 €/Jahr</span>{" "}
                <span className="text-muted-foreground text-2xl md:text-3xl">
                  statt bald 600 €/Jahr
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Du bist einer von 61 Mitgliedern, die jetzt den exklusiven Founder-Preis sichern können.
                Wer nicht bis zum <strong className="text-foreground">21. März</strong> bucht, verliert den Zugang zur Community.
              </p>

              {/* Price comparison */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10">
                <div className="text-center p-4 rounded-xl bg-muted/50 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Regulärer Preis ab 21.03.</p>
                  <p className="text-2xl font-bold text-muted-foreground line-through">50 €/Monat</p>
                  <p className="text-sm text-muted-foreground">= 600 €/Jahr</p>
                </div>
                <ArrowDown className="w-6 h-6 text-primary rotate-0 sm:-rotate-90" />
                <div className="text-center p-4 rounded-xl bg-primary/10 border-2 border-primary shadow-lg">
                  <p className="text-sm text-primary font-semibold mb-1">Dein Founder-Preis</p>
                  <p className="text-3xl font-bold text-primary">199 €/Jahr</p>
                  <p className="text-sm text-muted-foreground">= nur 16,58 €/Monat</p>
                </div>
              </div>

              <Button size="lg" onClick={scrollToCheckout} className="gap-2 text-base px-10 py-6 text-lg font-semibold shadow-lg">
                Jetzt Founder-Preis sichern
                <ArrowDown className="w-5 h-5" />
              </Button>

              <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Sichere Zahlung über Stripe · Jederzeit kündbar
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. Benefits ── */}
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

        {/* ── 3b. Trust Logos ── */}
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

        {/* ── 4. Loss Aversion ── */}
        <section className="py-16 md:py-24 bg-destructive/5 border-y border-destructive/20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-6" />
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                Das verlierst du ohne Buchung
              </h2>
              <p className="text-muted-foreground mb-10">
                Ohne aktive Mitgliedschaft wird dein Zugang am <strong className="text-foreground">21. März 2026</strong> entfernt.
              </p>

              <ul className="space-y-4 text-left max-w-md mx-auto mb-10">
                {losses.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" variant="destructive" onClick={scrollToCheckout} className="gap-2 text-base px-8 py-6">
                Zugang jetzt sichern – 199 €/Jahr
              </Button>
            </div>
          </div>
        </section>

        {/* ── 5. Pricing + Stripe Checkout ── */}
        <section ref={checkoutRef} className="py-16 md:py-24 scroll-mt-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
                Spare 401 € im ersten Jahr
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
                Jetzt zum Founder-Preis buchen
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Wähle dein Paket und schließe die Buchung direkt ab. Sicher, schnell und unkompliziert.
              </p>
            </div>

            {/* Founder Price Card */}
            <Card className="max-w-lg mx-auto border-2 border-primary shadow-xl mb-10">
              <CardContent className="p-6 md:p-8">
                <div className="text-center">
                  <p className="text-sm font-semibold text-primary mb-2">FOUNDER-PREIS</p>
                  <div className="flex items-baseline justify-center gap-3 mb-2">
                    <span className="text-4xl md:text-5xl font-bold text-foreground">199 €</span>
                    <span className="text-muted-foreground">/Jahr</span>
                  </div>
                  <p className="text-muted-foreground line-through mb-1">Regulär: 600 €/Jahr (50 €/Monat)</p>
                  <p className="text-sm text-primary font-semibold mb-6">Du sparst 401 € im ersten Jahr</p>

                  <Separator className="mb-6" />

                  <ul className="space-y-3 text-left mb-6">
                    {losses.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Stripe Pricing Table */}
            <div className="w-full max-w-4xl mx-auto overflow-x-auto">
              <stripe-pricing-table
                pricing-table-id="prctbl_1TA1NXBmqjP8eJrScytk6Mrj"
                publishable-key="pk_live_51NpX6uBmqjP8eJrSMZt8bBoobLYUDo7oxVHiGHKKdrUT6fmVeA0tEltdLGuP3Rr4a8DeeilvsbNJL5cblrNCm7tR00njg6DyC5"
              />
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> SSL-verschlüsselt
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Jederzeit kündbar
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Sofortiger Zugang
              </span>
            </div>
          </div>
        </section>

        {/* ── 6. FAQ ── */}
        <FAQSection
          headline="Häufige Fragen"
          items={faqItems}
        />

        {/* ── 7. Final CTA with Countdown ── */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Entscheide dich jetzt – bevor es zu spät ist
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Der Founder-Preis gilt nur noch für kurze Zeit. Danach zahlst du das Dreifache.
            </p>

            {!expired && (
              <div className="flex items-center justify-center gap-3 mb-8">
                {[
                  { label: "Tage", value: days },
                  { label: "Std", value: hours },
                  { label: "Min", value: minutes },
                  { label: "Sek", value: seconds },
                ].map((unit, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-3 min-w-[60px] shadow-sm">
                    <p className="text-2xl font-mono font-bold text-foreground">{pad(unit.value)}</p>
                    <p className="text-xs text-muted-foreground">{unit.label}</p>
                  </div>
                ))}
              </div>
            )}

            <Button size="lg" onClick={scrollToCheckout} className="gap-2 text-base px-10 py-6 text-lg font-semibold shadow-lg">
              Founder-Preis sichern – 199 €/Jahr
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
