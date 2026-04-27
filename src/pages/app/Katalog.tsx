import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  ArrowRight,
  Check,
  ShieldCheck,
  Info,
  Calendar,
  Mail,
  Target,
  FileText,
  Mic,
  FileSearch,
  Megaphone,
  UserCheck,
  MessageCircle,
  BarChart3,
  Receipt,
  PhoneCall,
  GraduationCap,
} from "lucide-react";
import {
  AUTOMATIONS,
  AUTOMATIONS_BY_CATEGORY,
  formatPriceEUR,
  type Automation,
} from "@/data/automations";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar: Calendar,
  mail: Mail,
  target: Target,
  document: FileText,
  audio: Mic,
  extract: FileSearch,
  content: Megaphone,
  hire: UserCheck,
  chat: MessageCircle,
  report: BarChart3,
  invoice: Receipt,
  phone: PhoneCall,
};

export default function Katalog() {
  const [searchParams] = useSearchParams();
  const focusProduct = searchParams.get("product");

  useEffect(() => {
    if (!focusProduct) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`product-${focusProduct}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2", "ring-primary", "ring-offset-2");
      setTimeout(
        () => el.classList.remove("ring-2", "ring-primary", "ring-offset-2"),
        3000
      );
    }, 300);
    return () => clearTimeout(t);
  }, [focusProduct]);

  return (
    <div className="container mx-auto py-6 space-y-10 max-w-7xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          KI-Automationen Katalog
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Sofortkauf – fertige KI-Automationen
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {AUTOMATIONS.length} standardisierte Automationen mit Festpreis und schneller Lieferung.
          Alle Preise netto zzgl. 19 % USt. Rechnungsstellung durch KRS Immobilien GmbH.
        </p>
      </div>

      {/* Mengenrabatt-Hinweis */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="flex flex-col md:flex-row items-center gap-4 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center md:text-left text-sm">
            <p className="font-semibold text-foreground">Mengenrabatt bei mehreren Automationen</p>
            <p className="text-muted-foreground mt-1">
              2 Automationen 10 % · 3 Automationen 15 % · 5 Automationen 25 %.
              Rabatt wird als Gutschrift nach Kauf verrechnet. Bei Paket-Interesse:{" "}
              <a
                href="mailto:j.s@jan-sommershoff.de"
                className="underline hover:text-foreground transition-colors"
              >
                j.s@jan-sommershoff.de
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Automationen */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">KI-Automationen</h2>
            <Badge variant="secondary">
              {AUTOMATIONS_BY_CATEGORY.automation.length} Produkte
            </Badge>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {AUTOMATIONS_BY_CATEGORY.automation.map((automation) => (
            <ProductCard key={automation.code} automation={automation} />
          ))}
        </div>
      </section>

      {/* Weiterbildung – KI-Profi-Programm Bundle */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Weiterbildung</h2>
          <Badge variant="secondary" className="gap-1">
            <GraduationCap className="h-3 w-3" />
            6-Monats-Programm
          </Badge>
        </div>
        <EducationBundleCard />
      </section>

      {/* Garantie */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="flex flex-col md:flex-row items-center gap-4 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted shrink-0">
            <ShieldCheck className="h-7 w-7 text-foreground" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-base">14 Tage Geld-zurück bei Nicht-Funktionieren</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Wenn eine Automation nicht wie beschrieben läuft, erstatten wir den vollen Betrag innerhalb von 14 Tagen nach Go-Live.
              30 Tage Optimierungssupport sind in jedem Produkt inkludiert.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legal */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <Link to="/agb" className="underline hover:text-foreground transition-colors">
          AGB
        </Link>
        <Link to="/widerruf" className="underline hover:text-foreground transition-colors">
          Widerrufsbelehrung
        </Link>
        <a
          href="https://krsimmobilien.de/datenschutz"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Datenschutz
        </a>
      </div>
    </div>
  );
}

/* =====================================================
 * Product Card
 * ===================================================== */
function ProductCard({ automation }: { automation: Automation }) {
  const Icon = ICON_MAP[automation.icon] || FileText;

  return (
    <Card
      id={`product-${automation.code}`}
      className="relative flex flex-col transition-shadow hover:shadow-lg overflow-hidden"
    >
      {/* Thumb */}
      <div className="aspect-[12/5] bg-muted/30 border-b border-border overflow-hidden">
        <img
          src={`/thumbnails/${automation.code}.svg`}
          alt={automation.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1">
            <Icon className="h-3 w-3" />
            {automation.code}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Lieferung in {automation.leadDays} Tagen
          </span>
        </div>
        <CardTitle className="text-lg mt-2">{automation.name}</CardTitle>
        <CardDescription>{automation.subtitle}</CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 pt-4">
        <ul className="space-y-2">
          {automation.outcomes.slice(0, 3).map((o, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <span className="text-foreground">{o}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <div className="p-4 pt-0 mt-auto space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold">{formatPriceEUR(automation.priceNet)}</span>
            <span className="text-xs text-muted-foreground ml-1">netto</span>
          </div>
          <span className="text-xs text-muted-foreground">einmalig</span>
        </div>
        <Button asChild className="w-full">
          <a
            href={automation.payLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sofortkauf
            <ArrowRight className="h-4 w-4 ml-2" />
          </a>
        </Button>
        <p className="text-center text-[10px] text-muted-foreground">
          Sichere Zahlung via Stripe · KRS Immobilien GmbH
        </p>
      </div>
    </Card>
  );
}

/* =====================================================
 * Education Bundle (EDU01 + EDU02)
 * ===================================================== */
function EducationBundleCard() {
  const kickoff = AUTOMATIONS.find((a) => a.code === "EDU01");
  const monthly = AUTOMATIONS.find((a) => a.code === "EDU02");
  if (!kickoff || !monthly) return null;
  const total = kickoff.priceNet + monthly.priceNet * 6;

  const features = [
    "Wöchentliche 90-Min Live-Session (max. 12 Teilnehmer)",
    "Monatliches 1:1-Coaching (60 Min)",
    "Alle Replays und Aufzeichnungen",
    "500+ getestete Prompts",
    "30+ n8n / Make-Workflow-Templates",
    "Slack-Community mit Experten und Peers",
    "Monatlicher Guest-Expert-Call",
    "Abschluss-Zertifikat ki-automatisierungen.io",
  ];

  return (
    <Card className="border-primary/40 ring-1 ring-primary/10 overflow-hidden">
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-0">
        {/* Left: Description */}
        <div className="p-6 md:p-8 space-y-5">
          <div className="space-y-2">
            <Badge className="gap-1 bg-primary text-primary-foreground">
              <Sparkles className="h-3 w-3" />
              KI-Profi-Programm · 6 Monate
            </Badge>
            <h3 className="text-2xl font-bold tracking-tight">
              Werden Sie selbst zum KI-Profi
            </h3>
            <p className="text-muted-foreground text-sm">
              6-monatiges Intensivprogramm mit wöchentlichen Live-Sessions, monatlichem
              1:1-Coaching und Hands-on-Projekten aus Ihrem Arbeitsalltag. Am Ende bauen Sie eigene KI-Automationen.
            </p>
          </div>

          <ul className="grid sm:grid-cols-2 gap-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="text-xs text-muted-foreground pt-2">
            Lernpfad: Monat 1 KI-Grundlagen · Monat 2 Erste Automationen · Monat 3 KI-Agenten ·
            Monat 4 RAG-Systeme · Monat 5 Produktivsetzung · Monat 6 KI-Strategie & Roadmap
          </div>
        </div>

        {/* Right: Pricing & CTAs */}
        <div className="bg-accent text-accent-foreground p-6 md:p-8 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">Kickoff-Gebühr (einmalig)</p>
            <p className="text-3xl font-bold mt-1">
              {formatPriceEUR(kickoff.priceNet)} <span className="text-sm font-normal opacity-80">netto</span>
            </p>
          </div>

          <Separator className="bg-accent-foreground/20" />

          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">Monatsgebühr</p>
            <p className="text-3xl font-bold mt-1">
              {formatPriceEUR(monthly.priceNet)}{" "}
              <span className="text-sm font-normal opacity-80">/ Monat</span>
            </p>
            <p className="text-xs opacity-80 mt-0.5">× 6 Monate Mindestlaufzeit</p>
          </div>

          <Separator className="bg-accent-foreground/20" />

          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">Gesamtinvestition</p>
            <p className="text-2xl font-bold mt-1">{formatPriceEUR(total)} netto</p>
          </div>

          <div className="space-y-2 pt-2">
            <Button asChild variant="secondary" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <a href={kickoff.payLink} target="_blank" rel="noopener noreferrer">
                1. Kickoff-Gebühr zahlen
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className={cn(
                "w-full bg-transparent border-accent-foreground/40 text-accent-foreground",
                "hover:bg-accent-foreground/10 hover:text-accent-foreground"
              )}
            >
              <a href={monthly.payLink} target="_blank" rel="noopener noreferrer">
                2. Monatsabo starten
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
          <p className="text-[10px] opacity-75 leading-relaxed pt-1">
            Start nach Zahlung der Kickoff-Gebühr. Der monatliche Beitrag wird automatisch 6× abgebucht.
          </p>
        </div>
      </div>
    </Card>
  );
}
