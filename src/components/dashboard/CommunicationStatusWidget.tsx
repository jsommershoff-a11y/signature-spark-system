import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardDataReturn } from '@/hooks/useDashboardData';

interface Props {
  todayCalls: DashboardDataReturn['todayCalls'];
  isLoading: boolean;
}

export function CommunicationStatusWidget({ todayCalls, isLoading }: Props) {
  const total = todayCalls.length;
  const completed = todayCalls.filter(c => c.status === 'completed').length;
  const missed = todayCalls.filter(c => c.status === 'failed').length;
  const pending = total - completed - missed;

  return (
    <Card>
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Kommunikation heute</CardTitle>
          <Link to="/app/calls" className="text-xs text-primary hover:underline">Alle Calls →</Link>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading ? (
          <div className="h-16 animate-pulse bg-muted rounded" />
        ) : (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="flex items-center justify-center gap-1">
                <PhoneCall className="h-3.5 w-3.5 text-green-500" />
                <span className="text-lg font-bold tabular-nums">{completed}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Erledigt</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <Phone className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-lg font-bold tabular-nums">{pending}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Ausstehend</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <PhoneOff className="h-3.5 w-3.5 text-destructive" />
                <span className="text-lg font-bold tabular-nums">{missed}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Verpasst</p>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Sipgate</span>
          <Badge variant="outline" className="text-[10px]">Verbunden</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
