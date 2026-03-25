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
    <div className="flex items-center gap-3 pt-3">
      <h2 className="text-sm font-semibold text-muted-foreground">
        {children}
      </h2>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

function KPICard({ title, value, sub, icon }: { title: string; value: number | string; sub: string; icon: React.ReactNode }) {
  return (
    <Card className="hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
        <CardTitle className="text-xs md:text-sm font-medium leading-tight text-muted-foreground">{title}</CardTitle>
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
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

export function AdminDashboard(data: DashboardDataReturn) {
  const totalLeads = data.pipelineStats.reduce((sum, s) => sum + s.count, 0);
  const wonLeads = data.pipelineStats.find(s => s.stage === 'won')?.count || 0;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Section 1: Top KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Gesamte Leads"
          value={totalLeads}
          sub="Alle Leads im System"
          icon={<UserPlus className="h-4 w-4 text-primary" />}
        />
        <KPICard
          title="Neue heute"
          value={data.newLeadsToday}
          sub="Leads heute eingegangen"
          icon={<CalendarPlus className="h-4 w-4 text-primary" />}
        />
        <KPICard
          title="Neue diese Woche"
          value={data.newLeadsWeek}
          sub="Seit Montag"
          icon={<CalendarRange className="h-4 w-4 text-primary" />}
        />
        <KPICard
          title="Aktive Kunden"
          value={data.activeMembers}
          sub="Mitglieder aktiv"
          icon={<Users className="h-4 w-4 text-primary" />}
        />
        <KPICard
          title="Offene Aufgaben"
          value={data.todayTasks.length}
          sub="Heute fällig"
          icon={<CheckSquare className="h-4 w-4 text-primary" />}
        />
        <KPICard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          sub="Gewonnen / Gesamt"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
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
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <PipelineStatsWidget stats={data.pipelineStats} isLoading={data.pipelineStatsLoading} />
        <TopLeadsWidget leads={data.topLeads} isLoading={data.topLeadsLoading} />
      </div>

      {/* Section 5: Calls & Communication */}
      <SectionHeader>Calls & Kommunikation</SectionHeader>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <CallQueueWidget />
        <CommunicationStatusWidget todayCalls={data.todayCalls} isLoading={data.todayCallsLoading} />
      </div>

      {/* Section 6: Goals, Analyses, Follow-ups */}
      <SectionHeader>Ziele & Insights</SectionHeader>
      <GoalsMotivationPanel />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <RecentAnalysesWidget analyses={data.recentAnalyses} isLoading={data.recentAnalysesLoading} />
        <FollowupApprovalsWidget />
        <RecentActivitiesWidget activities={data.recentActivities} isLoading={data.recentActivitiesLoading} />
      </div>
    </div>
  );
}
