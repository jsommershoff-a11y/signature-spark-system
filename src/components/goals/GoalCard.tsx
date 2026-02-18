import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Goal, GoalHorizon } from '@/hooks/useGoals';

interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
}

const statusLabels: Record<string, string> = {
  active: 'Aktiv',
  completed: 'Abgeschlossen',
  cancelled: 'Abgebrochen',
};

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  completed: 'secondary',
  cancelled: 'destructive',
};

const horizonLabels: Record<GoalHorizon, string> = {
  YEAR: 'Jahr',
  HALF_YEAR: '6M',
  MONTH: 'Monat',
};

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const percent = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;
  const hasReward = !!goal.reward_title || !!goal.reward_amount_cents;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base truncate">{goal.title}</CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            {hasReward && <Gift className="h-3.5 w-3.5 text-amber-500" />}
            <Badge variant="outline" className="text-xs">{horizonLabels[goal.horizon] ?? goal.horizon}</Badge>
            <Badge variant={statusVariant[goal.status] ?? 'default'}>
              {statusLabels[goal.status] ?? goal.status}
            </Badge>
          </div>
        </div>
        {goal.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">{goal.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="font-medium">{percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {goal.current_amount} / {goal.target_amount}
              {goal.unit ? ` ${goal.unit}` : ''}
            </span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{format(new Date(goal.start_date), 'dd.MM.yy', { locale: de })} – {format(new Date(goal.end_date), 'dd.MM.yy', { locale: de })}</span>
          {goal.assigned_profile?.full_name && (
            <span>{goal.assigned_profile.full_name}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
