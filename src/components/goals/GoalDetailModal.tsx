import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MilestoneList } from './MilestoneList';
import { useGoals, type Goal } from '@/hooks/useGoals';

interface GoalDetailModalProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalDetailModal({ goal, open, onOpenChange }: GoalDetailModalProps) {
  const { updateGoal, useMilestones, createMilestone, toggleMilestone, deleteMilestone } = useGoals();
  const { data: milestones = [] } = goal ? useMilestones(goal.id) : { data: [] };
  const [currentAmount, setCurrentAmount] = useState<number | null>(null);

  if (!goal) return null;

  const effectiveAmount = currentAmount ?? goal.current_amount;
  const percent = goal.target_amount > 0 ? Math.round((effectiveAmount / goal.target_amount) * 100) : 0;

  const handleUpdateAmount = () => {
    if (currentAmount === null || currentAmount === goal.current_amount) return;
    updateGoal.mutate({ id: goal.id, current_amount: currentAmount });
    setCurrentAmount(null);
  };

  const handleStatusChange = (status: string) => {
    updateGoal.mutate({ id: goal.id, status });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{goal.title}</DialogTitle>
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
            <span className="text-sm text-muted-foreground pb-1">/ {goal.target_amount}</span>
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
