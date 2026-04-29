import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoals, type GoalHorizon } from '@/hooks/useGoals';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveFormDialog } from '@/components/app/ResponsiveFormDialog';

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HORIZON_OPTIONS: { value: GoalHorizon; label: string }[] = [
  { value: 'YEAR', label: 'Jahr' },
  { value: 'HALF_YEAR', label: '6 Monate' },
  { value: 'MONTH', label: 'Monat' },
];

function getDefaultDates(horizon: GoalHorizon) {
  const now = new Date();
  const start = now.toISOString().slice(0, 10);
  let end: Date;
  if (horizon === 'YEAR') {
    end = new Date(now.getFullYear(), 11, 31);
  } else if (horizon === 'HALF_YEAR') {
    end = new Date(now);
    end.setMonth(end.getMonth() + 6);
  } else {
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  return { start, end: end.toISOString().slice(0, 10) };
}

export function CreateGoalDialog({ open, onOpenChange }: CreateGoalDialogProps) {
  const { createGoal } = useGoals();
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [horizon, setHorizon] = useState<GoalHorizon>('YEAR');
  const [targetAmount, setTargetAmount] = useState(100);
  const [unit, setUnit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardAmountCents, setRewardAmountCents] = useState<number | ''>('');

  useEffect(() => {
    const defaults = getDefaultDates(horizon);
    setStartDate(defaults.start);
    setEndDate(defaults.end);
  }, [horizon]);

  useEffect(() => {
    if (open) {
      const defaults = getDefaultDates('YEAR');
      setStartDate(defaults.start);
      setEndDate(defaults.end);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !endDate || !profile?.id) return;

    createGoal.mutate(
      {
        title,
        description: description || undefined,
        target_amount: targetAmount,
        start_date: startDate,
        end_date: endDate,
        created_by: profile.id,
        horizon,
        unit: unit || undefined,
        target_value: targetAmount,
        reward_title: rewardTitle || undefined,
        reward_amount_cents: rewardAmountCents ? Number(rewardAmountCents) : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setTitle('');
          setDescription('');
          setHorizon('YEAR');
          setTargetAmount(100);
          setUnit('');
          setRewardTitle('');
          setRewardAmountCents('');
        },
      }
    );
  };

  const formId = 'create-goal-form';

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Neues Ziel erstellen"
      desktopMaxWidth="max-w-lg"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 sm:h-10"
          >
            Abbrechen
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={createGoal.isPending}
            className="h-11 sm:h-10 sm:w-auto w-full"
          >
            {createGoal.isPending ? 'Wird erstellt...' : 'Ziel erstellen'}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titel</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc">Beschreibung</Label>
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Horizont</Label>
            <Select value={horizon} onValueChange={(v) => setHorizon(v as GoalHorizon)}>
              <SelectTrigger className="h-11 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HORIZON_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Einheit</Label>
            <Input id="unit" placeholder="z.B. EUR, Calls, Termine" value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target">Zielwert</Label>
          <Input id="target" type="number" inputMode="numeric" min={1} value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start">Startdatum</Label>
            <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">Enddatum</Label>
            <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Motivation / Belohnung (optional)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reward">Belohnungstitel</Label>
              <Input id="reward" placeholder="z.B. Teamessen" value={rewardTitle} onChange={(e) => setRewardTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rewardAmount">Betrag (Cent)</Label>
              <Input id="rewardAmount" type="number" inputMode="numeric" min={0} placeholder="z.B. 5000" value={rewardAmountCents} onChange={(e) => setRewardAmountCents(e.target.value ? Number(e.target.value) : '')} />
            </div>
          </div>
        </div>
      </form>
    </ResponsiveFormDialog>
  );
}
