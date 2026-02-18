import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { computeGoalBreakdown, type GoalBreakdown } from '@/lib/goalBreakdown';
import type { GoalHorizon, Goal } from '@/hooks/useGoals';
import { format, subDays } from 'date-fns';

export function useGoalBreakdowns() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const cutoff = format(subDays(new Date(), 120), 'yyyy-MM-dd');

  const query = useQuery({
    queryKey: ['goal-breakdowns', today],
    queryFn: async () => {
      // 1. Load active goals where end_date >= today
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('status', 'active')
        .gte('end_date', today)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;
      if (!goals || goals.length === 0) return { breakdowns: [], byHorizon: {} as Record<GoalHorizon, GoalBreakdown[]> };

      const goalIds = goals.map((g) => g.id);

      // 2. Load goal_progress for these goals (last 120 days)
      const { data: progress, error: progressError } = await supabase
        .from('goal_progress')
        .select('goal_id, actual_value')
        .in('goal_id', goalIds)
        .gte('period_start', cutoff);

      if (progressError) throw progressError;

      // Group progress by goal_id
      const progressByGoal = new Map<string, { actual_value: number }[]>();
      for (const row of progress ?? []) {
        const arr = progressByGoal.get(row.goal_id) ?? [];
        arr.push({ actual_value: Number(row.actual_value) });
        progressByGoal.set(row.goal_id, arr);
      }

      // 3. Compute breakdowns
      const now = new Date();
      const breakdowns: GoalBreakdown[] = goals.map((goal) => {
        const rows = progressByGoal.get(goal.id) ?? [];
        return computeGoalBreakdown(
          {
            id: goal.id,
            title: goal.title,
            horizon: goal.horizon,
            target_value: goal.target_value != null ? Number(goal.target_value) : null,
            target_amount_cents: goal.target_amount_cents,
            target_amount: goal.target_amount,
            unit: goal.unit,
            start_date: goal.start_date,
            end_date: goal.end_date,
          },
          rows,
          now,
        );
      });

      // 4. Group by horizon
      const byHorizon: Record<string, GoalBreakdown[]> = {};
      for (const b of breakdowns) {
        const key = b.horizon;
        if (!byHorizon[key]) byHorizon[key] = [];
        byHorizon[key].push(b);
      }

      return { breakdowns, byHorizon: byHorizon as Record<GoalHorizon, GoalBreakdown[]> };
    },
  });

  return {
    breakdowns: query.data?.breakdowns ?? [],
    byHorizon: query.data?.byHorizon ?? ({} as Record<GoalHorizon, GoalBreakdown[]>),
    isLoading: query.isLoading,
    error: query.error,
    goals: [] as Goal[], // placeholder for compatibility
  };
}
