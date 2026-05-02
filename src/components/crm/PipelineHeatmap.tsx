import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PipelineData, PipelineItemWithLead } from '@/hooks/usePipeline';
import { PipelineStage } from '@/types/crm';
import { getStageLabel, getStageTooltip } from '@/lib/pipeline-stage';

interface PipelineHeatmapProps {
  pipelineByStage: PipelineData;
  stageOrder: PipelineStage[];
  selectedStage: PipelineStage | null;
  onStageSelect: (stage: PipelineStage | null) => void;
}

function isToday(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function computeTrend(items: PipelineItemWithLead[]): {
  current: number;
  yesterday: number;
  delta: number;
} {
  const current = items.length;
  // Items, deren stage_updated_at heute liegt, sind heute in diese Stage gekommen
  const movedInToday = items.filter((i) => isToday(i.stage_updated_at)).length;
  // Approximation: gestriger Stand = heutiger Stand minus heutige Zugänge
  const yesterday = Math.max(0, current - movedInToday);
  const delta = current - yesterday;
  return { current, yesterday, delta };
}

export function PipelineHeatmap({
  pipelineByStage,
  stageOrder,
  selectedStage,
  onStageSelect,
}: PipelineHeatmapProps) {
  const stats = useMemo(() => {
    return stageOrder.map((stage) => {
      const items = pipelineByStage[stage] || [];
      return { stage, ...computeTrend(items) };
    });
  }, [pipelineByStage, stageOrder]);

  const total = stats.reduce((acc, s) => acc + s.current, 0);
  const max = Math.max(1, ...stats.map((s) => s.current));

  return (
    <Card className="p-4 space-y-3 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Pipeline-Übersicht</h3>
          <p className="text-xs text-muted-foreground">
            {total} Leads · Trend vs. gestern
          </p>
        </div>
        {selectedStage && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => onStageSelect(null)}
          >
            <X className="h-3 w-3 mr-1" />
            Filter
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        {stats.map(({ stage, current, delta }) => {
          const isSelected = selectedStage === stage;
          const fillPct = (current / max) * 100;

          let TrendIcon = Minus;
          let trendClass = 'text-muted-foreground';
          if (delta > 0) {
            TrendIcon = TrendingUp;
            trendClass = 'text-emerald-600 dark:text-emerald-400';
          } else if (delta < 0) {
            TrendIcon = TrendingDown;
            trendClass = 'text-rose-600 dark:text-rose-400';
          }

          return (
            <button
              key={stage}
              type="button"
              onClick={() => onStageSelect(isSelected ? null : stage)}
              className={cn(
                'w-full text-left rounded-md px-2 py-1.5 transition-colors group',
                'hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring',
                isSelected && 'bg-muted ring-1 ring-primary/40'
              )}
              title={getStageTooltip(stage)}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span
                  className="text-xs font-medium leading-snug break-words flex-1 min-w-0"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {getStageLabel(stage)}
                </span>
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5 whitespace-nowrap">
                  <span className="text-xs tabular-nums font-semibold">
                    {current}
                  </span>
                  <span className={cn('flex items-center gap-0.5 text-[10px] tabular-nums', trendClass)}>
                    <TrendIcon className="h-3 w-3" />
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isSelected ? 'bg-primary' : 'bg-primary/60 group-hover:bg-primary/80'
                  )}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground leading-tight pt-1 border-t">
        Trend basiert auf Stage-Bewegungen heute.
      </p>
    </Card>
  );
}
