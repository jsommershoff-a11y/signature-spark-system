import { useState, useMemo } from 'react';
import { useInvoices } from '@/hooks/useCooCockpit';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Download, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const fmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const PAGE_SIZE = 25;

const STATUS_COLORS: Record<string, string> = {
  bezahlt: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  offen: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  ueberfaellig: 'bg-destructive/10 text-destructive',
};

export default function InvoicesTab() {
  const { data: invoices = [], isLoading, isError } = useInvoices();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bereichFilter, setBereichFilter] = useState('all');
  const [kostenstelleFilter, setKostenstelleFilter] = useState('all');
  const [page, setPage] = useState(0);

  const bereiche = useMemo(() => [...new Set(invoices.map(i => i.bereich).filter(Boolean))], [invoices]);
  const kostenstellen = useMemo(() => [...new Set(invoices.map(i => i.kostenstelle).filter(Boolean))], [invoices]);
  const statuses = useMemo(() => [...new Set(invoices.map(i => i.status).filter(Boolean))], [invoices]);

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      if (search && !JSON.stringify(inv).toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (bereichFilter !== 'all' && inv.bereich !== bereichFilter) return false;
      if (kostenstelleFilter !== 'all' && inv.kostenstelle !== kostenstelleFilter) return false;
      return true;
    });
  }, [invoices, search, statusFilter, bereichFilter, kostenstelleFilter]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const sumBrutto = filtered.reduce((s, i) => s + (i.betrag_brutto || 0), 0);
  const sumNetto = filtered.reduce((s, i) => s + (i.betrag_netto || 0), 0);

  const exportCsv = () => {
    const headers = ['invoice_id','datum','faelligkeit','betrag_brutto','betrag_netto','ust','status','gegenpartei','bereich','kostenstelle'];
    const rows = filtered.map(i => headers.map(h => (i as any)[h] ?? '').join(';'));
    const csv = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rechnungen.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  if (isError) return <div className="text-center py-12 text-muted-foreground"><AlertCircle className="h-8 w-8 mx-auto mb-2" /><p>Tabelle <code>invoices</code> nicht verfügbar</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Suche..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={bereichFilter} onValueChange={v => { setBereichFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Bereich" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Bereiche</SelectItem>
            {bereiche.map(b => <SelectItem key={b} value={b!}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={kostenstelleFilter} onValueChange={v => { setKostenstelleFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Kostenstelle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kostenstellen</SelectItem>
            {kostenstellen.map(k => <SelectItem key={k} value={k!}>{k}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-1" /> Export</Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rechnung</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Fälligkeit</TableHead>
              <TableHead className="text-right">Brutto</TableHead>
              <TableHead className="text-right">Netto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Gegenpartei</TableHead>
              <TableHead>Bereich</TableHead>
              <TableHead>Kostenstelle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Keine Rechnungen gefunden</TableCell></TableRow>
            ) : paged.map(inv => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-xs">{inv.invoice_id}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{inv.datum ? format(new Date(inv.datum), 'dd.MM.yy', { locale: de }) : '—'}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{inv.faelligkeit ? format(new Date(inv.faelligkeit), 'dd.MM.yy', { locale: de }) : '—'}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt.format(inv.betrag_brutto)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt.format(inv.betrag_netto)}</TableCell>
                <TableCell><Badge variant="secondary" className={STATUS_COLORS[inv.status] || ''}>{inv.status}</Badge></TableCell>
                <TableCell className="text-sm truncate max-w-[150px]">{inv.gegenpartei ?? '—'}</TableCell>
                <TableCell className="text-xs">{inv.bereich ?? '—'}</TableCell>
                <TableCell className="text-xs">{inv.kostenstelle ?? '—'}</TableCell>
              </TableRow>
            ))}
            {paged.length > 0 && (
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={3}>Summe ({filtered.length} Rechnungen)</TableCell>
                <TableCell className="text-right tabular-nums">{fmt.format(sumBrutto)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt.format(sumNetto)}</TableCell>
                <TableCell colSpan={4} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Seite {page + 1} von {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Zurück</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Weiter</Button>
          </div>
        </div>
      )}
    </div>
  );
}
