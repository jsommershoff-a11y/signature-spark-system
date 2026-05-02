import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Kanban } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PipelineStats } from '@/hooks/useDashboardData';
import { type PipelineStage } from '@/types/crm';
import { getStageLabel, STAGE_LABEL_WRAP_CLASS } from '@/lib/pipeline-stage';
import { StageTooltip } from '@/components/crm/StageTooltip';
import { cn } from '@/lib/utils';

interface PipelineStatsWidgetProps {
  stats: PipelineStats[];
  isLoading?: boolean;
}

const STAGE_COLORS: Record<string, string> = {
  new_lead: 'bg-blue-500',
  setter_call_scheduled: 'bg-yellow-500',
  setter_call_done: 'bg-orange-500',
  analysis_ready: 'bg-purple-500',
  offer_draft: 'bg-indigo-500',
  offer_sent: 'bg-cyan-500',
  payment_unlocked: 'bg-emerald-500',
  won: 'bg-green-600',
  lost: 'bg-red-500',
};

export function PipelineStatsWidget({ stats, isLoading }: PipelineStatsWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pipeline Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalLeads = stats.reduce((sum, s) => sum + s.count, 0);
  const activeLeads = stats
    .filter((s) => !['won', 'lost'].includes(s.stage))
    .reduce((sum, s) => sum + s.count, 0);
  const wonLeads = stats.find((s) => s.stage === 'won')?.count || 0;

  // Sort stats by pipeline order
  const orderedStages = [
    'new_lead',
    'setter_call_scheduled',
    'setter_call_done',
    'analysis_ready',
    'offer_draft',
    'offer_sent',
    'payment_unlocked',
    'won',
    'lost',
  ];

  const sortedStats = [...stats].sort(
    (a, b) => orderedStages.indexOf(a.stage) - orderedStages.indexOf(b.stage)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Pipeline Übersicht</CardTitle>
        <Link to="/app/pipeline" className="text-primary hover:underline">
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-4 pb-4 border-b">
          <div className="text-center">
            <p className="text-2xl font-bold">{totalLeads}</p>
            <p className="text-xs text-muted-foreground">Gesamt</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{activeLeads}</p>
            <p className="text-xs text-muted-foreground">Aktiv</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{wonLeads}</p>
            <p className="text-xs text-muted-foreground">Gewonnen</p>
          </div>
        </div>

        {/* Stage Breakdown */}
        {stats.length === 0 ? (
          <div className="flex items-center justify-center py-4 text-muted-foreground">
            <Kanban className="h-5 w-5 mr-2" />
            <span className="text-sm">Keine Pipeline-Daten</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sortedStats.map((stat) => {
              const stage = stat.stage as PipelineStage;
              return (
                <StageTooltip key={stat.stage} stage={stage} className="block">
                  <div className="flex items-start justify-between gap-2 p-2 rounded-lg bg-accent/50">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${STAGE_COLORS[stat.stage] || 'bg-gray-500'}`}
                      />
                      <span
                        className={cn(
                          'text-xs leading-snug flex-1 min-w-0',
                          STAGE_LABEL_WRAP_CLASS,
                        )}
                      >
                        {getStageLabel(stage) || stat.stage}
                      </span>
                    </div>
                    <span className="text-sm font-bold tabular-nums flex-shrink-0">{stat.count}</span>
                  </div>
                </StageTooltip>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
