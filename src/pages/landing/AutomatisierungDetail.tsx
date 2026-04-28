import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  Users,
  TrendingUp,
  AlertTriangle,
  Zap,
  Building2,
  Stethoscope,
  Scale,
  Briefcase,
} from "lucide-react";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEOHead } from "@/components/landing/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import NotFound from "@/pages/NotFound";
import { AUTOMATIONS } from "@/data/automations";
import { DeliveryRoadmap } from "@/components/landing/DeliveryRoadmap";

const FAQ = [
  {
    q: "Was kostet die Lösung?",
    a: "Wir geben keine Listenpreise heraus, weil jede Umgebung anders ist (Volumen, Systeme, Integrationstiefe). Nach kurzer Bedarfsanalyse erhältst du innerhalb von 24 h ein konkretes Festpreis-Angebot — ohne versteckte Folgekosten.",
  },
  {
    q: "Wie lange dauert die Einrichtung wirklich?",
    a: "7 Tage bis Delivery (Tag 0 Kickoff → Tag 7 live). Tag 10 Setup-Check, Tag 20 Optimierung. Bugfixes innerhalb dieser Termine sind inklusive — du hast 30 Tage Optimierungssupport.",
  },
  {
    q: "Was ist mit DSGVO und Datensicherheit?",
    a: "Alle Komponenten laufen DSGVO-konform auf EU-Servern. AVV (Auftragsverarbeitung) ist im Paket. Sensible Daten verlassen niemals deine Infrastruktur ohne explizite Freigabe.",
  },
  {
    q: "Was passiert, wenn ich später Anpassungen brauche?",
    a: "Innerhalb der 30 Tage Optimierungssupport: kostenlos. Danach optionale Wartungspakete oder On-Demand zum Stundensatz. Du bist nie an uns gebunden — Code & Setup gehören dir.",
  },
  {
    q: "Brauche ich technisches Vorwissen?",
    a: "Nein. Wir liefern eine schlüsselfertige Lösung. Du erhältst eine kurze Einweisung (30–60 Min) und eine Schritt-für-Schritt-Dokumentation für dein Team.",
  },
];

const USE_CASES = [
  {
    icon: Stethoscope,
    branch: "Arztpraxen & MVZ",
    benefit: "MFA-Stunden zurückgewonnen, weniger No-Shows, 24/7 erreichbar.",
  },
  {
    icon: Scale,
    branch: "Kanzleien & Steuerberater",
    benefit: "Mandatsanfragen automatisch qualifiziert, Termine ohne Ping-Pong.",
  },
  {
    icon: Building2,
    branch: "Handwerk & Bau",
    benefit: "Anfragen außerhalb der Bürozeiten erfasst, kein Lead geht verloren.",
  },
  {
    icon: Briefcase,
    branch: "Berater & Agenturen",
    benefit: "Discovery-Calls werden automatisch vorbereitet und nachbereitet.",
  },
];

