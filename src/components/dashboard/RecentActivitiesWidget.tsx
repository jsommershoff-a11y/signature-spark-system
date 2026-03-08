import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, Mail, Calendar, StickyNote, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { DashboardActivity } from '@/hooks/useDashboardData';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  anruf: <Phone className="h-3.5 w-3.5 text-blue-500" />,
  email: <Mail className="h-3.5 w-3.5 text-green-500" />,
  meeting: <Calendar className="h-3.5 w-3.5 text-purple-500" />,
  notiz: <StickyNote className="h-3.5 w-3.5 text-amber-500" />,
  fehler: <AlertCircle className="h-3.5 w-3.5 text-destructive" />,
};

interface Props {
  activities: DashboardActivity[];
  isLoading: boolean;
}

export function RecentActivitiesWidget({ activities, isLoading }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-semibold">Letzte Aktivitäten</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        )}

        {!isLoading && activities.length === 0 && (
          <p className="text-xs text-muted-foreground py-6 text-center">
            Noch keine Aktivitäten erfasst
          </p>
        )}

        {!isLoading && activities.length > 0 && (
          <div className="space-y-2.5">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {TYPE_ICONS[a.type] || <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground truncate">{a.content}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {a.creator_name} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: de })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
