import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLeads } from '@/hooks/useLeads';
import { usePipeline } from '@/hooks/usePipeline';
import { useTasks } from '@/hooks/useTasks';
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PIPELINE_STAGE_LABELS } from '@/types/crm';

export default function CRM() {
  const { leads, loading: leadsLoading } = useLeads();
  const { pipelineByStage, loading: pipelineLoading } = usePipeline();
  const { openTasks, loading: tasksLoading } = useTasks();

  const loading = leadsLoading || pipelineLoading || tasksLoading;

  // Calculate KPIs
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const wonDeals = pipelineByStage['won']?.length || 0;
  const openTasksCount = openTasks.length;

  // Today's tasks
  const todayTasks = openTasks.filter(task => {
    if (!task.due_at) return false;
    const dueDate = new Date(task.due_at);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
        <p className="text-muted-foreground">
          Übersicht über alle Kundenbeziehungen
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {newLeads} neu, {qualifiedLeads} qualifiziert
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Pipeline</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(pipelineByStage).flat().length - wonDeals - (pipelineByStage['lost']?.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktive Opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gewonnen</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{wonDeals}</div>
            <p className="text-xs text-muted-foreground">
              Abgeschlossene Deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Aufgaben</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTasksCount}</div>
            <p className="text-xs text-muted-foreground">
              {todayTasks.length} heute fällig
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pipeline-Übersicht</CardTitle>
              <CardDescription>
                Verteilung der Leads nach Stage
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/app/pipeline">
                Zur Pipeline
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
            {Object.entries(PIPELINE_STAGE_LABELS).map(([stage, label]) => {
              const count = pipelineByStage[stage]?.length || 0;
              return (
                <div key={stage} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground truncate">{label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Leads verwalten</CardTitle>
            <CardDescription>
              Neue Leads hinzufügen und bestehende verwalten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/app/leads">
                Zu den Leads
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Pipeline bearbeiten</CardTitle>
            <CardDescription>
              Leads durch die Sales-Pipeline bewegen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/app/pipeline">
                Zur Pipeline
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Aufgaben erledigen</CardTitle>
            <CardDescription>
              {todayTasks.length > 0 
                ? `${todayTasks.length} Aufgaben heute fällig`
                : 'Keine Aufgaben für heute'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/app/tasks">
                Zu den Aufgaben
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
