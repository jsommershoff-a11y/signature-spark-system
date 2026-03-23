import { useState, useMemo } from 'react';
import { useOpenItems } from '@/hooks/useCooCockpit';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const fmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const PAGE_SIZE = 25;

export default function OpenItemsTab() {
  const { data: items = [], isLoading, isError } = useOpenItems();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [risikoFilter, setRisikoFilter] = useState('all');
  const [page, setPage] = useState(0);

  const statuses = useMemo(() => [...new Set(items.map(i => i.status).filter(Boolean))], [items]);
  const risiken = useMemo(() => [...new Set(items.map(i => i.risiko).filter(Boolean))], [items]);

  const filtered = useMemo(() => {
    return items
      .filter(i => {
        if (search && !JSON.stringify(i).toLowerCase().includes(search.toLowerCase())) return false;
        if (statusFilter !== 'all' && i.status !== statusFilter) return false;
        if (risikoFilter !== 'all' && i.risiko !== risikoFilter) return false;
        return true;
      })
      .sort((a, b) => (b.tage_ueberfaellig ?? 0) - (a.tage_ueberfaellig ?? 0));
  }, [items, search, statusFilter, risikoFilter]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  if (isError) return <div className="text-center py-12 text-muted-foreground"><AlertCircle className="h-8 w-8 mx-auto mb-2" /><p>Tabelle <code>open_items</code> nicht verfügbar</p></div>;

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
        <Select value={risikoFilter} onValueChange={v => { setRisikoFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Risiko" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Risiken</SelectItem>
            {risiken.map(r => <SelectItem key={r} value={r!}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Typ</TableHead>
              <TableHead>Gegenpartei</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead>Fälligkeit</TableHead>
              <TableHead className="text-right">Tage überfällig</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risiko</TableHead>
              <TableHead>Objekt</TableHead>
              <TableHead>Kostenstelle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Keine offenen Posten</TableCell></TableRow>
            ) : paged.map(item => (
              <TableRow key={item.id} className={cn((item.tage_ueberfaellig ?? 0) > 0 && 'bg-destructive/5')}>
                <TableCell className="text-xs">{item.typ ?? '—'}</TableCell>
                <TableCell className="font-medium truncate max-w-[150px]">{item.gegenpartei ?? '—'}</TableCell>
                <TableCell className="text-right tabular-nums">{fmt.format(item.betrag)}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{item.faelligkeit ?? '—'}</TableCell>
                <TableCell className={cn('text-right tabular-nums font-semibold', (item.tage_ueberfaellig ?? 0) > 0 && 'text-destructive')}>
                  {item.tage_ueberfaellig ?? 0}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={item.status === 'ueberfaellig' ? 'bg-destructive/10 text-destructive' : ''}>
                    {item.status ?? '—'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={item.risiko === 'hoch' ? 'destructive' : 'outline'}>{item.risiko ?? '—'}</Badge>
                </TableCell>
                <TableCell className="text-xs">{item.objekt ?? '—'}</TableCell>
                <TableCell className="text-xs">{item.kostenstelle ?? '—'}</TableCell>
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
