import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/app/PageHeader';
import { TrialInlineNotice } from '@/components/app/TrialInlineNotice';
import { useCatalogProducts, type CatalogProduct } from '@/hooks/useCatalogProducts';
import { useAuth } from '@/contexts/AuthContext';
import { buildPaymentLink, trackBeginCheckout } from '@/lib/checkout-link';
import { getStoredRefCode } from '@/components/affiliate/ReferralTracker';
import {
  ArrowUpRight,
  ShieldCheck,
  Clock,
  GraduationCap,
  Cpu,
  Search,
} from 'lucide-react';

const fmtEUR = (cents: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);

type PriceFilter = 'all' | 'lt2500' | '2500_4000' | 'gt4000';
type DeliveryFilter = 'all' | 'le5' | 'le7';
type SortKey = 'sort' | 'price_asc' | 'price_desc' | 'delivery_asc';

function ProductCard({
  product,
  email,
  userId,
}: {
  product: CatalogProduct;
  email?: string | null;
  userId?: string | null;
}) {
  const refCode = getStoredRefCode();
  const href = buildPaymentLink({
    base: product.payment_link,
    email,
    userId,
    refCode,
  });

  const handleClick = () => {
    trackBeginCheckout({
      code: product.code,
      name: product.name,
      category: product.category,
      priceNetCents: product.price_net_cents,
    });
  };

  return (
    <Card className="relative flex flex-col transition-shadow hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            {product.code}
          </Badge>
          {product.delivery_days > 0 && (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Clock className="h-3 w-3" />
              {product.delivery_days} {product.delivery_days === 1 ? 'Tag' : 'Tage'}
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
            <span className="text-3xl font-bold">{fmtEUR(product.price_gross_cents)}</span>
            {product.price_period_label && (
              <span className="text-sm text-muted-foreground">{product.price_period_label}</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            brutto · netto {fmtEUR(product.price_net_cents)}
            {product.price_period_label ?? ''} zzgl. 19 % USt.
          </p>
          {product.term_label && (
            <p className="text-[11px] text-muted-foreground">{product.term_label}</p>
          )}
        </div>
      </CardContent>

      <div className="p-4 pt-0 mt-auto space-y-2">
        <Button asChild className="w-full">
          <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
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
  const { user, profile } = useAuth();
  const { data: products = [], isLoading } = useCatalogProducts();

  const [tab, setTab] = useState<'automation' | 'education'>('automation');
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>('all');
  const [sort, setSort] = useState<SortKey>('sort');

  const automation = useMemo(
    () => products.filter((p) => p.category === 'automation'),
    [products],
  );
  const education = useMemo(
    () => products.filter((p) => p.category === 'education'),
    [products],
  );

  const filtered = useMemo(() => {
    const source = tab === 'automation' ? automation : education;
    let list = source;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q),
      );
    }

    if (priceFilter !== 'all') {
      list = list.filter((p) => {
        const net = p.price_net_cents;
        if (priceFilter === 'lt2500') return net < 250000;
        if (priceFilter === '2500_4000') return net >= 250000 && net <= 400000;
        if (priceFilter === 'gt4000') return net > 400000;
        return true;
      });
    }

    if (deliveryFilter !== 'all') {
      const max = deliveryFilter === 'le5' ? 5 : 7;
      list = list.filter((p) => p.delivery_days > 0 && p.delivery_days <= max);
    }

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === 'price_asc') return a.price_net_cents - b.price_net_cents;
      if (sort === 'price_desc') return b.price_net_cents - a.price_net_cents;
      if (sort === 'delivery_asc') return a.delivery_days - b.delivery_days;
      return a.sort_order - b.sort_order;
    });
    return sorted;
  }, [tab, automation, education, search, priceFilter, deliveryFilter, sort]);

  const automationNetSum = automation.reduce((s, p) => s + p.price_net_cents, 0);
  const eduOneTimeNet = education
    .filter((p) => p.mode === 'one_time')
    .reduce((s, p) => s + p.price_net_cents, 0);
  const eduMonthlyNet = education
    .filter((p) => p.mode === 'subscription')
    .reduce((s, p) => s + p.price_net_cents, 0);
  const edu6MonthsNet = eduOneTimeNet + eduMonthlyNet * 6;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="KI-Automationen Katalog"
        title="Produkte, Preise und direkte Buchung"
        description="Alle Automationen und das KI-Profi Programm im Überblick. Buchung erfolgt sicher über Stripe."
      />

      <TrialInlineNotice />

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'automation' | 'education')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="automation" className="gap-2">
            <Cpu className="h-4 w-4" />
            Automationen ({automation.length})
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            KI-Profi Programm
          </TabsTrigger>
        </TabsList>

        {/* Filter / Sort bar — nur für Automation sinnvoll */}
        {tab === 'automation' && (
          <div className="flex flex-col md:flex-row gap-2 mt-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Produkt suchen…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={priceFilter} onValueChange={(v) => setPriceFilter(v as PriceFilter)}>
              <SelectTrigger className="md:w-[180px]"><SelectValue placeholder="Preis" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Preise</SelectItem>
                <SelectItem value="lt2500">unter 2.500 € netto</SelectItem>
                <SelectItem value="2500_4000">2.500–4.000 € netto</SelectItem>
                <SelectItem value="gt4000">über 4.000 € netto</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deliveryFilter} onValueChange={(v) => setDeliveryFilter(v as DeliveryFilter)}>
              <SelectTrigger className="md:w-[180px]"><SelectValue placeholder="Lieferzeit" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Lieferzeiten</SelectItem>
                <SelectItem value="le5">≤ 5 Tage</SelectItem>
                <SelectItem value="le7">≤ 7 Tage</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="md:w-[180px]"><SelectValue placeholder="Sortierung" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sort">Empfehlung</SelectItem>
                <SelectItem value="price_asc">Preis aufsteigend</SelectItem>
                <SelectItem value="price_desc">Preis absteigend</SelectItem>
                <SelectItem value="delivery_asc">Schnellste Lieferung</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <TabsContent value="automation" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[280px] rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Keine Produkte passen zu den Filtern.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  email={profile?.email ?? user?.email ?? null}
                  userId={user?.id ?? null}
                />
              ))}
            </div>
          )}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="py-4 text-sm text-muted-foreground flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <span>Summe aller Automationen (einmalig, netto)</span>
              <span className="font-semibold text-foreground">
                {fmtEUR(automationNetSum)} zzgl. 19 % USt.
              </span>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-6 mt-6">
          {isLoading ? (
            <Skeleton className="h-[280px] rounded-xl max-w-3xl" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
              {education.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  email={profile?.email ?? user?.email ?? null}
                  userId={user?.id ?? null}
                />
              ))}
            </div>
          )}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="py-4 text-sm text-muted-foreground flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <span>KI-Profi Programm gesamt (6 Monate, netto)</span>
              <span className="font-semibold text-foreground">
                {fmtEUR(edu6MonthsNet)} zzgl. 19 % USt.
              </span>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/20 border-dashed">
        <CardContent className="flex flex-col md:flex-row items-center gap-4 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted shrink-0">
            <ShieldCheck className="h-7 w-7 text-foreground" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-base">Sichere Zahlung & klare Konditionen</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Bezahlung erfolgt verschlüsselt über Stripe (Karte, SEPA, Apple/Google Pay).
              Alle Preise verstehen sich netto zzgl. 19 % USt. Rechnungsstellung durch KRS Immobilien GmbH.
            </p>
          </div>
        </CardContent>
      </Card>

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
