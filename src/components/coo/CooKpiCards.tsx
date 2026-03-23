import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCooKpis } from '@/hooks/useCooCockpit';
import {
  FileText, DollarSign, AlertTriangle, Users, Handshake,
  RefreshCw, AlertCircle, CheckCircle, Clock,
} from 'lucide-react';

const fmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const fmtDate = (d: string | null) => d ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d)) : '—';

export default function CooKpiCards() {
  const kpi = useCooKpis();

  if (kpi.isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Rechnungen', value: kpi.invoiceCount, icon: FileText },
    { label: 'Bruttoumsatz', value: fmt.format(kpi.brutto), icon: DollarSign },
    { label: 'Nettoumsatz', value: fmt.format(kpi.netto), icon: DollarSign },
    { label: 'Offene Posten', value: kpi.openItemCount, icon: AlertTriangle },
    { label: 'Offene Forderungen', value: fmt.format(kpi.openItemSum), icon: AlertTriangle },
    { label: 'Angebote', value: kpi.offerCount, icon: Handshake },
    { label: 'Kontakte', value: kpi.contactCount, icon: Users },
    { label: 'Letzter Sync', value: fmtDate(kpi.lastSuccessSync), icon: CheckCircle },
    { label: 'Letzter Fehler', value: fmtDate(kpi.lastError), icon: AlertCircle },
    { label: 'Fehler heute', value: kpi.errorsToday, icon: Clock },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="rounded-md bg-muted p-2">
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{c.label}</p>
              <p className="text-lg font-semibold tracking-tight truncate">{c.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
