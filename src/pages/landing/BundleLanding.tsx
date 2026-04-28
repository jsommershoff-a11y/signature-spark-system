import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Package } from "lucide-react";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEOHead } from "@/components/landing/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProofBar } from "@/components/landing/ProofBar";
import { DeliveryRoadmap } from "@/components/landing/DeliveryRoadmap";
import { FAQSection } from "@/components/landing/FAQSection";
import { ProductCTA } from "@/components/landing/ProductCTA";
import { StickyCtaBanner } from "@/components/landing/conversion/StickyCtaBanner";
import { TrustLogosSection } from "@/components/landing/home/TrustLogosSection";
import NotFound from "@/pages/NotFound";
import { AUTOMATIONS } from "@/data/automations";
import { getBundle, type Bundle } from "@/data/bundles";

const COMMON_FAQ = [
  {
    question: "Was kostet das Bundle?",
    answer:
      "Wir geben keine Listenpreise heraus, weil jede Umgebung anders ist (Volumen, Systeme, Integrationstiefe). Nach kurzer Bedarfsanalyse erhältst du innerhalb von 24 h ein konkretes Festpreis-Angebot — ohne versteckte Folgekosten.",
  },
  {
    question: "Was ist mit DSGVO und Datensicherheit?",
    answer:
      "Alle Komponenten laufen DSGVO-konform auf EU-Servern. AVV (Auftragsverarbeitung) ist im Paket. Sensible Daten verlassen niemals deine Infrastruktur ohne explizite Freigabe.",
  },
  {
    question: "Was passiert, wenn ich später Anpassungen brauche?",
    answer:
      "Innerhalb der 30 Tage Optimierungssupport: kostenlos. Danach optionale Wartungspakete oder On-Demand zum Stundensatz.",
  },
];

interface BundleLandingTemplateProps {
  bundle: Bundle;
}

/**
 * Einheitliches 6-Sektionen-Template für Bundle-Landingpages (/start, /growth).
 * Sektionen: Hero → Problem → System (Bot-Liste + Roadmap) → Proof → FAQ → CTA
 */
const BundleLandingTemplate = ({ bundle }: BundleLandingTemplateProps) => {
  const navigate = useNavigate();
  const products = bundle.automationSlugs
    .map((slug) => AUTOMATIONS.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${bundle.badge} – ${bundle.headline}`,
    description: bundle.solution,
    brand: { "@type": "Brand", name: "KI-Automationen" },
    offers: {
      "@type": "Offer",
      url: `https://ki-automationen.io${bundle.path}`,
      availability: "https://schema.org/PreOrder",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "EUR",
        price: 0,
        valueAddedTaxIncluded: false,
        description:
          "Preis auf Anfrage – individuelles Festpreis-Angebot nach kurzer Bedarfsanalyse.",
      },
      seller: { "@type": "Organization", name: "KRS Immobilien GmbH" },
    },
  };

  const allFaq = [...bundle.faq, ...COMMON_FAQ];

  return (
    <PublicLayout>
      <StickyCtaBanner />
      <SEOHead
        title={bundle.seoTitle}
        description={bundle.seoDescription}
        canonical={bundle.path}
        jsonLd={[productJsonLd]}
      />

      {/* 1. HERO */}
      <section className="bg-[#0F3E2E] text-white pt-14 pb-14 md:pt-20 md:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
            <div>
              <Badge className="bg-primary/20 text-primary-light border-primary/30 mb-4 inline-flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                {bundle.badge}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                {bundle.headline}
              </h1>
              <p className="text-lg text-white/85 mb-6 leading-relaxed">
                {bundle.oneLiner}
              </p>
              <ProductCTA
                slugs={bundle.automationSlugs}
                label={bundle.ctaText}
                variant="hero"
                showTrust={false}
              />
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary-light" />
                  Live in 7 Tagen
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary-light" />
                  Festpreis-Angebot in 24 h
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary-light" />
                  DSGVO &amp; AVV inklusive
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM */}
      <section className="bg-background py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 mb-4">
            Das Problem
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-5 tracking-tight">
            Warum dieses Bundle?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
            {bundle.problem}
          </p>
          <p className="text-lg md:text-xl font-semibold text-foreground leading-relaxed">
            {bundle.solution}
          </p>
        </div>
      </section>

      {/* 3. SYSTEM */}
      <section className="bg-muted/30 py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <Badge className="bg-primary/15 text-primary border-primary/30 mb-3">
              Im Bundle enthalten
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
              {products.length} produktive KI-Bots als ein System
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {products.map((p) => (
              <Card
                key={p.slug}
                className="hover:shadow-md transition-shadow flex flex-col"
              >
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {p.code}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Live in {p.leadDays} Tagen
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-base mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {p.subtitle}
                  </p>
                  <ul className="space-y-1.5 mb-4 flex-1">
                    {p.outcomes.slice(0, 2).map((o) => (
                      <li key={o} className="flex gap-1.5 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{o}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/automatisierungen/${p.slug}`}
                    className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 mt-auto"
                  >
                    Details ansehen
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Outcomes auf Bundle-Ebene */}
          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-4">
                Was du nach dem Rollout hast
              </h3>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bundle.outcomes.map((o) => (
                  <li key={o} className="flex gap-2 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground">{o}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Roadmap */}
          <div className="mt-12">
            <DeliveryRoadmap />
          </div>
        </div>
      </section>

      {/* 4. PROOF */}
      <TrustLogosSection />
      <ProofBar />

      {/* 5. FAQ */}
      <FAQSection items={allFaq} />

      {/* 6. CTA */}
      <section className="bg-[#FFF3EB] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Badge className="bg-primary/15 text-primary border-primary/30 mb-4">
            {bundle.badge}
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            {bundle.finalCtaHeadline}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-7 max-w-xl mx-auto leading-relaxed">
            {bundle.finalCtaSubline}
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary-deep"
            onClick={() =>
              navigate(
                `/qualifizierung?automations=${bundle.automationSlugs.join(",")}`,
              )
            }
          >
            {bundle.ctaText}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Unverbindlich · Festpreis-Angebot in 24 h · Bugfixes innerhalb der Termine inklusive
          </p>
        </div>
      </section>

      {/* Mobile Sticky-CTA */}
      <ProductCTA slugs={bundle.automationSlugs} variant="sticky" />
      <div className="h-16 md:hidden" aria-hidden="true" />
    </PublicLayout>
  );
};

// Routen-Wrapper für /start und /growth
export const StartBundlePage = () => {
  const bundle = getBundle("start");
  if (!bundle) return <NotFound />;
  return <BundleLandingTemplate bundle={bundle} />;
};

export const GrowthBundlePage = () => {
  const bundle = getBundle("growth");
  if (!bundle) return <NotFound />;
  return <BundleLandingTemplate bundle={bundle} />;
};

export default BundleLandingTemplate;