export default function AutomatisierungDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = AUTOMATIONS.find((a) => a.slug === slug);

  if (!product) return <NotFound />;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.solution,
    sku: product.code,
    brand: { "@type": "Brand", name: "KI-Automationen" },
    offers: {
      "@type": "Offer",
      url: `https://ki-automationen.io/automatisierungen/${product.slug}`,
      availability: "https://schema.org/PreOrder",
      businessFunction: "http://purl.org/goodrelations/v1#Sell",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "EUR",
        price: 0,
        valueAddedTaxIncluded: false,
        description: "Preis auf Anfrage – individuelles Angebot nach kurzer Bedarfsanalyse.",
      },
      seller: { "@type": "Organization", name: "KRS Immobilien GmbH" },
      potentialAction: {
        "@type": "RequestQuoteAction",
        target: `https://ki-automationen.io/qualifizierung?automation=${product.slug}`,
        name: "Angebot anfragen",
      },
    },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: "https://ki-automationen.io/" },
      { "@type": "ListItem", position: 2, name: "Automatisierungen", item: "https://ki-automationen.io/automatisierungen" },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <PublicLayout>
      <SEOHead
        title={`${product.name} – ${product.subtitle} | KI-Automationen`}
        description={`${product.solution.slice(0, 155)}`}
        canonical={`/automatisierungen/${product.slug}`}
        jsonLd={[productJsonLd, breadcrumbsJsonLd, faqJsonLd]}
      />

      {/* Hero */}
      <section className="bg-[#0F3E2E] text-white pt-12 pb-12 md:pt-16 md:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link
            to="/automatisierungen"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Zur Übersicht
          </Link>

          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="outline" className="font-mono text-xs border-white/30 text-white/80">
                  {product.code}
                </Badge>
                {product.category === "education" ? (
                  <Badge className="bg-primary/20 text-primary-light border-primary/30">
                    KI-Profi Programm
                  </Badge>
                ) : (
                  <Badge className="bg-white/10 text-white border-white/20">Automatisierung</Badge>
                )}
                {product.recurring && (
                  <Badge variant="outline" className="border-white/30 text-white/80">
                    monatlich · min. {product.minMonths} Monate
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{product.name}</h1>
              <p className="text-lg text-white/80 mb-6">{product.subtitle}</p>

              <div className="flex flex-wrap items-center gap-5 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Live in 7 Tagen, voll optimiert in 20
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Inkl. 30 Tage Optimierungssupport
                </span>
              </div>
            </div>

            {/* Anfrage-Karte */}
            <Card className="w-full md:w-72 bg-white text-foreground">
              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground mb-1">Investition</div>
                <div className="text-2xl font-bold mb-1">Auf Anfrage</div>
                <div className="text-xs text-muted-foreground mb-4">
                  Individuelles Festpreis-Angebot nach kurzer Bedarfsanalyse.
                </div>
                <Button asChild size="lg" className="w-full bg-primary hover:bg-primary-deep">
                  <Link to={`/qualifizierung?automation=${product.slug}`}>
                    Jetzt anfragen
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Unverbindlich.<br />
                  Antwort innerhalb von 24 h.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vorher / Nachher */}
      <section className="bg-background py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 mb-3">
              Schmerz vs. Lösung
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              So sieht dein Alltag aus — vorher und nachher
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-bold uppercase text-xs tracking-wider">Ohne Lösung</h3>
                </div>
                <p className="text-sm text-foreground leading-relaxed font-medium mb-3">
                  {product.pain}
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-destructive">✕</span>
                    Manueller Aufwand bindet wertvolle Mitarbeiterstunden
                  </li>
                  <li className="flex gap-2">
                    <span className="text-destructive">✕</span>
                    Inkonsistente Qualität, vergessene Vorgänge
                  </li>
                  <li className="flex gap-2">
                    <span className="text-destructive">✕</span>
                    Skaliert nur durch Neueinstellungen
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <Zap className="h-5 w-5" />
                  <h3 className="font-bold uppercase text-xs tracking-wider">Mit {product.code}</h3>
                </div>
                <p className="text-sm text-foreground leading-relaxed font-medium mb-3">
                  {product.solution}
                </p>
                <ul className="space-y-1.5 text-sm">
                  {product.outcomes.slice(0, 3).map((o) => (
                    <li key={o} className="flex gap-2 text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI-Block */}
      <section className="bg-[#0F3E2E] text-white py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <Badge className="bg-primary/20 text-primary-light border-primary/30 mb-3">
              Return on Investment
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Was du dir mit {product.code} pro Monat zurückholst
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto">
              Konservativ gerechnet — die meisten Kunden liegen über diesen Werten.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
              <Clock className="h-6 w-6 text-primary-light mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">8–20 h</div>
              <div className="text-xs text-white/70 uppercase tracking-wider">
                Zeit gespart pro Woche
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
              <TrendingUp className="h-6 w-6 text-primary-light mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">2.000–5.000 €</div>
              <div className="text-xs text-white/70 uppercase tracking-wider">
                Wertäquivalent / Monat
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
              <Sparkles className="h-6 w-6 text-primary-light mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">&lt; 90 Tage</div>
              <div className="text-xs text-white/70 uppercase tracking-wider">
                Bis zum Break-Even
              </div>
            </div>
          </div>

          <p className="text-xs text-white/60 text-center max-w-2xl mx-auto">
            Berechnung basiert auf Erfahrungswerten aus &gt;50 Implementierungen. Konkrete Werte für deine
            Situation berechnen wir im Erstgespräch.
          </p>
        </div>
      </section>

      {/* Inhalte */}
      <section className="bg-background py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Outcomes */}
          <div>
            <h2 className="text-2xl font-bold mb-5">Das hast du nach der Einrichtung</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {product.outcomes.map((o) => (
                <div key={o} className="flex gap-3 p-4 rounded-lg border bg-card">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{o}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div>
            <h2 className="text-2xl font-bold mb-5">Im Lieferumfang enthalten</h2>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {product.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases */}
          <div>
            <h2 className="text-2xl font-bold mb-5">Wo {product.code} bereits läuft</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {USE_CASES.map((u) => (
                <Card key={u.branch} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5 h-fit shrink-0">
                      <u.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground mb-0.5">
                        {u.branch}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{u.benefit}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Ideal for */}
          <Card className="bg-muted/40">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Ideal für
              </h3>
              <p className="text-base">{product.idealFor}</p>
            </CardContent>
          </Card>

          {product.bundleNote && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-5 text-sm">
                <strong className="text-foreground">Hinweis:</strong>{" "}
                <span className="text-muted-foreground">{product.bundleNote}</span>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Roadmap */}
      <section className="bg-background pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <DeliveryRoadmap />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-background py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <Badge className="bg-primary/15 text-primary border-primary/30 mb-3">FAQ</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Häufige Fragen vor dem Start
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border rounded-lg bg-card px-4"
              >
                <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#FFF3EB] py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Target className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Bereit für {product.name}?
          </h2>
          <p className="text-base text-muted-foreground mb-6 max-w-xl mx-auto">
            Ein kurzer Anruf reicht, um Setup, Integrationen und Lieferzeit zu klären.
            Du bekommst innerhalb von 24 h dein individuelles Angebot.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary-deep">
            <Link to={`/qualifizierung?automation=${product.slug}`}>
              {product.name} anfragen
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Unverbindlich · Festpreis-Angebot · Bugfixes innerhalb der Termine inklusive
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
