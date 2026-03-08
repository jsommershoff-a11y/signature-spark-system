import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, CheckSquare, TrendingUp } from 'lucide-react';
import {
  TopLeadsWidget,
  RecentAnalysesWidget,
  PipelineStatsWidget,
  CallQueueWidget,
  FollowupApprovalsWidget,
  CustomerAvatarWidget,
} from '@/components/dashboard';
import GoalsMotivationPanel from '@/components/dashboard/GoalsMotivationPanel';
import type { DashboardDataReturn } from '@/hooks/useDashboardData';

export function AdminDashboard({
  topLeads,
  topLeadsLoading,
  recentAnalyses,
  recentAnalysesLoading,
  pipelineStats,
  pipelineStatsLoading,
  todayTasks,
}: DashboardDataReturn) {
  const totalLeads = pipelineStats.reduce((sum, s) => sum + s.count, 0);
  const wonLeads = pipelineStats.find(s => s.stage === 'won')?.count || 0;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Gesamte Leads"
          value={totalLeads}
          sub="Alle Leads im System"
          icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Aktive Mitglieder"
          value={wonLeads}
          sub="Gewonnene Kunden"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Offene Aufgaben"
          value={todayTasks.length}
          sub="System-weit heute"
          icon={<CheckSquare className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          sub="Gewonnen / Gesamt"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <GoalsMotivationPanel />

      {/* Widgets Grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <CallQueueWidget />
        <TopLeadsWidget leads={topLeads} isLoading={topLeadsLoading} />
        <RecentAnalysesWidget analyses={recentAnalyses} isLoading={recentAnalysesLoading} />
        <PipelineStatsWidget stats={pipelineStats} isLoading={pipelineStatsLoading} />
        <FollowupApprovalsWidget />
        <CustomerAvatarWidget />
      </div>
    </div>
  );
}

function KPICard({ title, value, sub, icon }: { title: string; value: number | string; sub: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4">
        <CardTitle className="text-xs md:text-sm font-medium leading-tight">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-xl md:text-2xl font-bold tabular-nums">{value}</div>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}
