import { useState, useMemo } from 'react';
import { useAdminLeads, type AdminLead } from '@/hooks/useAdminLeads';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

type QualFilter = 'all' | 'qualified' | 'disqualified';
type SortKey = 'score_desc' | 'score_asc' | 'date_desc' | 'date_asc' | 'name_asc';

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
  const [filter, setFilter] = useState<QualFilter>('all');
  const [sort, setSort] = useState<SortKey>('score_desc');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!leads) return [];
    let result = [...leads];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q),
      );
    }

    // Filter
    if (filter === 'qualified') result = result.filter((l) => l.is_qualified === true);
    if (filter === 'disqualified') result = result.filter((l) => !l.is_qualified);

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'score_desc':
          return (b.qualification_score ?? 0) - (a.qualification_score ?? 0);
        case 'score_asc':
          return (a.qualification_score ?? 0) - (b.qualification_score ?? 0);
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name_asc':
          return a.name.localeCompare(b.name, 'de');
        default:
          return 0;
      }
    });

    return result;
  }, [leads, filter, sort, search]);

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
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="qualified">Qualifiziert</SelectItem>
            <SelectItem value="disqualified">Disqualifiziert</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
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

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Score</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Branche</TableHead>
            <TableHead>Umsatz</TableHead>
            <TableHead>Quelle</TableHead>
            <TableHead className="w-24">Datum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                Keine Leads gefunden
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className={`font-bold tabular-nums ${scoreColor(lead.qualification_score)}`}>
                  {lead.qualification_score ?? 0}
                </TableCell>
                <TableCell>
                  <Badge variant={lead.is_qualified ? 'default' : 'destructive'}>
                    {lead.is_qualified ? 'Qualifiziert' : 'Disqualifiziert'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.branche || '-'}</TableCell>
                <TableCell>{lead.jahresumsatz || '-'}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{lead.source}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(lead.created_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
