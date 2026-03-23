import { useState, useMemo } from 'react';
import { useCooContacts } from '@/hooks/useCooCockpit';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, AlertCircle, Eye } from 'lucide-react';
import type { CooContact } from '@/types/coo';

const PAGE_SIZE = 25;

export default function ContactsTab() {
  const { data: contacts = [], isLoading, isError } = useCooContacts();
  const [search, setSearch] = useState('');
  const [typFilter, setTypFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<CooContact | null>(null);

  const types = useMemo(() => [...new Set(contacts.map(c => c.typ).filter(Boolean))], [contacts]);

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      if (search && !JSON.stringify(c).toLowerCase().includes(search.toLowerCase())) return false;
      if (typFilter !== 'all' && c.typ !== typFilter) return false;
      return true;
    });
  }, [contacts, search, typFilter]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  if (isError) return <div className="text-center py-12 text-muted-foreground"><AlertCircle className="h-8 w-8 mx-auto mb-2" /><p>Tabelle <code>contacts</code> nicht verfügbar</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Suche..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <Select value={typFilter} onValueChange={v => { setTypFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Typ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            {types.map(t => <SelectItem key={t} value={t!}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CRM-ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Kostenstelle</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Keine Kontakte gefunden</TableCell></TableRow>
            ) : paged.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.crm_id ?? '—'}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-xs">{c.typ ?? '—'}</TableCell>
                <TableCell className="text-xs">{c.email ?? '—'}</TableCell>
                <TableCell className="text-xs">{c.telefon ?? '—'}</TableCell>
                <TableCell className="text-xs">{c.kostenstelle ?? '—'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setDetail(c)}><Eye className="h-4 w-4" /></Button>
                </TableCell>
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

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Kontakt: {detail?.name}</DialogTitle></DialogHeader>
          {detail && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(detail).map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="font-medium truncate">{v != null ? String(v) : '—'}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
