import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, Sparkles, Zap, GraduationCap } from "lucide-react";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEOHead } from "@/components/landing/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AUTOMATIONS, type Automation } from "@/data/automations";

type Filter = "all" | "automation" | "education";

const FILTERS: { value: Filter; label: string; icon: typeof Zap }[] = [
  { value: "all", label: "Alle Produkte", icon: Sparkles },
  { value: "automation", label: "Automatisierungen", icon: Zap },
  { value: "education", label: "KI-Profi Programm", icon: GraduationCap },
];

const thumbnailFor = (code: string) => `/thumbnails/${code}.svg`;

export default function Automatisierungen() {
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo(() => {
    if (filter === "all") return AUTOMATIONS;
    return AUTOMATIONS.filter((a) => a.category === filter);
  }, [filter]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "KI-Automationen Produktkatalog",
    itemListElement: AUTOMATIONS.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://ki-automationen.io/automatisierungen/${a.slug}`,
      name: a.name,
    })),
  };

  return (
    <PublicLayout>
      <SEOHead
        title="KI-Automationen bestellen – 13 fertige Produkte für KMU & Mittelstand"
        description="Fertige KI-Automatisierungen für Praxen, Kanzleien, Handwerk und Dienstleister: Terminbot, Mail-Assistent, Lead-Qualifizierung, Voice-Agent. Festpreis, in 5–14 Tagen produktiv."
        canonical="/automatisierungen"
        jsonLd={itemListJsonLd}
      />

      {/* Hero */}
      <section className="bg-[#0F3E2E] text-white pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <Badge className="bg-primary/20 text-primary-light border-primary/30 mb-4">
              13 sofort einsetzbare KI-Produkte
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              Automatisierungen, die ab Tag 1 entlasten.
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              Festpreis. Inklusive Einrichtung. In 5 bis 14 Tagen produktiv.
              Du wählst aus, wir bauen ein – inklusive 30 Tagen Optimierungssupport.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary hover:bg-primary-deep text-primary-foreground">
                <a href="#katalog">
                  Katalog ansehen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                <Link to="/qualifizierung">Unverbindliche Analyse</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section id="katalog" className="bg-background py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 mb-8">
            {FILTERS.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                size="sm"
                variant={filter === value ? "default" : "outline"}
                onClick={() => setFilter(value)}
                className="gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                <span className="ml-1 text-xs opacity-70">
                  ({value === "all" ? AUTOMATIONS.length : AUTOMATIONS.filter((a) => a.category === value).length})
                </span>
              </Button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <ProductCard key={a.code} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Outro */}
      <section className="bg-[#FFF3EB] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Du weißt nicht, welches Produkt zu dir passt?
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            In einer 30-Minuten-Analyse zeigen wir dir, welche 1–2 Automatisierungen
            in deinem Unternehmen sofort den größten Hebel haben.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary-deep text-primary-foreground">
            <Link to="/qualifizierung">
              Kostenlose Potenzial-Analyse
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}

function ProductCard({ a }: { a: Automation }) {
  const isEducation = a.category === "education";
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[16/9] bg-[#FFF3EB] flex items-center justify-center border-b">
        <img
          src={thumbnailFor(a.code)}
          alt={a.name}
          loading="lazy"
          className="w-full h-full object-contain p-6"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant="outline" className="font-mono text-xs">{a.code}</Badge>
          {isEducation ? (
            <Badge className="bg-primary/15 text-primary border-primary/30">KI-Profi Programm</Badge>
          ) : (
            <Badge variant="secondary">Automatisierung</Badge>
          )}
          {a.recurring && <Badge variant="outline">monatlich</Badge>}
        </div>
        <CardTitle className="text-lg leading-snug">{a.name}</CardTitle>
        <CardDescription className="line-clamp-2">{a.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <ul className="space-y-1.5 text-sm">
          {a.outcomes.slice(0, 3).map((o) => (
            <li key={o} className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{o}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
          {a.leadDays > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {a.leadDays} Tage
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">ab</div>
            <div className="text-xl font-bold text-foreground">
              {formatPriceEUR(a.priceNet)}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                netto{a.recurring ? " / Monat" : ""}
              </span>
            </div>
          </div>
          <Button asChild size="sm">
            <Link to={`/automatisierungen/${a.slug}`}>
              Details
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
