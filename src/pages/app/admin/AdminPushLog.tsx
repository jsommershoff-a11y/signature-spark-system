import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/app/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { usePushLog, type PushLogStatus } from '@/hooks/usePushLog';
import { BellRing, CheckCircle2, AlertTriangle, XCircle, Clock, MinusCircle, ShieldAlert, UserCheck, PhoneIncoming, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const STATUS_META: Record<PushLogStatus, { label: string; icon: React.ElementType; className: string }> = {
  sent:    { label: 'Gesendet',     icon: CheckCircle2, className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  partial: { label: 'Teilweise',    icon: AlertTriangle, className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  failed:  { label: 'Fehlgeschlagen', icon: XCircle, className: 'bg-destructive/15 text-destructive border-destructive/30' },
  skipped: { label: 'Übersprungen', icon: MinusCircle, className: 'bg-muted text-muted-foreground border-border' },
  pending: { label: 'Pending',      icon: Clock, className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
};

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  admin_alerts:   { label: 'Admin',     icon: ShieldAlert,   color: 'text-orange-500' },
  member_alerts:  { label: 'Mitglieder', icon: UserCheck,    color: 'text-emerald-500' },
  incoming_calls: { label: 'Anrufe',    icon: PhoneIncoming, color: 'text-blue-500' },
  lifecycle:      { label: 'Lifecycle', icon: Sparkles,      color: 'text-violet-500' },
};

export default function AdminPushLog() {
  const [days, setDays] = useState<number>(7);
  const [status, setStatus] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = usePushLog(days);
  const entries = data?.entries ?? [];
  const stats = data?.stats;

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (status !== 'all' && e.status !== status) return false;
      if (category !== 'all' && e.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          (e.body ?? '').toLowerCase().includes(q) ||
          (e.recipient_name ?? '').toLowerCase().includes(q) ||
          (e.recipient_email ?? '').toLowerCase().includes(q) ||
          (e.source ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [entries, status, category, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Push-Log"
        description={`Versendete Push-Benachrichtigungen der letzten ${days} Tage`}
        icon={BellRing}
      />

      {/* KPI-Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiTile label="Gesamt" value={stats?.total ?? 0} loading={isLoading} />
        <KpiTile label="Gesendet" value={stats?.sent ?? 0} loading={isLoading} accent="text-emerald-600" />
        <KpiTile label="Teilweise" value={stats?.partial ?? 0} loading={isLoading} accent="text-amber-600" />
        <KpiTile label="Fehlgeschlagen" value={stats?.failed ?? 0} loading={isLoading} accent="text-destructive" />
        <KpiTile label="Übersprungen" value={stats?.skipped ?? 0} loading={isLoading} accent="text-muted-foreground" />
      </div>

      {/* Tagesverlauf */}
      {stats && stats.by_day.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Verlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1.5 items-end h-24">
              {stats.by_day.map((d) => {
                const max = Math.max(1, ...stats.by_day.map((x) => x.total));
                const heightSent = Math.max(2, Math.round((d.sent / max) * 80));
                const heightFailed = Math.max(0, Math.round((d.failed / max) * 80));
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end h-20 gap-px">
                      {d.failed > 0 && (
                        <div className="w-full bg-destructive rounded-sm" style={{ height: heightFailed }} title={`${d.failed} Fehler`} />
                      )}
                      <div className="w-full bg-emerald-500 rounded-sm" style={{ height: heightSent }} title={`${d.sent} gesendet`} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(d.day), 'dd.MM', { locale: de })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <TabsList>
            <TabsTrigger value="1">24 h</TabsTrigger>
            <TabsTrigger value="7">7 Tage</TabsTrigger>
            <TabsTrigger value="30">30 Tage</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Suche (Titel, Empfänger, Quelle)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="sent">Gesendet</SelectItem>
              <SelectItem value="partial">Teilweise</SelectItem>
              <SelectItem value="failed">Fehlgeschlagen</SelectItem>
              <SelectItem value="skipped">Übersprungen</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              <SelectItem value="admin_alerts">Admin</SelectItem>
              <SelectItem value="member_alerts">Mitglieder</SelectItem>
              <SelectItem value="incoming_calls">Anrufe</SelectItem>
              <SelectItem value="lifecycle">Lifecycle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabelle */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <BellRing className="mx-auto h-10 w-10 opacity-30 mb-2" />
              <p>Keine Push-Ereignisse im gewählten Zeitraum</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeit</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Titel</TableHead>
                  <TableHead>Empfänger</TableHead>
                  <TableHead>Quelle</TableHead>
                  <TableHead className="text-center">Tokens</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => {
                  const sm = STATUS_META[e.status];
                  const cm = CATEGORY_META[e.category] ?? { label: e.category, icon: BellRing, color: 'text-muted-foreground' };
                  const SIcon = sm.icon;
                  const CIcon = cm.icon;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {format(new Date(e.created_at), 'dd.MM. HH:mm:ss', { locale: de })}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <CIcon className={`h-3.5 w-3.5 ${cm.color}`} />
                          {cm.label}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <div className="font-medium text-sm truncate">{e.title}</div>
                        {e.body && <div className="text-xs text-muted-foreground truncate">{e.body}</div>}
                        {e.error && (
                          <div className="text-xs text-destructive mt-0.5 truncate" title={e.error}>{e.error}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="truncate max-w-[160px]">{e.recipient_name ?? '—'}</div>
                        <div className="text-muted-foreground truncate max-w-[160px]">{e.recipient_email ?? ''}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{e.source ?? '—'}</TableCell>
                      <TableCell className="text-center text-xs whitespace-nowrap">
                        {e.sent_count}/{e.total_tokens}
                        {e.invalid_removed > 0 && (
                          <span className="block text-[10px] text-amber-600">
                            -{e.invalid_removed} entfernt
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${sm.className}`}>
                          <SIcon className="h-3 w-3" />
                          {sm.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiTile({ label, value, loading, accent }: { label: string; value: number; loading: boolean; accent?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-12 mt-1" />
        ) : (
          <p className={`text-2xl font-semibold mt-1 ${accent ?? ''}`}>{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
