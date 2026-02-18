import { differenceInDays } from 'date-fns';
import type { GoalHorizon } from '@/hooks/useGoals';

export interface GoalBreakdown {
  goalId: string;
  goalTitle: string;
  horizon: GoalHorizon;
  unit: string | null;
  targetTotal: number;
  actualToDate: number;
  requiredPerMonth: number;
  requiredPerWeek: number;
  requiredPerDay: number;
  actualAvgPerDay: number;
  status: 'green' | 'red';
  todosToday: { label: string; value: number; unit: string }[];
}

interface GoalInput {
  id: string;
  title: string;
  horizon: string;
  target_value: number | null;
  target_amount_cents: number | null;
  target_amount: number;
  unit: string | null;
  start_date: string;
  end_date: string;
}

interface ProgressRow {
  actual_value: number;
}

const UNIT_LABELS: Record<string, string> = {
  Calls: 'Calls heute',
  Termine: 'Termine heute',
  Deals: 'Deals heute',
  EUR: '€ heute',
};

export function computeGoalBreakdown(
  goal: GoalInput,
  progressRows: ProgressRow[],
  now: Date,
): GoalBreakdown {
  // Determine target
  const isEur = goal.unit === 'EUR' || (goal.target_amount_cents != null && goal.target_amount_cents > 0);
  let targetTotal: number;
  if (goal.target_value != null && goal.target_value > 0) {
    targetTotal = goal.target_value;
  } else if (isEur && goal.target_amount_cents != null) {
    targetTotal = goal.target_amount_cents / 100;
  } else {
    targetTotal = goal.target_amount;
  }

  // Actual progress
  const actualToDate = progressRows.reduce((sum, r) => sum + (r.actual_value ?? 0), 0);

  // Days
  const startDate = new Date(goal.start_date);
  const endDate = new Date(goal.end_date);
  const elapsedDays = Math.max(1, differenceInDays(now, startDate));
  const remainingDays = Math.max(1, differenceInDays(endDate, now));

  // Required rates
  const remaining = Math.max(0, targetTotal - actualToDate);
  const requiredPerDay = remaining / remainingDays;
  const requiredPerWeek = requiredPerDay * 7;
  const requiredPerMonth = requiredPerDay * 30.4375;

  // Actual average
  const actualAvgPerDay = actualToDate / elapsedDays;

  // Status
  const status: 'green' | 'red' = actualAvgPerDay >= requiredPerDay * 0.98 ? 'green' : 'red';

  // Today's todos
  const unitKey = isEur ? 'EUR' : (goal.unit ?? '');
  const label = UNIT_LABELS[unitKey] || `${unitKey || 'Einheiten'} heute`;
  const todosToday = [
    {
      label,
      value: Math.ceil(requiredPerDay),
      unit: isEur ? '€' : (goal.unit ?? ''),
    },
  ];

  return {
    goalId: goal.id,
    goalTitle: goal.title,
    horizon: goal.horizon as GoalHorizon,
    unit: goal.unit,
    targetTotal,
    actualToDate,
    requiredPerMonth,
    requiredPerWeek,
    requiredPerDay,
    actualAvgPerDay,
    status,
    todosToday,
  };
}
