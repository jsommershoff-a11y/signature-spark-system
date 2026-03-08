import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, UserX, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardDataReturn } from '@/hooks/useDashboardData';

interface Props {
  overdueTasks: DashboardDataReturn['overdueTasks'];
  uncontactedLeads: DashboardDataReturn['uncontactedLeads'];
  pendingFollowups: number;
}

export function TodayPrioritiesWidget({ overdueTasks, uncontactedLeads, pendingFollowups }: Props) {
  const hasItems = overdueTasks.length > 0 || uncontactedLeads.length > 0 || pendingFollowups > 0;

  return (
    <Card>
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-sm font-semibold">Prioritäten heute</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {!hasItems && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Alles erledigt – keine offenen Prioritäten
          </div>
        )}

        {overdueTasks.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">
                {overdueTasks.length} überfällige Aufgabe{overdueTasks.length > 1 ? 'n' : ''}
              </span>
            </div>
            {overdueTasks.slice(0, 3).map((t) => (
              <Link
                key={t.id}
                to="/app/tasks"
                className="block text-xs text-muted-foreground hover:text-foreground pl-6 truncate"
              >
                {t.title}
              </Link>
            ))}
            {overdueTasks.length > 3 && (
              <Link to="/app/tasks" className="text-xs text-primary hover:underline pl-6">
                +{overdueTasks.length - 3} weitere
              </Link>
            )}
          </div>
        )}

        {uncontactedLeads.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                {uncontactedLeads.length} unkontaktierte Leads
              </span>
            </div>
            {uncontactedLeads.slice(0, 3).map((l) => (
              <Link
                key={l.id}
                to="/app/crm"
                className="block text-xs text-muted-foreground hover:text-foreground pl-6 truncate"
              >
                {l.first_name} {l.last_name || ''} {l.company ? `· ${l.company}` : ''}
              </Link>
            ))}
          </div>
        )}

        {pendingFollowups > 0 && (
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium">
              {pendingFollowups} Follow-up{pendingFollowups > 1 ? 's' : ''} zur Genehmigung
            </span>
            <Badge variant="secondary" className="text-[10px] ml-auto">
              Offen
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
