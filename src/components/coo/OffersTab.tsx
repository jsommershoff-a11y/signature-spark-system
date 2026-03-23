import { useState, useMemo } from 'react';
import { useCooOffers } from '@/hooks/useCooCockpit';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const PAGE_SIZE = 25;

export default function OffersTab() {
  const { data: offers = [], isLoading, isError } = useCooOffers();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);

  const stages = useMemo(() => [...new Set(offers.map(o => o.stage).filter(Boolean))], [offers]);
  const statuses = useMemo(() => [...new Set(offers.map(o => o.status).filter(Boolean))], [offers]);

  const filtered = useMemo(() => {
    return offers.filter(o => {
      if (search && !JSON.stringify(o).toLowerCase().includes(search.toLowerCase())) return false;
      if (stageFilter !== 'all' && o.stage !== stageFilter) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      return true;
    });
  }, [offers, search, stageFilter, statusFilter]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const totalVolume = filtered.reduce((s, o) => s + (o.betrag || 0), 0);

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  if (isError) return <div className="text-center py-12 text-muted-foreground"><AlertCircle className="h-8 w-8 mx-auto mb-2" /><p>Tabelle <code>offers</code> nicht verfügbar</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Suche..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <Select value={stageFilter} onValueChange={v => { setStageFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Stages</SelectItem>
            {stages.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="text-sm font-medium">Volumen: {fmt.format(totalVolume)}</div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal-ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead className="text-right">Weighted</TableHead>
              <TableHead>Close Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Objekt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Keine Angebote gefunden</TableCell></TableRow>
            ) : paged.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.deal_id ?? '—'}</TableCell>
                <TableCell className="font-medium truncate max-w-[200px]">{o.name}</TableCell>
                <TableCell><Badge variant="secondary">{o.stage ?? '—'}</Badge></TableCell>
                <TableCell className="text-right tabular-nums">{o.betrag != null ? fmt.format(o.betrag) : '—'}</TableCell>
                <TableCell className="text-right tabular-nums">{o.weighted_value != null ? fmt.format(o.weighted_value) : '—'}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{o.close_date ?? '—'}</TableCell>
                <TableCell><Badge variant="outline">{o.status ?? '—'}</Badge></TableCell>
                <TableCell className="text-xs">{o.objekt ?? '—'}</TableCell>
              </TableRow>
            ))}
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
