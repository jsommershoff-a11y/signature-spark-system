import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Member, MemberKPI, MemberStatus } from '@/types/members';

export function useAdminMembers() {
  const queryClient = useQueryClient();

  // Fetch all members with stats
  const membersQuery = useQuery({
    queryKey: ['admin_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          profile:profiles(*),
          memberships(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Member[];
    },
  });

  // Get member details
  const getMemberDetails = async (memberId: string): Promise<Member | null> => {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        profile:profiles(*),
        memberships(*)
      `)
      .eq('id', memberId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as unknown as Member;
  };

  // Get member KPIs
  const getMemberKPIs = async (memberId: string): Promise<MemberKPI[]> => {
    const { data, error } = await supabase
      .from('member_kpis')
      .select('*')
      .eq('member_id', memberId)
      .order('week_start_date', { ascending: false })
      .limit(52);

    if (error) throw error;
    return data as unknown as MemberKPI[];
  };

  // Get top performers by activity score
  const topPerformersQuery = useQuery({
    queryKey: ['admin_members_top'],
    queryFn: async () => {
      // Get latest KPIs for each member
      const { data: kpis, error } = await supabase
        .from('member_kpis')
        .select(`
          *,
          member:members(
            *,
            profile:profiles(*)
          )
        `)
        .order('week_start_date', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Group by member, keep only latest
      const latestByMember = new Map<string, typeof kpis[0]>();
      kpis.forEach((kpi) => {
        if (!latestByMember.has(kpi.member_id)) {
          latestByMember.set(kpi.member_id, kpi);
        }
      });

      // Sort by activity score and take top 5
      return Array.from(latestByMember.values())
        .sort((a, b) => b.activity_score - a.activity_score)
        .slice(0, 5);
    },
  });

  // Get at-risk members (risk score > 70)
  const atRiskQuery = useQuery({
    queryKey: ['admin_members_risk'],
    queryFn: async () => {
      const { data: kpis, error } = await supabase
        .from('member_kpis')
        .select(`
          *,
          member:members(
            *,
            profile:profiles(*)
          )
        `)
        .gte('risk_score', 70)
        .order('week_start_date', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Group by member, keep only latest
      const latestByMember = new Map<string, typeof kpis[0]>();
      kpis.forEach((kpi) => {
        if (!latestByMember.has(kpi.member_id)) {
          latestByMember.set(kpi.member_id, kpi);
        }
      });

      // Filter to only show members still at risk
      return Array.from(latestByMember.values())
        .filter((kpi) => kpi.risk_score >= 70)
        .sort((a, b) => b.risk_score - a.risk_score);
    },
  });

  // Update member status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: MemberStatus }) => {
      const { data, error } = await supabase
        .from('members')
        .update({ status })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_members'] });
    },
  });

  // Add KPI entry
  const addKPIMutation = useMutation({
    mutationFn: async (kpi: Partial<MemberKPI> & { member_id: string; week_start_date: string }) => {
      const { data, error } = await supabase
        .from('member_kpis')
        .upsert({
          member_id: kpi.member_id,
          week_start_date: kpi.week_start_date,
          tasks_completion_rate: kpi.tasks_completion_rate,
          lesson_completion_rate: kpi.lesson_completion_rate,
          revenue_value: kpi.revenue_value,
          activity_score: kpi.activity_score,
          risk_score: kpi.risk_score,
          notes: kpi.notes,
        }, { onConflict: 'member_id,week_start_date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_members'] });
      queryClient.invalidateQueries({ queryKey: ['admin_members_top'] });
      queryClient.invalidateQueries({ queryKey: ['admin_members_risk'] });
    },
  });

  return {
    members: membersQuery.data || [],
    topPerformers: topPerformersQuery.data || [],
    atRiskMembers: atRiskQuery.data || [],
    isLoading: membersQuery.isLoading,
    getMemberDetails,
    getMemberKPIs,
    updateStatus: updateStatusMutation.mutate,
    addKPI: addKPIMutation.mutate,
    refetch: () => {
      membersQuery.refetch();
      topPerformersQuery.refetch();
      atRiskQuery.refetch();
    },
  };
}
