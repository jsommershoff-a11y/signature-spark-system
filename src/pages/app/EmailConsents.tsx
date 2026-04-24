import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, ShieldCheck, Ban, Hourglass } from 'lucide-react';

type Row = {
  id: string;
  email: string;
  purpose: string;
  source: string | null;
  status: 'pending' | 'confirmed' | 'revoked';
  created_at: string;
  confirmed_at: string | null;
  revoked_at: string | null;
  expires_at: string;
  requested_ip: string | null;
};

const STATUS_BADGE: Record<Row['status'], { label: string; className: string; icon: any }> = {
  pending: { label: 'Ausstehend', className: 'bg-amber-500/10 text-amber-600 border-amber-500/30', icon: Hourglass },
  confirmed: { label: 'Bestätigt', className: 'bg-primary/10 text-primary border-primary/30', icon: ShieldCheck },
  revoked: { label: 'Widerrufen', className: 'bg-destructive/10 text-destructive border-destructive/30', icon: Ban },
};

export default function EmailConsents() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Row['status']>('all');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('email_consents' as any)
      .select('id,email,purpose,source,status,created_at,confirmed_at,revoked_at,expires_at,requested_ip')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) {
      toast({ variant: 'destructive', title: 'Fehler', description: error.message });
    } else {
      setRows((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search && !r.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, search, statusFilter]);

  const stats = useMemo(() => ({
    total: rows.length,
    confirmed: rows.filter((r) => r.status === 'confirmed').length,
    pending: rows.filter((r) => r.status === 'pending').length,
    revoked: rows.filter((r) => r.status === 'revoked').length,
  }), [rows]);

  const revoke = async (id: string) => {
    const { error } = await supabase
      .from('email_consents' as any)
      .update({ status: 'revoked', revoked_at: new Date().toISOString() } as any)
      .eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Fehler', description: error.message });
    } else {
      toast({ title: 'Einwilligung widerrufen' });
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">E-Mail Einwilligungen</h1>
        <p className="text-muted-foreground">
          DSGVO-konformer Double-Opt-In Status für alle E-Mail-Empfänger.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Gesamt</CardDescription><CardTitle className="text-3xl">{stats.total}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Bestätigt</CardDescription><CardTitle className="text-3xl text-primary">{stats.confirmed}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Ausstehend</CardDescription><CardTitle className="text-3xl text-amber-600">{stats.pending}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Widerrufen</CardDescription><CardTitle className="text-3xl text-destructive">{stats.revoked}</CardTitle></CardHeader></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verlauf</CardTitle>
          <CardDescription>Alle Opt-In-Anfragen mit Status, Quelle und Nachweis (IP, Zeitstempel).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach E-Mail suchen…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="confirmed">Bestätigt</SelectItem>
                <SelectItem value="revoked">Widerrufen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Lade…
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">Keine Einträge gefunden.</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Zweck</TableHead>
                    <TableHead>Quelle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bestätigt</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead className="text-right">Aktion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const meta = STATUS_BADGE[r.status];
                    const Icon = meta.icon;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.email}</TableCell>
                        <TableCell><span className="text-xs text-muted-foreground">{r.purpose}</span></TableCell>
                        <TableCell><span className="text-xs">{r.source || '–'}</span></TableCell>
                        <TableCell>
                          <Badge variant="outline" className={meta.className}>
                            <Icon className="h-3 w-3 mr-1" />
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {r.confirmed_at ? new Date(r.confirmed_at).toLocaleString('de-DE') : '–'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.requested_ip || '–'}</TableCell>
                        <TableCell className="text-right">
                          {r.status !== 'revoked' && (
                            <Button size="sm" variant="ghost" onClick={() => revoke(r.id)}>
                              Widerrufen
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
