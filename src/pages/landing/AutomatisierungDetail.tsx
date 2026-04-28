import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Sparkles, Target, Users } from "lucide-react";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEOHead } from "@/components/landing/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import NotFound from "@/pages/NotFound";
import { AUTOMATIONS } from "@/data/automations";

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

  return (
    <PublicLayout>
      <SEOHead
        title={`${product.name} – ${product.subtitle} | KI-Automationen`}
        description={`${product.solution.slice(0, 155)}`}
        canonical={`/automatisierungen/${product.slug}`}
        jsonLd={[productJsonLd, breadcrumbsJsonLd]}
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
                {product.leadDays > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Produktiv in {product.leadDays} Tagen
                  </span>
                )}
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
                <div className="text-2xl font-bold mb-1">
                  Auf Anfrage
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  Individuelles Angebot nach kurzer Bedarfsanalyse.
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

      {/* Inhalte */}
      <section className="bg-background py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Pain → Solution */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2 text-destructive">
                  <Target className="h-5 w-5" />
                  <h2 className="font-semibold">Das Problem</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.pain}</p>
              </CardContent>
            </Card>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <h2 className="font-semibold">So lösen wir es</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.solution}</p>
              </CardContent>
            </Card>
          </div>

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

          {/* Final CTA */}
          <div className="text-center pt-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-deep">
              <Link to={`/qualifizierung?automation=${product.slug}`}>
                {product.name} anfragen
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Du erhältst nach kurzer Bedarfsanalyse ein individuelles Angebot.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
