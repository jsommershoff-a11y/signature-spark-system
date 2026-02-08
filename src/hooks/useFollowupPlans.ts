import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FollowupPlan, FollowupPlanStatus } from '@/types/automation';

export function useFollowupPlans() {
  const queryClient = useQueryClient();

  // Get pending plans for approval
  const pendingPlansQuery = useQuery({
    queryKey: ['followup_plans_pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('followup_plans')
        .select(`
          *,
          lead:crm_leads(
            id,
            first_name,
            last_name,
            company,
            email
          ),
          steps:followup_steps(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Sort steps by step_order
      (data || []).forEach((plan) => {
        if (plan.steps) {
          plan.steps.sort((a: { step_order: number }, b: { step_order: number }) => 
            a.step_order - b.step_order
          );
        }
      });

      return data as unknown as FollowupPlan[];
    },
  });

  // Get all plans with filtering
  const allPlansQuery = useQuery({
    queryKey: ['followup_plans_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('followup_plans')
        .select(`
          *,
          lead:crm_leads(
            id,
            first_name,
            last_name,
            company,
            email
          ),
          approver:profiles!followup_plans_approved_by_fkey(
            id,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as unknown as FollowupPlan[];
    },
  });

  // Get plan details with steps
  const getPlanDetails = async (planId: string): Promise<FollowupPlan | null> => {
    const { data, error } = await supabase
      .from('followup_plans')
      .select(`
        *,
        lead:crm_leads(
          id,
          first_name,
          last_name,
          company,
          email,
          phone
        ),
        approver:profiles!followup_plans_approved_by_fkey(
          id,
          full_name
        ),
        steps:followup_steps(*)
      `)
      .eq('id', planId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Sort steps
    if (data.steps) {
      data.steps.sort((a: { step_order: number }, b: { step_order: number }) => 
        a.step_order - b.step_order
      );
    }

    return data as unknown as FollowupPlan;
  };

  // Approve plan
  const approvePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      // Get user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('followup_plans')
        .update({
          status: 'approved' as FollowupPlanStatus,
          approved_by: profile.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup_plans'] });
    },
  });

  // Reject plan
  const rejectPlanMutation = useMutation({
    mutationFn: async ({ planId, reason }: { planId: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('followup_plans')
        .update({
          status: 'rejected' as FollowupPlanStatus,
          approved_by: profile.id,
          approved_at: new Date().toISOString(),
          execution_result: { rejection_reason: reason },
        })
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup_plans'] });
    },
  });

  return {
    pendingPlans: pendingPlansQuery.data || [],
    allPlans: allPlansQuery.data || [],
    pendingCount: pendingPlansQuery.data?.length || 0,
    isLoading: pendingPlansQuery.isLoading,
    getPlanDetails,
    approvePlan: approvePlanMutation.mutate,
    rejectPlan: rejectPlanMutation.mutate,
    isApproving: approvePlanMutation.isPending,
    isRejecting: rejectPlanMutation.isPending,
    refetch: () => {
      pendingPlansQuery.refetch();
      allPlansQuery.refetch();
    },
  };
}
