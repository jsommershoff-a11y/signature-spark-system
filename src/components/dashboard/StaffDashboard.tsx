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
    <div className="space-y-5 md:space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Offene Leads"
          value={pipelineStats.find(s => s.stage === 'new_lead')?.count || 0}
          sub="Neue Anfragen"
          icon={<UserPlus className="h-4 w-4 text-primary" />}
        />
        <KPICard
          title="Aktive Kunden"
          value={pipelineStats.find(s => s.stage === 'won')?.count || 0}
          sub="Gewonnene Deals"
          icon={<Users className="h-4 w-4 text-primary" />}
        />
        <KPICard
          title="Aufgaben heute"
          value={todayTasks.length}
          sub="Fällige Aufgaben"
          icon={<CheckSquare className="h-4 w-4 text-primary" />}
        />
        <KPICard
          title="Analysen"
          value={recentAnalyses.length}
          sub="Letzte KI-Analysen"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
      </div>

      {/* Sales Cockpit Widget */}
      <SalesCockpitWidget />

      <GoalsMotivationPanel />

      {/* Widgets Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
    <Card className="hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
        <CardTitle className="text-xs md:text-sm font-medium leading-tight text-muted-foreground">{title}</CardTitle>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="text-2xl md:text-3xl font-bold tabular-nums">{value}</div>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-1">{sub}</p>
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
    <Card className="border-primary/15 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2 px-5">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-primary" />
          </div>
          Vertriebs-Cockpit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-5">
        {/* Mantra */}
        <p className="text-xs font-medium text-primary">{mantra}</p>

        {/* Daily Activities */}
        <div className="grid grid-cols-3 gap-2">
          {dailyActivities.map((a) => (
            <div key={a.label} className="flex items-center gap-2 p-2.5 bg-card rounded-xl border border-border/40">
              <div className="text-primary">{a.icon}</div>
              <div>
                <p className="text-xs font-medium">{a.target}× {a.label}</p>
                <p className="text-[10px] text-muted-foreground">pro Tag</p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Targets */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/40">
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
