import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { NewsletterSignupModal } from "@/components/landing/NewsletterSignupModal";
import { Sparkles, Video, Calendar, CheckCircle2, Users, Bot } from "lucide-react";

const Newsletter = () => {
  const [open, setOpen] = useState(false);

  return (
    <PublicLayout>
      <Helmet>
        <title>Newsletter + 1 Monat Mitgliederbereich kostenlos | KI Automationen</title>
        <meta
          name="description"
          content="Newsletter abonnieren und sofort 30 Tage Vollzugriff auf den Mitgliederbereich erhalten – inklusive 2× wöchentlich Live-Call zu Prompts & KI-Workflows."
        />
        <link rel="canonical" href="https://www.dein-automatisierungsberater.de/newsletter" />
      </Helmet>

      <div className="bg-gradient-to-b from-background to-muted/30">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="text-center space-y-4 mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              <Sparkles className="h-3.5 w-3.5" /> Newsletter + Mitgliederbereich
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              1 Monat Mitgliederbereich kostenlos – inklusive 2× wöchentlich Live-Call
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trag dich ein, erhalte sofort Zugang zum Mitgliederbereich und sieh live, wie wir
              Prompts entwickeln, KI-Workflows aufbauen und auf reale Kundenfälle anwenden.
            </p>
            <div className="flex justify-center pt-2">
              <Button size="lg" onClick={() => setOpen(true)} className="text-base px-8">
                <Sparkles className="h-5 w-5 mr-2" />
                Jetzt eintragen & freischalten
              </Button>
            </div>
          </div>

          {/* Live-Call Hervorhebung */}
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 md:p-8 my-10">
            <div className="flex items-start gap-4">
              <Video className="h-10 w-10 text-primary shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                    2× wöchentlich Live
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  Live mitverfolgen, wie Prompts & KI entstehen
                </h2>
                <p className="text-muted-foreground">
                  Zweimal pro Woche bauen wir live im Call neue Prompts, optimieren KI-Workflows und
                  arbeiten echte Kundenfälle durch. Du siehst genau, welche Tools, Strukturen und
                  Formulierungen funktionieren – und kannst deine eigenen Fragen direkt einbringen.
                </p>
              </div>
            </div>
          </div>

          {/* Bullet Benefits */}
          <div className="grid md:grid-cols-3 gap-4 my-10">
            {[
              { icon: Bot, title: "Prompt-Bibliothek", text: "Sofort Zugriff auf erprobte Prompts & Vorlagen." },
              { icon: Users, title: "Live mit Experten", text: "2× wöchentlich Q&A und Workflow-Building live." },
              { icon: CheckCircle2, title: "30 Tage gratis", text: "Voller Mitgliederbereich – ohne Zahlungsdaten." },
            ].map((b) => (
              <div key={b.title} className="rounded-lg border bg-card p-5">
                <b.icon className="h-6 w-6 text-primary mb-2" />
                <div className="font-semibold mb-1">{b.title}</div>
                <p className="text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button size="lg" onClick={() => setOpen(true)} className="text-base px-8">
              Jetzt 1 Monat sichern
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Keine Kreditkarte nötig · Jederzeit abmeldbar
            </p>
          </div>
        </section>
      </main>

      <NewsletterSignupModal open={open} onOpenChange={setOpen} source="newsletter_page" />
    </PublicLayout>
  );
};

export default Newsletter;
