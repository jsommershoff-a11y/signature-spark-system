import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Activity, Radio, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useSyncLogs, useSyncErrors } from '@/hooks/useCooCockpit';

const TYPE_LABELS: Record<string, string> = {
  call: 'Anruf',
  email: 'E-Mail',
  meeting: 'Meeting',
  note: 'Notiz',
  error: 'Fehler',
  status_change: 'Status',
  task: 'Aufgabe',
};

const TYPE_COLORS: Record<string, string> = {
  call: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  email: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  meeting: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  note: 'bg-muted text-muted-foreground',
  error: 'bg-destructive/10 text-destructive',
  status_change: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  task: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
};

export default function AdminSystemLogs() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin', 'system-logs', typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: syncLogs = [], isLoading: syncLogsLoading } = useSyncLogs();
  const { data: syncErrors = [], isLoading: syncErrorsLoading } = useSyncErrors();

  const filtered = logs.filter(log =>
    !search || log.content.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="activities" className="space-y-4">
      <TabsList>
        <TabsTrigger value="activities" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Aktivitäten</TabsTrigger>
        <TabsTrigger value="sync" className="gap-1.5"><Radio className="h-3.5 w-3.5" /> Sync-Monitoring</TabsTrigger>
      </TabsList>

      <TabsContent value="activities" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Logs durchsuchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Typ filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Keine Logs gefunden</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Zeitpunkt</TableHead>
                  <TableHead className="w-[100px]">Typ</TableHead>
                  <TableHead>Inhalt</TableHead>
                  <TableHead className="w-[100px]">Lead</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs tabular-nums whitespace-nowrap">
                      {format(new Date(log.created_at), 'dd.MM.yy HH:mm', { locale: de })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={TYPE_COLORS[log.type] || ''}>
                        {TYPE_LABELS[log.type] || log.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[400px] truncate">{log.content}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {log.lead_id ? log.lead_id.slice(0, 8) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="sync" className="space-y-4">
        {syncLogsLoading || syncErrorsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Letzte Syncs ({syncLogs.length})</h3>
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
                    {syncLogs.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Keine Sync-Logs verfügbar</TableCell></TableRow>
                    ) : syncLogs.slice(0, 20).map(l => (
                      <TableRow key={l.id}>
                        <TableCell className="text-xs tabular-nums whitespace-nowrap">{l.timestamp ? format(new Date(l.timestamp), 'dd.MM.yy HH:mm', { locale: de }) : '—'}</TableCell>
                        <TableCell className="text-xs">{l.workflow ?? '—'}</TableCell>
                        <TableCell><Badge variant="secondary">{l.status ?? '—'}</Badge></TableCell>
                        <TableCell className="text-xs">{l.entity ?? '—'}</TableCell>
                        <TableCell className="text-sm truncate max-w-[300px]">{l.message ?? '—'}</TableCell>
                        <TableCell className="text-right tabular-nums">{l.records_processed ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-destructive">Fehler ({syncErrors.length})</h3>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zeitpunkt</TableHead>
                      <TableHead>Workflow</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Fehlermeldung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncErrors.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Keine Fehler</TableCell></TableRow>
                    ) : syncErrors.slice(0, 20).map(e => (
                      <TableRow key={e.id} className="bg-destructive/5">
                        <TableCell className="text-xs tabular-nums whitespace-nowrap">{e.timestamp ? format(new Date(e.timestamp), 'dd.MM.yy HH:mm', { locale: de }) : '—'}</TableCell>
                        <TableCell className="text-xs">{e.workflow ?? '—'}</TableCell>
                        <TableCell className="text-xs">{e.entity ?? '—'}</TableCell>
                        <TableCell className="text-sm text-destructive truncate max-w-[400px]">{e.error_message ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
