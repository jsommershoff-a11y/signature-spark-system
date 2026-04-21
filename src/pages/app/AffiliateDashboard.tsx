import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMyAffiliate } from '@/hooks/useMyAffiliate';
import { Copy, ExternalLink, Loader2, TrendingUp, Users, Wallet, AlertCircle } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Onboarding ausstehend',
  active: 'Aktiv',
  suspended: 'Pausiert',
  rejected: 'Abgelehnt',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800',
};

const COMMISSION_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Ausgezahlt', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Fehlgeschlagen', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Erstattet', color: 'bg-gray-100 text-gray-800' },
};

function formatEUR(cents: number, currency = 'EUR') {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}

export default function AffiliateDashboard() {
  const { affiliate, commissions, referralCount, isLoading, refetch } = useMyAffiliate();
  const { toast } = useToast();
  const [opening, setOpening] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('onboarded') === '1') {
      toast({ title: 'Onboarding abgeschlossen', description: 'Status wird aktualisiert ...' });
      refetch();
      searchParams.delete('onboarded');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, refetch, toast]);

  const referralLink = affiliate?.referral_code
    ? `${window.location.origin}/?ref=${affiliate.referral_code}`
    : '';

  const totalEarnedCents = commissions.reduce((s, c) => s + (c.status === 'paid' ? c.commission_cents : 0), 0);
  const pendingCents = commissions.reduce((s, c) => s + (c.status === 'pending' ? c.commission_cents : 0), 0);

  const handleOpenStripe = async () => {
    setOpening(true);
    try {
      const { data, error } = await supabase.functions.invoke('affiliate-onboard-refresh', { body: {} });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e) {
      toast({ title: 'Fehler', description: e instanceof Error ? e.message : String(e), variant: 'destructive' });
    } finally {
      setOpening(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: 'Link kopiert' });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!affiliate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kein Affiliate-Zugang</CardTitle>
          <CardDescription>
            Du wurdest noch nicht als Affiliate freigeschaltet. Bitte kontaktiere einen Administrator.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isActive = affiliate.status === 'active' && affiliate.charges_enabled && affiliate.payouts_enabled;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h1>
          <p className="text-muted-foreground">Empfehle KRS Signature und verdiene {(affiliate.commission_rate * 100).toFixed(0)}% Provision pro Verkauf.</p>
        </div>
        <Badge className={STATUS_COLORS[affiliate.status]}>{STATUS_LABELS[affiliate.status]}</Badge>
      </div>

      {!isActive && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="h-5 w-5" /> Stripe-Onboarding erforderlich
            </CardTitle>
            <CardDescription className="text-yellow-900/80">
              Um Provisionen ausgezahlt zu bekommen, musst du dein Stripe-Konto verifizieren (Bankdaten, Identität).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleOpenStripe} disabled={opening}>
              {opening ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
              Stripe Onboarding starten
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ausgezahlt</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatEUR(totalEarnedCents)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatEUR(pendingCents)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Empfehlungen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{referralCount}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dein Empfehlungslink</CardTitle>
          <CardDescription>Teile diesen Link – jede Conversion wird automatisch dir zugeordnet.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input value={referralLink} readOnly className="font-mono text-sm" />
          <Button onClick={copyLink} variant="outline"><Copy className="h-4 w-4" /></Button>
        </CardContent>
      </Card>

      {isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Stripe-Konto</CardTitle>
            <CardDescription>Sieh dir Auszahlungen direkt in Stripe an.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleOpenStripe} disabled={opening} variant="outline">
              {opening ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
              Stripe Dashboard öffnen
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Provisionen</CardTitle>
          <CardDescription>Letzte 100 Transaktionen</CardDescription>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Provisionen.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Produkt</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead className="text-right">Brutto</TableHead>
                  <TableHead className="text-right">Provision</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{new Date(c.created_at).toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>{c.product_name ?? '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{c.customer_email ?? '—'}</TableCell>
                    <TableCell className="text-right">{formatEUR(c.gross_amount_cents, c.currency)}</TableCell>
                    <TableCell className="text-right font-medium">{formatEUR(c.commission_cents, c.currency)}</TableCell>
                    <TableCell>
                      <Badge className={COMMISSION_STATUS[c.status]?.color}>
                        {COMMISSION_STATUS[c.status]?.label ?? c.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
