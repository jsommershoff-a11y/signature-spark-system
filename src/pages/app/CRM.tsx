import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLeads } from '@/hooks/useLeads';
import { usePipeline } from '@/hooks/usePipeline';
import { useTasks } from '@/hooks/useTasks';
import { useActivities } from '@/hooks/useActivities';
import {
  Users, TrendingUp, CheckCircle2, Clock, ArrowRight, ArrowDownRight, ArrowUpRight,
  Phone, Mail, MessageSquare, Calendar, Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PIPELINE_STAGE_LABELS } from '@/types/crm';
import { format, isToday, isYesterday, subDays } from 'date-fns';
import { de } from 'date-fns/locale';

export default function CRM() {
  const { leads, loading: leadsLoading } = useLeads();
  const { pipelineByStage, loading: pipelineLoading } = usePipeline();
  const { openTasks, loading: tasksLoading } = useTasks();
  const { activities, isLoading: activitiesLoading } = useActivities({});

  const loading = leadsLoading || pipelineLoading || tasksLoading;

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const wonDeals = pipelineByStage['won']?.length || 0;
  const lostDeals = pipelineByStage['lost']?.length || 0;
  const activePipeline = Object.values(pipelineByStage).flat().length - wonDeals - lostDeals;
  const openTasksCount = openTasks.length;

  const todayTasks = openTasks.filter(task => {
    if (!task.due_at) return false;
    return new Date(task.due_at).toDateString() === new Date().toDateString();
  });

  // Conversion rates
  const conversionToQualified = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
  const conversionToWon = totalLeads > 0 ? Math.round((wonDeals / totalLeads) * 100) : 0;

  // Recent leads (last 7 days)
  const recentLeads = leads
    .filter(l => new Date(l.created_at) > subDays(new Date(), 7))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  // Recent activities
  const recentActivities = (activities || [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground">Pipeline, Leads und Aktivitäten</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/app/leads">Leads</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/app/pipeline">Pipeline <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard title="Leads gesamt" value={totalLeads} sub={`${newLeads} neu · ${qualifiedLeads} qualifiziert`} icon={<Users className="h-4 w-4 text-primary" />} />
        <KPICard title="In Pipeline" value={activePipeline} sub="Aktive Opportunities" icon={<TrendingUp className="h-4 w-4 text-primary" />} />
        <KPICard title="Gewonnen" value={wonDeals} sub={`${conversionToWon}% Close-Rate`} icon={<CheckCircle2 className="h-4 w-4 text-primary" />} />
        <KPICard title="Aufgaben" value={openTasksCount} sub={`${todayTasks.length} heute fällig`} icon={<Clock className="h-4 w-4 text-destructive" />} />
      </div>

      {/* Funnel + Pipeline Grid */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Conversion-Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Alle Leads', count: totalLeads, rate: 100 },
              { label: 'Qualifiziert', count: qualifiedLeads + wonDeals, rate: totalLeads > 0 ? Math.round(((qualifiedLeads + wonDeals) / totalLeads) * 100) : 0 },
              { label: 'Gewonnen', count: wonDeals, rate: conversionToWon },
              { label: 'Gewonnen', count: wonDeals, rate: conversionToWon },
            ].map((stage, i) => (
              <div key={stage.label} className="flex items-center gap-3">
                <span className="text-xs font-medium w-24 shrink-0">{stage.label}</span>
                <div className="flex-1 relative">
                  <Progress value={stage.rate} className="h-5 rounded-md" />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                    {stage.count}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">{stage.rate}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pipeline-Verteilung</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/app/pipeline">Öffnen <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(PIPELINE_STAGE_LABELS).map(([stage, label]) => {
                const count = pipelineByStage[stage]?.length || 0;
                const total = Object.values(pipelineByStage).flat().length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={stage} className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground w-28 shrink-0 truncate">{label}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stage === 'won' ? 'bg-emerald-500' : stage === 'lost' ? 'bg-destructive' : 'bg-primary'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold tabular-nums w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads + Activity Timeline */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Neue Leads (7 Tage)</CardTitle>
              <Badge variant="outline" className="text-[10px]">{recentLeads.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Keine neuen Leads</p>
            ) : (
              <div className="space-y-2">
                {recentLeads.map((lead) => (
                  <Link key={lead.id} to="/app/leads" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {lead.first_name?.[0]}{lead.last_name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{lead.first_name} {lead.last_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{lead.company || lead.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[9px]">{lead.status}</Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Letzte Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Keine Aktivitäten</p>
            ) : (
              <div className="space-y-1">
                {recentActivities.map((activity) => {
                  const date = new Date(activity.created_at);
                  const timeLabel = isToday(date) ? 'Heute' : isYesterday(date) ? 'Gestern' : format(date, 'dd.MM.', { locale: de });
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg">
                      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <ActivityIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug truncate">{activity.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{timeLabel} · {format(date, 'HH:mm')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ title, value, sub, icon, accent }: { title: string; value: number | string; sub: string; icon: React.ReactNode; accent?: string }) {
  return (
    <Card className="hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">{icon}</div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="text-2xl md:text-3xl font-bold tabular-nums">{value}</div>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'call': return Phone;
    case 'email': return Mail;
    case 'note': return MessageSquare;
    case 'meeting': return Calendar;
    default: return MessageSquare;
  }
}
