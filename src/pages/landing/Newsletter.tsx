import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { NewsletterSignupModal } from "@/components/landing/NewsletterSignupModal";
import { Sparkles, Video, Calendar, CheckCircle2, Users, Bot, Radio, Wand2, MessageSquare, Eye, Clock } from "lucide-react";

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

          {/* Live-Call Hervorhebung – Hero-Block */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 md:p-10 my-10 shadow-lg">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full animate-pulse">
              <Radio className="h-3 w-3" /> Live
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="rounded-xl bg-primary/15 p-3 shrink-0">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">
                    2× pro Woche · Live · Inklusive
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3">
                  Schau live zu, wie Prompts & KI gebaut werden – Schritt für Schritt
                </h2>
                <p className="text-muted-foreground text-base md:text-lg">
                  Zweimal pro Woche öffnen wir den Bildschirm: Du siehst <strong>in Echtzeit</strong>,
                  wie wir Prompts schreiben, KI-Workflows aufsetzen, Fehler debuggen und auf reale
                  Kundenfälle anwenden. Kein geschönter Kurs – echte Arbeit, mit allen Stolpersteinen.
                </p>
              </div>
            </div>

            {/* Termine */}
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <div className="rounded-lg bg-background/80 backdrop-blur border p-4 flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Dienstag</div>
                  <div className="font-bold">Prompt-Lab · 19:00 Uhr</div>
                </div>
              </div>
              <div className="rounded-lg bg-background/80 backdrop-blur border p-4 flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Donnerstag</div>
                  <div className="font-bold">KI-Workflow-Build · 19:00 Uhr</div>
                </div>
              </div>
            </div>

            {/* Was du live siehst */}
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              {[
                { icon: Wand2, label: "Prompts entstehen live – vom Whitepage bis zum Production-Output." },
                { icon: Eye, label: "Schritt-für-Schritt Bildschirm-Sharing in echten Tools (GPT, Claude, n8n)." },
                { icon: MessageSquare, label: "Deine Fragen, dein Use-Case – direkt gelöst im Call." },
              ].map((item, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <item.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Button size="lg" onClick={() => setOpen(true)} className="text-base">
                <Sparkles className="h-5 w-5 mr-2" />
                Platz im nächsten Live-Call sichern
              </Button>
              <p className="text-xs text-muted-foreground">
                Aufzeichnungen aller Calls bleiben dauerhaft im Mitgliederbereich verfügbar.
              </p>
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
      </div>

      <NewsletterSignupModal open={open} onOpenChange={setOpen} source="newsletter_page" />
    </PublicLayout>
  );
};

export default Newsletter;
