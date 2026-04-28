import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Download, Eye, MousePointerClick, Sparkles, TrendingUp } from 'lucide-react';
import { exportToCSV } from '@/lib/report-export';

type Range = '7d' | '30d' | '90d';

interface Row {
  module_type: string;
  required_tier: string;
  views: number;
  cta_clicks: number;
  upgrades: number;
  view_to_click_rate: number | null;
  click_to_upgrade_rate: number | null;
  view_to_upgrade_rate: number | null;
}

const RANGE_LABEL: Record<Range, string> = {
  '7d': 'Letzte 7 Tage',
  '30d': 'Letzte 30 Tage',
  '90d': 'Letzte 90 Tage',
};

const MODULE_LABEL: Record<string, string> = {
  prompts: 'Prompt-Library',
  tools: 'Tools-Directory',
  lessons: 'Lektionen / LMS',
  community: 'Community',
  generic: 'Sonstige',
};

function rangeToFrom(range: Range): string {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function pct(v: number | null) {
  if (v === null || v === undefined) return '—';
  return `${v}%`;
}

export default function AdminUpgradeFunnel() {
  const [range, setRange] = useState<Range>('30d');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['upgrade-funnel-stats', range],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase.rpc('get_upgrade_funnel_stats', {
        _from: rangeToFrom(range),
        _to: new Date().toISOString(),
      });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const totals = useMemo(() => {
    const rows = data ?? [];
    const views = rows.reduce((s, r) => s + Number(r.views || 0), 0);
    const clicks = rows.reduce((s, r) => s + Number(r.cta_clicks || 0), 0);
    const upgrades = rows.reduce((s, r) => s + Number(r.upgrades || 0), 0);
    return {
      views,
      clicks,
      upgrades,
      vtc: views > 0 ? Math.round((clicks / views) * 1000) / 10 : null,
      ctu: clicks > 0 ? Math.round((upgrades / clicks) * 1000) / 10 : null,
      vtu: views > 0 ? Math.round((upgrades / views) * 1000) / 10 : null,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Upgrade-Funnel</h1>
          <p className="text-sm text-muted-foreground">
            Modul-Aufruf → CTA-Klick → Upgrade abgeschlossen, pro Modul und Ziel-Paket.
          </p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
              <SelectItem key={r} value={r}>{RANGE_LABEL[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Tiles */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiTile icon={<Eye className="h-4 w-4" />} label="Views (gesperrt)" value={totals.views} />
        <KpiTile icon={<MousePointerClick className="h-4 w-4" />} label="CTA-Klicks" value={totals.clicks} sub={totals.vtc !== null ? `${totals.vtc}% View→Klick` : undefined} />
        <KpiTile icon={<Sparkles className="h-4 w-4" />} label="Upgrades" value={totals.upgrades} sub={totals.ctu !== null ? `${totals.ctu}% Klick→Upgrade` : undefined} />
        <KpiTile icon={<TrendingUp className="h-4 w-4" />} label="Gesamt-Conversion" value={totals.vtu !== null ? `${totals.vtu}%` : '—'} sub="View → Upgrade" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funnel pro Modul × Ziel-Paket</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-destructive py-6">
              Fehler beim Laden: {(error as Error).message}
            </p>
          )}
          {isLoading && <p className="text-sm text-muted-foreground py-6">Lade Daten…</p>}
          {!isLoading && !error && (data?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground py-6">
              Noch keine Events im gewählten Zeitraum.
            </p>
          )}
          {!isLoading && !error && (data?.length ?? 0) > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modul</TableHead>
                    <TableHead>Ziel-Paket</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">CTA-Klicks</TableHead>
                    <TableHead className="text-right">Upgrades</TableHead>
                    <TableHead className="text-right">View → Klick</TableHead>
                    <TableHead className="text-right">Klick → Upgrade</TableHead>
                    <TableHead className="text-right">View → Upgrade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data ?? []).map((r) => (
                    <TableRow key={`${r.module_type}-${r.required_tier}`}>
                      <TableCell className="font-medium">
                        {MODULE_LABEL[r.module_type] ?? r.module_type}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.required_tier}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.views}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.cta_clicks}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.upgrades}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {pct(r.view_to_click_rate)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {pct(r.click_to_upgrade_rate)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {pct(r.view_to_upgrade_rate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Hinweis: „Upgrade abgeschlossen" zählt Nutzer, die nach einem CTA-Klick aktuell
            mindestens die Rolle des Ziel-Pakets besitzen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiTile({
  icon, label, value, sub,
}: { icon: React.ReactNode; label: string; value: number | string; sub?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">{icon}</div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="text-2xl md:text-3xl font-bold tabular-nums">{value}</div>
        {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
