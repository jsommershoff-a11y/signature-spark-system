import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, CheckSquare, TrendingUp, Zap, Phone, MessageSquare, MailCheck } from 'lucide-react';
import {
  TopLeadsWidget,
  RecentAnalysesWidget,
  PipelineStatsWidget,
  CallQueueWidget,
  FollowupApprovalsWidget,
  CustomerAvatarWidget,
} from '@/components/dashboard';
import GoalsMotivationPanel from '@/components/dashboard/GoalsMotivationPanel';
import { SALES_TARGETS } from '@/lib/sales-scripts';
import type { DashboardDataReturn } from '@/hooks/useDashboardData';

export function StaffDashboard({
  topLeads,
  topLeadsLoading,
  recentAnalyses,
  recentAnalysesLoading,
  pipelineStats,
  pipelineStatsLoading,
  todayTasks,
}: DashboardDataReturn) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Offene Leads"
          value={pipelineStats.find(s => s.stage === 'new_lead')?.count || 0}
          sub="Neue Anfragen"
          icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Aktive Kunden"
          value={pipelineStats.find(s => s.stage === 'won')?.count || 0}
          sub="Gewonnene Deals"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Aufgaben heute"
          value={todayTasks.length}
          sub="Fällige Aufgaben"
          icon={<CheckSquare className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Analysen"
          value={recentAnalyses.length}
          sub="Letzte KI-Analysen"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Sales Cockpit Widget */}
      <SalesCockpitWidget />

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

function SalesCockpitWidget() {
  const { monthly, mantra } = SALES_TARGETS;

  const dailyActivities = [
    { label: 'Outreach', target: monthly.dailyOutreach, icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { label: 'Calls', target: monthly.dailyCalls, icon: <Phone className="h-3.5 w-3.5" /> },
    { label: 'Follow-ups', target: monthly.dailyFollowups, icon: <MailCheck className="h-3.5 w-3.5" /> },
  ];

  const monthlyTargets = [
    { label: 'Leads/Monat', target: monthly.leads },
    { label: 'Strategy Sessions', target: monthly.strategySessions },
    { label: 'Close-Rate', target: `${monthly.closeRate}%` },
  ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Vertriebs-Cockpit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mantra */}
        <p className="text-xs font-medium text-primary">{mantra}</p>

        {/* Daily Activities */}
        <div className="grid grid-cols-3 gap-2">
          {dailyActivities.map((a) => (
            <div key={a.label} className="flex items-center gap-2 p-2 bg-background rounded-lg border">
              <div className="text-primary">{a.icon}</div>
              <div>
                <p className="text-xs font-medium">{a.target}× {a.label}</p>
                <p className="text-[10px] text-muted-foreground">pro Tag</p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Targets */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t">
          {monthlyTargets.map((t) => (
            <div key={t.label} className="flex items-center gap-1">
              <span className="font-medium text-foreground">{t.target}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
