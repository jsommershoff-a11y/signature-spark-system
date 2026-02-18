import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type GoalHorizon = 'YEAR' | 'HALF_YEAR' | 'MONTH';
export type PeriodType = 'DAY' | 'WEEK' | 'MONTH';

export interface Goal {
  id: string;
  user_id: string | null;
  team_id: string | null;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  horizon: GoalHorizon;
  target_amount_cents: number | null;
  target_value: number | null;
  unit: string | null;
  reward_title: string | null;
  reward_image_url: string | null;
  reward_amount_cents: number | null;
  assigned_profile?: { full_name: string | null } | null;
  milestones?: GoalMilestone[];
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  period_start: string;
  period_end: string;
  period_type: PeriodType;
  actual_value: number;
  actual_amount_cents: number;
  created_at: string;
  updated_at: string;
}

export function useGoals(status?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const goalsQuery = useQuery({
    queryKey: ['goals', status],
    queryFn: async () => {
      let query = supabase
        .from('goals')
        .select('*, assigned_profile:profiles!goals_user_id_fkey(full_name)')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Goal[];
    },
  });

  const milestonesQuery = (goalId: string) =>
    useQuery({
      queryKey: ['goal_milestones', goalId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('goal_milestones')
          .select('*')
          .eq('goal_id', goalId)
          .order('sort_order');
        if (error) throw error;
        return data as GoalMilestone[];
      },
      enabled: !!goalId,
    });

  const goalProgressQuery = (goalId: string) =>
    useQuery({
      queryKey: ['goal_progress', goalId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('goal_progress')
          .select('*')
          .eq('goal_id', goalId)
          .order('period_start', { ascending: false });
        if (error) throw error;
        return data as GoalProgress[];
      },
      enabled: !!goalId,
    });

  const createGoal = useMutation({
    mutationFn: async (goal: {
      title: string;
      description?: string;
      target_amount: number;
      start_date: string;
      end_date: string;
      user_id?: string;
      team_id?: string;
      created_by: string;
      horizon?: GoalHorizon;
      target_amount_cents?: number;
      target_value?: number;
      unit?: string;
      reward_title?: string;
      reward_image_url?: string;
      reward_amount_cents?: number;
    }) => {
      const { data, error } = await supabase.from('goals').insert(goal).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Ziel erstellt' });
    },
    onError: (err: Error) => {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Goal>) => {
      const { error } = await supabase.from('goals').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Ziel aktualisiert' });
    },
    onError: (err: Error) => {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    },
  });

  const createMilestone = useMutation({
    mutationFn: async (milestone: { goal_id: string; title: string; sort_order: number }) => {
      const { data, error } = await supabase.from('goal_milestones').insert(milestone).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['goal_milestones', vars.goal_id] });
    },
    onError: (err: Error) => {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    },
  });

  const toggleMilestone = useMutation({
    mutationFn: async ({ id, is_completed, goal_id }: { id: string; is_completed: boolean; goal_id: string }) => {
      const { error } = await supabase
        .from('goal_milestones')
        .update({
          is_completed,
          completed_at: is_completed ? new Date().toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
      return { goal_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goal_milestones', data.goal_id] });
    },
  });

  const deleteMilestone = useMutation({
    mutationFn: async ({ id, goal_id }: { id: string; goal_id: string }) => {
      const { error } = await supabase.from('goal_milestones').delete().eq('id', id);
      if (error) throw error;
      return { goal_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goal_milestones', data.goal_id] });
    },
  });

  const upsertGoalProgress = useMutation({
    mutationFn: async (progress: {
      goal_id: string;
      period_start: string;
      period_end: string;
      period_type: PeriodType;
      actual_value: number;
      actual_amount_cents?: number;
    }) => {
      const { data, error } = await supabase
        .from('goal_progress')
        .upsert(progress, { onConflict: 'goal_id,period_start,period_type' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goal_progress', data.goal_id] });
      toast({ title: 'Fortschritt gespeichert' });
    },
    onError: (err: Error) => {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    },
  });

  return {
    goals: goalsQuery.data ?? [],
    isLoading: goalsQuery.isLoading,
    useMilestones: milestonesQuery,
    useGoalProgress: goalProgressQuery,
    createGoal,
    updateGoal,
    createMilestone,
    toggleMilestone,
    deleteMilestone,
    upsertGoalProgress,
  };
}
