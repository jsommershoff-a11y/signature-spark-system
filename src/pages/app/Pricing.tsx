import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  STRIPE_AUTOMATION_PRODUCTS,
  STRIPE_EDUCATION_PRODUCTS,
  STRIPE_ACCOUNT_LABEL,
  type StripeProduct,
} from '@/lib/stripe-config';
import { PageHeader } from '@/components/app/PageHeader';
import {
  ArrowUpRight,
  ShieldCheck,
  Clock,
  GraduationCap,
  Cpu,
} from 'lucide-react';

const fmtNet = (cents: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);

function ProductCard({ product }: { product: StripeProduct }) {
  return (
    <Card className="relative flex flex-col transition-shadow hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            {product.code}
          </Badge>
          {product.deliveryDays > 0 && (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Clock className="h-3 w-3" />
              {product.deliveryDays} {product.deliveryDays === 1 ? 'Tag' : 'Tage'}
            </Badge>
          )}
        </div>
        <CardTitle className="text-base mt-2">{product.name}</CardTitle>
        <CardDescription className="text-xs">{product.subtitle}</CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 pt-4">
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{product.priceDisplay}</span>
            {product.pricePeriodLabel && (
              <span className="text-sm text-muted-foreground">{product.pricePeriodLabel}</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            brutto · netto {fmtNet(product.priceNetCents)}
            {product.pricePeriodLabel ? product.pricePeriodLabel : ''} zzgl. 19 % USt.
          </p>
          {product.termLabel && (
            <p className="text-[11px] text-muted-foreground">{product.termLabel}</p>
          )}
        </div>
      </CardContent>

      <div className="p-4 pt-0 mt-auto space-y-2">
        <Button asChild className="w-full">
          <a
            href={product.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              // einfache Tracking-Hook-Stelle, falls später analytics integriert wird
            }}
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            {product.mode === 'subscription' ? 'Jetzt abonnieren' : 'Jetzt buchen'}
          </a>
        </Button>
        <p className="text-center text-[10px] text-muted-foreground">
          Es gelten unsere{' '}
          <Link to="/agb" className="underline hover:text-foreground">AGB</Link>
          {' · '}
          <Link to="/widerruf" className="underline hover:text-foreground">Widerruf</Link>
        </p>
      </div>
    </Card>
  );
}

export default function Pricing() {
  const [tab, setTab] = useState<'automation' | 'education'>('automation');

  const totals = useMemo(() => {
    const automationNet = STRIPE_AUTOMATION_PRODUCTS.reduce(
      (sum, p) => sum + p.priceNetCents,
      0,
    );
    const eduOneTimeNet = STRIPE_EDUCATION_PRODUCTS
      .filter((p) => p.mode === 'one_time')
      .reduce((sum, p) => sum + p.priceNetCents, 0);
    const eduMonthlyNet = STRIPE_EDUCATION_PRODUCTS
      .filter((p) => p.mode === 'subscription')
      .reduce((sum, p) => sum + p.priceNetCents, 0);
    const edu6MonthsNet = eduOneTimeNet + eduMonthlyNet * 6;
    return { automationNet, edu6MonthsNet };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="KI-Automationen Katalog"
        title="Produkte, Preise und direkte Buchung"
        description="Alle Automationen und das KI-Profi Programm im Überblick. Buchung erfolgt sicher über Stripe."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'automation' | 'education')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="automation" className="gap-2">
            <Cpu className="h-4 w-4" />
            Automationen ({STRIPE_AUTOMATION_PRODUCTS.length})
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            KI-Profi Programm
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="space-y-6 mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {STRIPE_AUTOMATION_PRODUCTS.map((p) => (
              <ProductCard key={p.code} product={p} />
            ))}
          </div>
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="py-4 text-sm text-muted-foreground flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <span>Summe aller Automationen (einmalig, netto)</span>
              <span className="font-semibold text-foreground">
                {fmtNet(totals.automationNet)} zzgl. 19 % USt.
              </span>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-6 mt-6">
          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
            {STRIPE_EDUCATION_PRODUCTS.map((p) => (
              <ProductCard key={p.code} product={p} />
            ))}
          </div>
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="py-4 text-sm text-muted-foreground flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <span>KI-Profi Programm gesamt (6 Monate, netto)</span>
              <span className="font-semibold text-foreground">
                {fmtNet(totals.edu6MonthsNet)} zzgl. 19 % USt.
              </span>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trust */}
      <Card className="bg-muted/20 border-dashed">
        <CardContent className="flex flex-col md:flex-row items-center gap-4 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted shrink-0">
            <ShieldCheck className="h-7 w-7 text-foreground" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-base">Sichere Zahlung & klare Konditionen</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Bezahlung erfolgt verschlüsselt über Stripe (Karte, SEPA, Apple/Google Pay).
              Alle Preise verstehen sich netto zzgl. 19 % USt. {STRIPE_ACCOUNT_LABEL}.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legal Links */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
        <Link to="/agb" className="underline hover:text-foreground transition-colors">AGB</Link>
        <Link to="/widerruf" className="underline hover:text-foreground transition-colors">Widerrufsbelehrung</Link>
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
