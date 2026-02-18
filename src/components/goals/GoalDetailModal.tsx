import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gift, TrendingUp } from 'lucide-react';
import { MilestoneList } from './MilestoneList';
import { useGoals, type Goal, type GoalHorizon, type PeriodType } from '@/hooks/useGoals';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface GoalDetailModalProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const horizonLabels: Record<GoalHorizon, string> = {
  YEAR: 'Jahr',
  HALF_YEAR: '6 Monate',
  MONTH: 'Monat',
};

export function GoalDetailModal({ goal, open, onOpenChange }: GoalDetailModalProps) {
  const { updateGoal, useMilestones, useGoalProgress, createMilestone, toggleMilestone, deleteMilestone, upsertGoalProgress } = useGoals();
  const { data: milestones = [] } = goal ? useMilestones(goal.id) : { data: [] };
  const { data: progressEntries = [] } = goal ? useGoalProgress(goal.id) : { data: [] };
  const [currentAmount, setCurrentAmount] = useState<number | null>(null);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressPeriodType, setProgressPeriodType] = useState<PeriodType>('WEEK');
  const [progressPeriodStart, setProgressPeriodStart] = useState(new Date().toISOString().slice(0, 10));

  if (!goal) return null;

  const effectiveAmount = currentAmount ?? goal.current_amount;
  const percent = goal.target_amount > 0 ? Math.round((effectiveAmount / goal.target_amount) * 100) : 0;
  const hasReward = !!goal.reward_title || !!goal.reward_amount_cents;

  const handleUpdateAmount = () => {
    if (currentAmount === null || currentAmount === goal.current_amount) return;
    updateGoal.mutate({ id: goal.id, current_amount: currentAmount });
    setCurrentAmount(null);
  };

  const handleStatusChange = (status: string) => {
    updateGoal.mutate({ id: goal.id, status });
  };

  const handleProgressSubmit = () => {
    if (!goal) return;
    const start = new Date(progressPeriodStart);
    let end: Date;
    if (progressPeriodType === 'DAY') {
      end = start;
    } else if (progressPeriodType === 'WEEK') {
      end = new Date(start);
      end.setDate(end.getDate() + 6);
    } else {
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    }

    upsertGoalProgress.mutate({
      goal_id: goal.id,
      period_start: progressPeriodStart,
      period_end: end.toISOString().slice(0, 10),
      period_type: progressPeriodType,
      actual_value: progressValue,
    });
    setShowProgressForm(false);
    setProgressValue(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{goal.title}</DialogTitle>
            <Badge variant="outline" className="text-xs">{horizonLabels[goal.horizon] ?? goal.horizon}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {goal.description && (
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fortschritt</span>
              <span className="font-medium">{percent}%</span>
            </div>
            <Progress value={percent} className="h-3" />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Aktueller Wert</Label>
              <Input
                type="number"
                min={0}
                max={goal.target_amount}
                defaultValue={goal.current_amount}
                onChange={(e) => setCurrentAmount(Number(e.target.value))}
                className="h-8"
              />
            </div>
            <span className="text-sm text-muted-foreground pb-1">
              / {goal.target_amount}{goal.unit ? ` ${goal.unit}` : ''}
            </span>
            <Button size="sm" onClick={handleUpdateAmount} disabled={updateGoal.isPending}>
              Speichern
            </Button>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select defaultValue={goal.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">Abgebrochen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Motivation / Reward */}
          {hasReward && (
            <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Gift className="h-4 w-4 text-amber-500" />
                <span>Motivation</span>
              </div>
              {goal.reward_image_url && (
                <img src={goal.reward_image_url} alt="Belohnung" className="w-full h-32 object-cover rounded-md" />
              )}
              {goal.reward_title && <p className="text-sm">{goal.reward_title}</p>}
              {goal.reward_amount_cents != null && goal.reward_amount_cents > 0 && (
                <p className="text-sm font-medium">{(goal.reward_amount_cents / 100).toFixed(2)} €</p>
              )}
            </div>
          )}

          {/* Progress Tracking */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>Fortschritt-Tracking</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowProgressForm(!showProgressForm)}>
                {showProgressForm ? 'Abbrechen' : 'Erfassen'}
              </Button>
            </div>

            {showProgressForm && (
              <div className="rounded-lg border p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Periodentyp</Label>
                    <Select value={progressPeriodType} onValueChange={(v) => setProgressPeriodType(v as PeriodType)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAY">Tag</SelectItem>
                        <SelectItem value="WEEK">Woche</SelectItem>
                        <SelectItem value="MONTH">Monat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Startdatum</Label>
                    <Input type="date" className="h-8" value={progressPeriodStart} onChange={(e) => setProgressPeriodStart(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ist-Wert{goal.unit ? ` (${goal.unit})` : ''}</Label>
                  <Input type="number" className="h-8" min={0} value={progressValue} onChange={(e) => setProgressValue(Number(e.target.value))} />
                </div>
                <Button size="sm" className="w-full" onClick={handleProgressSubmit} disabled={upsertGoalProgress.isPending}>
                  Speichern
                </Button>
              </div>
            )}

            {progressEntries.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {progressEntries.map((p) => (
                  <div key={p.id} className="flex justify-between text-xs border-b py-1.5">
                    <span className="text-muted-foreground">
                      {format(new Date(p.period_start), 'dd.MM.yy', { locale: de })} ({p.period_type})
                    </span>
                    <span className="font-medium">
                      {p.actual_value}{goal.unit ? ` ${goal.unit}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <MilestoneList
            milestones={milestones}
            onToggle={(id, completed) => toggleMilestone.mutate({ id, is_completed: completed, goal_id: goal.id })}
            onAdd={(title, sortOrder) => createMilestone.mutate({ goal_id: goal.id, title, sort_order: sortOrder })}
            onDelete={(id) => deleteMilestone.mutate({ id, goal_id: goal.id })}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
