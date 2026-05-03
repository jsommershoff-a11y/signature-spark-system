import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Loader2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PIPELINE_STAGE_LABELS, type PipelineStage } from '@/types/crm';
import { cn } from '@/lib/utils';

interface StageDurationRow {
  stage: string;
  transitions_count: number;
  avg_hours: number;
  median_hours: number;
  p90_hours: number;
  min_hours: number;
  max_hours: number;
}

const STAGE_ORDER: string[] = [
  'new_lead', 'setter_call_scheduled', 'setter_call_done', 'analysis_ready',
  'offer_draft', 'offer_sent', 'payment_unlocked', 'won', 'lost',
];

function formatDuration(hours: number | null | undefined): string {
  if (hours == null || isNaN(Number(hours))) return '–';
  const h = Number(hours);
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 48) return `${h.toFixed(1)} h`;
  return `${(h / 24).toFixed(1)} d`;
}

// Bewertung für Farbe: schneller = besser
function durationTone(hours: number): string {
  if (hours < 24) return 'text-emerald-600 dark:text-emerald-400';
  if (hours < 72) return 'text-foreground';
  if (hours < 168) return 'text-amber-600 dark:text-amber-400';
  return 'text-destructive';
}

export function StageDurationWidget() {
  const [days, setDays] = useState<number>(30);

  const { data, isLoading, error } = useQuery({
    queryKey: ['stage-duration-stats', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_stage_duration_stats', { _days: days });
      if (error) throw error;
      return (data ?? []) as StageDurationRow[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const sorted = (data ?? []).slice().sort((a, b) => {
    const ai = STAGE_ORDER.indexOf(a.stage);
    const bi = STAGE_ORDER.indexOf(b.stage);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-foreground" />
            </div>
            Stage-Verweildauer
          </CardTitle>
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="h-7 w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Letzte 7 Tage</SelectItem>
              <SelectItem value="30">Letzte 30 Tage</SelectItem>
              <SelectItem value="90">Letzte 90 Tage</SelectItem>
              <SelectItem value="365">Letzte 365 Tage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-xs text-destructive">Fehler beim Laden der KPIs.</p>
        ) : sorted.length === 0 ? (
          <div className="flex items-start gap-2 text-xs text-muted-foreground py-4">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              Noch keine Stage-Wechsel im gewählten Zeitraum. Sobald Leads die Phase wechseln,
              berechnen wir hier die Verweildauer.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <span>Phase (verlassen)</span>
              <span className="text-right">Ø</span>
              <span className="text-right">Median</span>
              <span className="text-right">P90</span>
            </div>
            {sorted.map((row) => {
              const label = PIPELINE_STAGE_LABELS[row.stage as PipelineStage] ?? row.stage;
              return (
                <div
                  key={row.stage}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center rounded-md border border-border/40 bg-card/40 px-2 py-1.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium truncate">{label}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">
                      {row.transitions_count}
                    </Badge>
                  </div>
                  <span className={cn('text-xs font-semibold tabular-nums text-right', durationTone(row.avg_hours))}>
                    {formatDuration(row.avg_hours)}
                  </span>
                  <span className="text-xs tabular-nums text-right text-muted-foreground">
                    {formatDuration(row.median_hours)}
                  </span>
                  <span className="text-xs tabular-nums text-right text-muted-foreground">
                    {formatDuration(row.p90_hours)}
                  </span>
                </div>
              );
            })}
            <p className="text-[10px] text-muted-foreground pt-1.5 px-1">
              Zeit zwischen zwei aufeinanderfolgenden Stage-Wechseln pro Lead. Grün = &lt; 24 h, Gelb = &gt; 3 Tage, Rot = &gt; 1 Woche.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StageDurationWidget;
