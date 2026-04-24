import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, AlertCircle, CheckCircle2, Clock, Ban, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

type LogRow = {
  id: string;
  message_id: string;
  template_name: string | null;
  recipient_email: string;
  subject: string | null;
  status: string;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const RANGES = {
  '24h': { label: 'Letzte 24 Std.', hours: 24 },
  '7d': { label: 'Letzte 7 Tage', hours: 24 * 7 },
  '30d': { label: 'Letzte 30 Tage', hours: 24 * 30 },
  all: { label: 'Alle', hours: 24 * 365 * 10 },
} as const;

type RangeKey = keyof typeof RANGES;

const STATUS_META: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; icon: typeof CheckCircle2 }> = {
  sent: { label: 'Gesendet', variant: 'default', icon: CheckCircle2 },
  pending: { label: 'In Warteschlange', variant: 'secondary', icon: Clock },
  failed: { label: 'Fehlgeschlagen', variant: 'destructive', icon: AlertCircle },
  dlq: { label: 'Endgültig fehlgeschlagen', variant: 'destructive', icon: AlertCircle },
  suppressed: { label: 'Unterdrückt', variant: 'outline', icon: Ban },
  bounced: { label: 'Bounced', variant: 'destructive', icon: AlertCircle },
  complained: { label: 'Beschwerde', variant: 'destructive', icon: AlertCircle },
};

export default function EmailLog() {
  const [range, setRange] = useState<RangeKey>('7d');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const sinceIso = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() - RANGES[range].hours);
    return d.toISOString();
  }, [range]);

  const { data: rows = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['email-send-log', sinceIso],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_send_log' as never)
        .select('*')
        .gte('created_at', sinceIso)
        .order('created_at', { ascending: false })
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as unknown as LogRow[];
    },
  });

  // Deduplicate by message_id, keeping latest
  const dedupedRows = useMemo(() => {
    const map = new Map<string, LogRow>();
    for (const r of rows) {
      const existing = map.get(r.message_id);
      if (!existing || new Date(r.created_at) > new Date(existing.created_at)) {
        map.set(r.message_id, r);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [rows]);

  const templates = useMemo(() => {
    const set = new Set<string>();
    for (const r of dedupedRows) if (r.template_name) set.add(r.template_name);
    return Array.from(set).sort();
  }, [dedupedRows]);

  const filtered = useMemo(() => {
    return dedupedRows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (templateFilter !== 'all' && r.template_name !== templateFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.recipient_email.toLowerCase().includes(q) &&
          !(r.subject ?? '').toLowerCase().includes(q) &&
          !(r.error_message ?? '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [dedupedRows, statusFilter, templateFilter, search]);

  const stats = useMemo(() => {
    const s = { total: dedupedRows.length, sent: 0, failed: 0, pending: 0, suppressed: 0 };
    for (const r of dedupedRows) {
      if (r.status === 'sent') s.sent++;
      else if (r.status === 'failed' || r.status === 'dlq' || r.status === 'bounced') s.failed++;
      else if (r.status === 'pending') s.pending++;
      else if (r.status === 'suppressed') s.suppressed++;
    }
    return s;
  }, [dedupedRows]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            E-Mail Versand-Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Status und Fehler aller automatisch versendeten E-Mails
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Gesamt" value={stats.total} />
        <StatCard label="Gesendet" value={stats.sent} tone="success" />
        <StatCard label="Fehlgeschlagen" value={stats.failed} tone="destructive" />
        <StatCard label="In Warteschlange" value={stats.pending} tone="muted" />
        <StatCard label="Unterdrückt" value={stats.suppressed} tone="muted" />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Zeitraum</label>
              <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(RANGES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="sent">Gesendet</SelectItem>
                  <SelectItem value="pending">In Warteschlange</SelectItem>
                  <SelectItem value="failed">Fehlgeschlagen</SelectItem>
                  <SelectItem value="suppressed">Unterdrückt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Template</label>
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Templates</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Suche</label>
              <Input
                placeholder="Empfänger, Betreff, Fehler…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            E-Mails ({filtered.length}{filtered.length !== dedupedRows.length ? ` von ${dedupedRows.length}` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Wird geladen…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Keine E-Mails im gewählten Zeitraum.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Empfänger</TableHead>
                    <TableHead>Betreff</TableHead>
                    <TableHead>Zeitpunkt</TableHead>
                    <TableHead>Fehler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 200).map((r) => {
                    const meta = STATUS_META[r.status] ?? { label: r.status, variant: 'outline' as const, icon: Mail };
                    const Icon = meta.icon;
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Badge variant={meta.variant} className="gap-1">
                            <Icon className="w-3 h-3" />
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{r.template_name ?? '—'}</TableCell>
                        <TableCell className="text-sm font-mono">{r.recipient_email}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate" title={r.subject ?? ''}>
                          {r.subject ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {format(new Date(r.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </TableCell>
                        <TableCell className="text-sm text-destructive max-w-xs truncate" title={r.error_message ?? ''}>
                          {r.error_message ?? '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filtered.length > 200 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Anzeige auf 200 Einträge begrenzt. Filter verfeinern, um mehr zu sehen.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: 'success' | 'destructive' | 'muted' }) {
  const colorClass =
    tone === 'success' ? 'text-accent'
      : tone === 'destructive' ? 'text-destructive'
      : tone === 'muted' ? 'text-muted-foreground'
      : 'text-foreground';
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
