import { useState, useMemo } from 'react';
import { useAdminLeads, useAssignableStaff, useBulkUpdateLeads, type AdminLead } from '@/hooks/useAdminLeads';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, Users, Tag, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

type QualFilter = 'all' | 'qualified' | 'disqualified';
type AssignFilter = 'all' | 'assigned' | 'unassigned' | string; // or staff id
type StatusFilter = 'all' | string;
type SortKey = 'score_desc' | 'score_asc' | 'date_desc' | 'date_asc' | 'name_asc';

const STATUS_OPTIONS: { value: string; label: string; tone: 'default' | 'secondary' | 'outline' | 'destructive' }[] = [
  { value: 'new', label: 'Neu', tone: 'default' },
  { value: 'contacted', label: 'Kontaktiert', tone: 'secondary' },
  { value: 'qualified', label: 'Qualifiziert', tone: 'default' },
  { value: 'meeting', label: 'Termin', tone: 'secondary' },
  { value: 'won', label: 'Gewonnen', tone: 'default' },
  { value: 'lost', label: 'Verloren', tone: 'destructive' },
];

function statusMeta(status: string | null) {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? { value: status ?? 'new', label: status ?? 'Neu', tone: 'outline' as const };
}

function scoreColor(score: number | null): string {
  if (score === null || score === 0) return 'text-destructive';
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-destructive';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function AdminLeadsTable() {
  const { data: leads, isLoading, error } = useAdminLeads();
  const { data: staff = [] } = useAssignableStaff();
  const bulkUpdate = useBulkUpdateLeads();

  const [filter, setFilter] = useState<QualFilter>('all');
  const [assignFilter, setAssignFilter] = useState<AssignFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('score_desc');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const staffById = useMemo(() => {
    const m = new Map<string, string>();
    staff.forEach((s) => m.set(s.id, s.full_name || s.email || s.id.slice(0, 8)));
    return m;
  }, [staff]);

  const filtered = useMemo(() => {
    if (!leads) return [];
    let result = [...leads];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
    }
    if (filter === 'qualified') result = result.filter((l) => l.is_qualified === true);
    if (filter === 'disqualified') result = result.filter((l) => !l.is_qualified);

    if (assignFilter === 'assigned') result = result.filter((l) => !!l.assigned_to);
    else if (assignFilter === 'unassigned') result = result.filter((l) => !l.assigned_to);
    else if (assignFilter !== 'all') result = result.filter((l) => l.assigned_to === assignFilter);

    if (statusFilter !== 'all') result = result.filter((l) => (l.status ?? 'new') === statusFilter);

    result.sort((a, b) => {
      switch (sort) {
        case 'score_desc': return (b.qualification_score ?? 0) - (a.qualification_score ?? 0);
        case 'score_asc': return (a.qualification_score ?? 0) - (b.qualification_score ?? 0);
        case 'date_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date_asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name_asc': return a.name.localeCompare(b.name, 'de');
        default: return 0;
      }
    });
    return result;
  }, [leads, filter, sort, search, assignFilter, statusFilter]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const someVisibleSelected = filtered.some((l) => selected.has(l.id));

  function toggleAllVisible(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) filtered.forEach((l) => next.add(l.id));
      else filtered.forEach((l) => next.delete(l.id));
      return next;
    });
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleBulkAssign(profileId: string | null) {
    const ids = Array.from(selected);
    try {
      const count = await bulkUpdate.mutateAsync({ ids, patch: { assigned_to: profileId } });
      toast.success(
        profileId
          ? `${count} Lead(s) ${staffById.get(profileId) ? `an ${staffById.get(profileId)} ` : ''}zugewiesen`
          : `${count} Lead(s) freigegeben`
      );
      setSelected(new Set());
    } catch (e) {
      toast.error('Zuweisung fehlgeschlagen: ' + (e as Error).message);
    }
  }

  async function handleBulkStatus(status: string) {
    const ids = Array.from(selected);
    try {
      const count = await bulkUpdate.mutateAsync({ ids, patch: { status } });
      toast.success(`${count} Lead(s) auf "${statusMeta(status).label}" gesetzt`);
      setSelected(new Set());
    } catch (e) {
      toast.error('Status-Update fehlgeschlagen: ' + (e as Error).message);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error) {
    return <p className="text-destructive text-sm">Fehler beim Laden der Leads: {(error as Error).message}</p>;
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Name oder E-Mail suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filter} onValueChange={(v) => setFilter(v as QualFilter)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Qualifikation" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Qualifikationen</SelectItem>
            <SelectItem value="qualified">Qualifiziert</SelectItem>
            <SelectItem value="disqualified">Disqualifiziert</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assignFilter} onValueChange={setAssignFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Zuweisung" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Zuweisungen</SelectItem>
            <SelectItem value="unassigned">Nicht zugewiesen</SelectItem>
            <SelectItem value="assigned">Zugewiesen (alle)</SelectItem>
            {staff.length > 0 && (
              <>
                <DropdownMenuSeparator />
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.full_name || s.email}</SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="score_desc">Score absteigend</SelectItem>
            <SelectItem value="score_asc">Score aufsteigend</SelectItem>
            <SelectItem value="date_desc">Neueste zuerst</SelectItem>
            <SelectItem value="date_asc">Älteste zuerst</SelectItem>
            <SelectItem value="name_asc">Name A–Z</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} Leads</span>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 px-3 py-2">
          <span className="text-sm font-medium">{selected.size} ausgewählt</span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={bulkUpdate.isPending}>
                <Users className="h-4 w-4 mr-2" />
                Zuweisen
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
              <DropdownMenuLabel>An Mitarbeiter/in</DropdownMenuLabel>
              {staff.length === 0 && (
                <DropdownMenuItem disabled>Keine Mitarbeiter/innen gefunden</DropdownMenuItem>
              )}
              {staff.map((s) => (
                <DropdownMenuItem key={s.id} onClick={() => handleBulkAssign(s.id)}>
                  {s.full_name || s.email}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBulkAssign(null)} className="text-destructive">
                Zuweisung entfernen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={bulkUpdate.isPending}>
                <Tag className="h-4 w-4 mr-2" />
                Status setzen
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {STATUS_OPTIONS.map((s) => (
                <DropdownMenuItem key={s.value} onClick={() => handleBulkStatus(s.value)}>
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())} className="ml-auto">
            Auswahl aufheben
          </Button>
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                onCheckedChange={(v) => toggleAllVisible(!!v)}
                aria-label="Alle auswählen"
              />
            </TableHead>
            <TableHead className="w-16">Score</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-28">Qualifik.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Branche</TableHead>
            <TableHead>Quelle</TableHead>
            <TableHead>Zugewiesen</TableHead>
            <TableHead className="w-24">Datum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                Keine Leads gefunden
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((lead) => {
              const meta = statusMeta(lead.status);
              const isSel = selected.has(lead.id);
              return (
                <TableRow key={lead.id} data-state={isSel ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={isSel}
                      onCheckedChange={(v) => toggleOne(lead.id, !!v)}
                      aria-label={`${lead.name} auswählen`}
                    />
                  </TableCell>
                  <TableCell className={`font-bold tabular-nums ${scoreColor(lead.qualification_score)}`}>
                    {lead.qualification_score ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={meta.tone}>{meta.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.is_qualified ? 'default' : 'destructive'}>
                      {lead.is_qualified ? 'Qual.' : 'Disqual.'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-sm">{lead.email}</TableCell>
                  <TableCell>{lead.branche || '-'}</TableCell>
                  <TableCell><Badge variant="secondary">{lead.source}</Badge></TableCell>
                  <TableCell className="text-sm">
                    {lead.assigned_to ? (
                      staffById.get(lead.assigned_to) ?? '—'
                    ) : (
                      <span className="text-muted-foreground italic">Offen</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(lead.created_at)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
