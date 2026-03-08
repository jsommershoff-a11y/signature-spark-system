import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, CheckSquare, TrendingUp, CalendarPlus, CalendarRange } from 'lucide-react';
import {
  TopLeadsWidget,
  RecentAnalysesWidget,
  PipelineStatsWidget,
  CallQueueWidget,
  FollowupApprovalsWidget,
  CustomerAvatarWidget,
} from '@/components/dashboard';
import { TodayPrioritiesWidget } from '@/components/dashboard/TodayPrioritiesWidget';
import { QuickActionsWidget } from '@/components/dashboard/QuickActionsWidget';
import { RecentActivitiesWidget } from '@/components/dashboard/RecentActivitiesWidget';
import { CommunicationStatusWidget } from '@/components/dashboard/CommunicationStatusWidget';
import GoalsMotivationPanel from '@/components/dashboard/GoalsMotivationPanel';
import type { DashboardDataReturn } from '@/hooks/useDashboardData';

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">
      {children}
    </h2>
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

export function AdminDashboard(data: DashboardDataReturn) {
  const totalLeads = data.pipelineStats.reduce((sum, s) => sum + s.count, 0);
  const wonLeads = data.pipelineStats.find(s => s.stage === 'won')?.count || 0;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Section 1: Top KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Gesamte Leads"
          value={totalLeads}
          sub="Alle Leads im System"
          icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Neue heute"
          value={data.newLeadsToday}
          sub="Leads heute eingegangen"
          icon={<CalendarPlus className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Neue diese Woche"
          value={data.newLeadsWeek}
          sub="Seit Montag"
          icon={<CalendarRange className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Aktive Kunden"
          value={data.activeMembers}
          sub="Mitglieder aktiv"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Offene Aufgaben"
          value={data.todayTasks.length}
          sub="Heute fällig"
          icon={<CheckSquare className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          sub="Gewonnen / Gesamt"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Section 2: Priorities Today */}
      <SectionHeader>Prioritäten heute</SectionHeader>
      <TodayPrioritiesWidget
        overdueTasks={data.overdueTasks}
        uncontactedLeads={data.uncontactedLeads}
        pendingFollowups={data.pendingFollowups}
      />

      {/* Section 3: Quick Actions */}
      <SectionHeader>Schnellaktionen</SectionHeader>
      <QuickActionsWidget />

      {/* Section 4: CRM & Pipeline */}
      <SectionHeader>CRM & Pipeline</SectionHeader>
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
        <PipelineStatsWidget stats={data.pipelineStats} isLoading={data.pipelineStatsLoading} />
        <TopLeadsWidget leads={data.topLeads} isLoading={data.topLeadsLoading} />
      </div>

      {/* Section 5: Calls & Communication */}
      <SectionHeader>Calls & Kommunikation</SectionHeader>
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
        <CallQueueWidget />
        <CommunicationStatusWidget todayCalls={data.todayCalls} isLoading={data.todayCallsLoading} />
      </div>

      {/* Section 6: Goals, Analyses, Follow-ups */}
      <SectionHeader>Ziele & Insights</SectionHeader>
      <GoalsMotivationPanel />
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <RecentAnalysesWidget analyses={data.recentAnalyses} isLoading={data.recentAnalysesLoading} />
        <FollowupApprovalsWidget />
        <RecentActivitiesWidget activities={data.recentActivities} isLoading={data.recentActivitiesLoading} />
      </div>
    </div>
  );
}
