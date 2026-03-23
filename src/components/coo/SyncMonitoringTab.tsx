import { useState, useMemo } from 'react';
import { useSyncLogs, useSyncErrors } from '@/hooks/useCooCockpit';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, AlertCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const fmtTs = (ts: string | null) => ts ? format(new Date(ts), 'dd.MM.yy HH:mm:ss', { locale: de }) : '—';

export default function SyncMonitoringTab() {
  const { data: logs = [], isLoading: logsLoading, isError: logsError } = useSyncLogs();
  const { data: errors = [], isLoading: errorsLoading, isError: errorsError } = useSyncErrors();
  const [entityFilter, setEntityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [rawPayload, setRawPayload] = useState<any>(null);

  const entities = useMemo(() => {
    const all = [...logs.map(l => l.entity), ...errors.map(e => e.entity)].filter(Boolean);
    return [...new Set(all)];
  }, [logs, errors]);

  const filteredLogs = useMemo(() => logs.filter(l => {
    if (entityFilter !== 'all' && l.entity !== entityFilter) return false;
    if (search && !JSON.stringify(l).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? '')), [logs, entityFilter, search]);

  const filteredErrors = useMemo(() => errors.filter(e => {
    if (entityFilter !== 'all' && e.entity !== entityFilter) return false;
    if (search && !JSON.stringify(e).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? '')), [errors, entityFilter, search]);

  const isLoading = logsLoading || errorsLoading;

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  if (logsError && errorsError) return <div className="text-center py-12 text-muted-foreground"><AlertCircle className="h-8 w-8 mx-auto mb-2" /><p>Tabellen <code>sync_logs</code> / <code>sync_errors</code> nicht verfügbar</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Suche..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Entity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Entities</SelectItem>
            {entities.map(e => <SelectItem key={e} value={e!}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Successful Syncs */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Erfolgreiche Syncs ({filteredLogs.length})</h3>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zeitpunkt</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Nachricht</TableHead>
                <TableHead className="text-right">Records</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Keine Sync-Logs</TableCell></TableRow>
              ) : filteredLogs.slice(0, 50).map(l => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs tabular-nums whitespace-nowrap">{fmtTs(l.timestamp)}</TableCell>
                  <TableCell className="text-xs">{l.workflow ?? '—'}</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">{l.status ?? '—'}</Badge></TableCell>
                  <TableCell className="text-xs">{l.entity ?? '—'}</TableCell>
                  <TableCell className="text-sm truncate max-w-[300px]">{l.message ?? '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{l.records_processed ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Error Log */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-destructive">Fehlerprotokoll ({filteredErrors.length})</h3>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zeitpunkt</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead>Node</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Fehlermeldung</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredErrors.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Keine Fehler</TableCell></TableRow>
              ) : filteredErrors.slice(0, 50).map(e => (
                <TableRow key={e.id} className="bg-destructive/5">
                  <TableCell className="text-xs tabular-nums whitespace-nowrap">{fmtTs(e.timestamp)}</TableCell>
                  <TableCell className="text-xs">{e.workflow ?? '—'}</TableCell>
                  <TableCell className="text-xs">{e.node_name ?? '—'}</TableCell>
                  <TableCell className="text-xs">{e.entity ?? '—'}</TableCell>
                  <TableCell className="text-sm text-destructive truncate max-w-[300px]">{e.error_message ?? '—'}</TableCell>
                  <TableCell>
                    {e.raw_payload && (
                      <Button variant="ghost" size="icon" onClick={() => setRawPayload(e.raw_payload)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={rawPayload !== null} onOpenChange={() => setRawPayload(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Raw Payload</DialogTitle></DialogHeader>
          <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
            {JSON.stringify(rawPayload, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
