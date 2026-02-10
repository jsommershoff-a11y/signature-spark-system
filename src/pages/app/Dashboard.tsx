import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROLE_LABELS } from '@/lib/roles';
import { 
  Users, 
  UserPlus, 
  CheckSquare, 
  TrendingUp,
  GraduationCap,
  Clock,
  FileText,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  TopLeadsWidget, 
  RecentAnalysesWidget, 
  PipelineStatsWidget, 
  CallQueueWidget,
  FollowupApprovalsWidget,
  CustomerAvatarWidget
} from '@/components/dashboard';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function Dashboard() {
  const { profile, effectiveRole, isRealAdmin, isViewingAs } = useAuth();
  const { 
    topLeads, 
    topLeadsLoading, 
    recentAnalyses, 
    recentAnalysesLoading,
    pipelineStats,
    pipelineStatsLoading,
    todayTasks,
    todayTasksLoading
  } = useDashboardData();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  const getName = () => {
    if (profile?.first_name) return profile.first_name;
    if (profile?.full_name) return profile.full_name.split(' ')[0];
    return 'Benutzer';
  };

  // Role-specific dashboard widgets
  const renderKundeDashboard = () => (
    <div className="space-y-6">
      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Meine Verträge</h3>
              <p className="text-sm text-muted-foreground">Angebote und Vertragsdokumente einsehen</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/app/contracts"><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Kurse</h3>
              <p className="text-sm text-muted-foreground">Lernbereich und Fortschritt</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/app/courses"><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Kurse</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Kurse in Bearbeitung</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fortschritt</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">Gesamtfortschritt</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nächste Aufgabe</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Keine anstehenden Aufgaben</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStaffDashboard = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Leads</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pipelineStats.find(s => s.stage === 'new_lead')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Neue Anfragen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Kunden</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pipelineStats.find(s => s.stage === 'won')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Gewonnene Deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aufgaben heute</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground">Fällige Aufgaben</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentAnalyses.length}</div>
            <p className="text-xs text-muted-foreground">Letzte KI-Analysen</p>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CallQueueWidget />
        <TopLeadsWidget leads={topLeads} isLoading={topLeadsLoading} />
        <RecentAnalysesWidget analyses={recentAnalyses} isLoading={recentAnalysesLoading} />
        <PipelineStatsWidget stats={pipelineStats} isLoading={pipelineStatsLoading} />
        <FollowupApprovalsWidget />
        <CustomerAvatarWidget />
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Leads</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pipelineStats.reduce((sum, s) => sum + s.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Alle Leads im System</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Mitglieder</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pipelineStats.find(s => s.stage === 'won')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Gewonnene Kunden</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Aufgaben</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground">System-weit heute</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pipelineStats.reduce((sum, s) => sum + s.count, 0) > 0
                ? Math.round(
                    ((pipelineStats.find(s => s.stage === 'won')?.count || 0) /
                      pipelineStats.reduce((sum, s) => sum + s.count, 0)) *
                      100
                  )
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Gewonnen / Gesamt</p>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CallQueueWidget />
        <TopLeadsWidget leads={topLeads} isLoading={topLeadsLoading} />
        <RecentAnalysesWidget analyses={recentAnalyses} isLoading={recentAnalysesLoading} />
        <PipelineStatsWidget stats={pipelineStats} isLoading={pipelineStatsLoading} />
        <FollowupApprovalsWidget />
        <CustomerAvatarWidget />
      </div>
    </div>
  );

  // Helper functions to check effective role for UI rendering
  const isEffectiveAdmin = effectiveRole === 'admin';
  const isEffectiveStaff = effectiveRole && ['mitarbeiter', 'teamleiter', 'geschaeftsfuehrung', 'admin'].includes(effectiveRole);
  const isEffectiveKunde = effectiveRole === 'kunde' || !isEffectiveStaff;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {getName()}!
        </h1>
        <p className="text-muted-foreground">
          {effectiveRole && `Du bist angemeldet als ${ROLE_LABELS[effectiveRole]}.`}
          {isViewingAs && ' (Admin-Ansicht)'}
        </p>
      </div>

      {/* Render dashboard based on effective role */}
      {isEffectiveAdmin && renderAdminDashboard()}
      {!isEffectiveAdmin && isEffectiveStaff && renderStaffDashboard()}
      {!isEffectiveStaff && renderKundeDashboard()}

    </div>
  );
}