import { useMemo } from 'react';
import { useRevenueSummary } from '@/hooks/useCooCockpit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

export default function RevenueTab() {
  const { data: rows = [], isLoading, isError } = useRevenueSummary();

  const totalIst = rows.reduce((s, r) => s + (r.ist_umsatz || 0), 0);
  const totalPlan = rows.reduce((s, r) => s + (r.plan_umsatz || 0), 0);
  const totalDelta = totalIst - totalPlan;

  const monthlyData = useMemo(() => {
    const map = new Map<string, { monat: string; ist: number; plan: number }>();
    rows.forEach(r => {
      const existing = map.get(r.monat) ?? { monat: r.monat, ist: 0, plan: 0 };
      existing.ist += r.ist_umsatz || 0;
      existing.plan += r.plan_umsatz || 0;
      map.set(r.monat, existing);
    });
    return [...map.values()].sort((a, b) => a.monat.localeCompare(b.monat));
  }, [rows]);

  const bereichData = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach(r => {
      const key = r.bereich || 'Sonstige';
      map.set(key, (map.get(key) || 0) + (r.ist_umsatz || 0));
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [rows]);

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  if (isError) return <div className="text-center py-12 text-muted-foreground"><AlertCircle className="h-8 w-8 mx-auto mb-2" /><p>Tabelle <code>revenue_summary</code> nicht verfügbar</p></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Ist-Umsatz gesamt</p><p className="text-2xl font-bold">{fmt.format(totalIst)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Plan-Umsatz gesamt</p><p className="text-2xl font-bold">{fmt.format(totalPlan)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Delta</p><p className={`text-2xl font-bold ${totalDelta >= 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt.format(totalDelta)}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Monatsumsatz (Ist vs Plan)</CardTitle></CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? <p className="text-muted-foreground text-sm">Keine Daten</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="monat" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(v: number) => fmt.format(v)} />
                  <Legend />
                  <Bar dataKey="ist" name="Ist" fill="hsl(var(--primary))" />
                  <Bar dataKey="plan" name="Plan" fill="hsl(var(--muted-foreground))" opacity={0.4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Umsatz nach Bereich</CardTitle></CardHeader>
          <CardContent>
            {bereichData.length === 0 ? <p className="text-muted-foreground text-sm">Keine Daten</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bereichData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                  <Tooltip formatter={(v: number) => fmt.format(v)} />
                  <Bar dataKey="value" name="Umsatz" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Umsatzdaten</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Monat</TableHead>
                  <TableHead>Bereich</TableHead>
                  <TableHead>Objekt</TableHead>
                  <TableHead className="text-right">Ist</TableHead>
                  <TableHead className="text-right">Plan</TableHead>
                  <TableHead className="text-right">Delta</TableHead>
                  <TableHead>Quelle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Keine Daten</TableCell></TableRow>
                ) : rows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{r.monat}</TableCell>
                    <TableCell className="text-xs">{r.bereich ?? '—'}</TableCell>
                    <TableCell className="text-xs">{r.objekt ?? '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt.format(r.ist_umsatz)}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.plan_umsatz != null ? fmt.format(r.plan_umsatz) : '—'}</TableCell>
                    <TableCell className={`text-right tabular-nums ${(r.delta ?? 0) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {r.delta != null ? fmt.format(r.delta) : '—'}
                    </TableCell>
                    <TableCell className="text-xs">{r.quelle ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
