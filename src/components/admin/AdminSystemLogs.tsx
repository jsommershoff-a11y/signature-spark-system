import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

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
        query = query.eq('type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

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
    <div className="space-y-4">
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
    </div>
  );
}
