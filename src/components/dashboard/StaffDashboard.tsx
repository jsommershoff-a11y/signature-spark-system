import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, CheckSquare, TrendingUp, Zap, Phone, MessageSquare, MailCheck, PhoneOutgoing, Video, FileText, Film, Target, ArrowRight } from 'lucide-react';
import {
  TopLeadsWidget,
  RecentAnalysesWidget,
  PipelineStatsWidget,
  CallQueueWidget,
  FollowupApprovalsWidget,
  CustomerAvatarWidget,
  StageDurationWidget,
} from '@/components/dashboard';
import GoalsMotivationPanel from '@/components/dashboard/GoalsMotivationPanel';
import { SALES_TARGETS, PRODUCT_TIERS, FUNNEL_STAGES, DAILY_ACTIVITIES } from '@/lib/sales-scripts';
import type { DashboardDataReturn } from '@/hooks/useDashboardData';
import { Progress } from '@/components/ui/progress';

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="h-3.5 w-3.5" />,
  PhoneOutgoing: <PhoneOutgoing className="h-3.5 w-3.5" />,
  Phone: <Phone className="h-3.5 w-3.5" />,
  Video: <Video className="h-3.5 w-3.5" />,
  MailCheck: <MailCheck className="h-3.5 w-3.5" />,
  FileText: <FileText className="h-3.5 w-3.5" />,
  Film: <Film className="h-3.5 w-3.5" />,
};

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
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard title="Offene Leads" value={pipelineStats.find(s => s.stage === 'new_lead')?.count || 0} sub="Neue Anfragen" icon={<UserPlus className="h-4 w-4 text-foreground" />} />
        <KPICard title="Aktive Kunden" value={pipelineStats.find(s => s.stage === 'won')?.count || 0} sub="Gewonnene Deals" icon={<Users className="h-4 w-4 text-foreground" />} />
        <KPICard title="Aufgaben heute" value={todayTasks.length} sub="Fällige Aufgaben" icon={<CheckSquare className="h-4 w-4 text-foreground" />} />
        <KPICard title="Analysen" value={recentAnalyses.length} sub="Letzte KI-Analysen" icon={<TrendingUp className="h-4 w-4 text-foreground" />} />
      </div>

      <SalesCockpitWidget />
      <GoalsMotivationPanel />

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
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">{icon}</div>
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

  return (
    <Card className="border-border/40 bg-gradient-to-br from-muted/30 to-transparent">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-foreground" />
          </div>
          Vertriebs-Cockpit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-5">
        <p className="text-xs font-semibold text-foreground">{mantra}</p>

        {/* Products */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Produkte</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRODUCT_TIERS.map((p) => (
              <div key={p.name} className="flex items-center justify-between p-2.5 bg-card rounded-xl border border-border/40">
                <div>
                  <p className="text-xs font-medium">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.monthlyTarget}×/Monat</p>
                </div>
                <span className="text-sm font-bold tabular-nums">{p.priceBrutto.toLocaleString('de-DE')} €</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Sales Funnel (Monat)</p>
          <div className="space-y-1.5">
            {FUNNEL_STAGES.map((s, i) => (
              <div key={s.stage} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-28 shrink-0 truncate">{s.stage}</span>
                <Progress value={(s.targetCount / FUNNEL_STAGES[0].targetCount) * 100} className="h-2 flex-1" />
                <span className="text-xs font-semibold tabular-nums w-8 text-right">{s.targetCount}</span>
                {i > 0 && <span className="text-[9px] text-muted-foreground w-8">{s.conversionRate}%</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Daily Activities */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Tägliche Aktivitäten</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DAILY_ACTIVITIES.map((a) => (
              <div key={a.label} className="flex items-center gap-2 p-2 bg-card rounded-xl border border-border/40">
                <div className="text-muted-foreground">{ACTIVITY_ICONS[a.icon]}</div>
                <div>
                  <p className="text-xs font-semibold tabular-nums">{a.target}×</p>
                  <p className="text-[9px] text-muted-foreground leading-tight">{a.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground pt-2 border-t border-border/40">
          <div className="flex items-center gap-1"><Target className="h-3 w-3 text-muted-foreground" /><span className="font-medium text-foreground">{monthly.leads}</span> Leads</div>
          <div><span className="font-medium text-foreground">{monthly.strategySessions}</span> Strategy</div>
          <div><span className="font-medium text-foreground">{monthly.closes}</span> Abschlüsse</div>
          <div><span className="font-medium text-foreground">{monthly.closeRate}%</span> Close-Rate</div>
        </div>
      </CardContent>
    </Card>
  );
}
