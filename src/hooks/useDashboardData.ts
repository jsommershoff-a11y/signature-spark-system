import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { StructogramType } from '@/types/calls';

export interface TopLead {
  id: string;
  first_name: string;
  last_name?: string;
  company?: string;
  email: string;
  purchase_readiness: number;
  success_probability: number;
  primary_type: StructogramType;
  analysis_id: string;
  analysis_created_at: string;
}

export interface RecentAnalysis {
  id: string;
  created_at: string;
  purchase_readiness: number;
  success_probability: number;
  primary_type: StructogramType;
  lead_id: string;
  lead_first_name: string;
  lead_last_name?: string;
  lead_company?: string;
  call_id: string;
}

export interface PipelineStats {
  stage: string;
  count: number;
}

export interface DashboardActivity {
  id: string;
  type: string;
  content: string;
  created_at: string;
  lead_id: string | null;
  customer_id: string | null;
  user_id: string;
  creator_name?: string;
}

export function useDashboardData() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  
  // Monday of current week
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
  const weekStart = monday.toISOString();

  // Top Leads nach Purchase Readiness
  const topLeadsQuery = useQuery({
    queryKey: ['dashboard', 'top-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_analyses')
        .select(`
          id, created_at, purchase_readiness, success_probability, primary_type, lead_id,
          crm_leads!inner ( id, first_name, last_name, company, email )
        `)
        .not('purchase_readiness', 'is', null)
        .order('purchase_readiness', { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data || []).map((item) => {
        const lead = item.crm_leads as unknown as { id: string; first_name: string; last_name?: string; company?: string; email: string };
        return {
          id: lead.id, first_name: lead.first_name, last_name: lead.last_name, company: lead.company, email: lead.email,
          purchase_readiness: item.purchase_readiness || 0, success_probability: item.success_probability || 0,
          primary_type: (item.primary_type as StructogramType) || 'unknown',
          analysis_id: item.id, analysis_created_at: item.created_at,
        } as TopLead;
      });
    },
  });

  // Neueste Analysen
  const recentAnalysesQuery = useQuery({
    queryKey: ['dashboard', 'recent-analyses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_analyses')
        .select(`id, created_at, purchase_readiness, success_probability, primary_type, lead_id, call_id, crm_leads ( id, first_name, last_name, company )`)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data || []).map((item) => {
        const lead = item.crm_leads as unknown as { id: string; first_name: string; last_name?: string; company?: string } | null;
        return {
          id: item.id, created_at: item.created_at, purchase_readiness: item.purchase_readiness || 0,
          success_probability: item.success_probability || 0, primary_type: (item.primary_type as StructogramType) || 'unknown',
          lead_id: item.lead_id || '', lead_first_name: lead?.first_name || 'Unbekannt',
          lead_last_name: lead?.last_name, lead_company: lead?.company, call_id: item.call_id,
        } as RecentAnalysis;
      });
    },
  });

  // Pipeline-Statistiken
  const pipelineStatsQuery = useQuery({
    queryKey: ['dashboard', 'pipeline-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pipeline_items').select('stage');
      if (error) throw error;
      const stageCounts: Record<string, number> = {};
      (data || []).forEach((item) => {
        const stage = item.stage || 'unknown';
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      });
      return Object.entries(stageCounts).map(([stage, count]) => ({ stage, count })) as PipelineStats[];
    },
  });

  // Heutige Tasks
  const todayTasksQuery = useQuery({
    queryKey: ['dashboard', 'today-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_tasks')
        .select('id, title, status, due_at, type')
        .gte('due_at', todayStart)
        .lt('due_at', tomorrowStart)
        .eq('status', 'open')
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  // NEW: Leads today
  const newLeadsTodayQuery = useQuery({
    queryKey: ['dashboard', 'new-leads-today'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('crm_leads')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart);
      if (error) throw error;
      return count || 0;
    },
  });

  // NEW: Leads this week
  const newLeadsWeekQuery = useQuery({
    queryKey: ['dashboard', 'new-leads-week'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('crm_leads')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', weekStart);
      if (error) throw error;
      return count || 0;
    },
  });

  // NEW: Active members
  const activeMembersQuery = useQuery({
    queryKey: ['dashboard', 'active-members'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');
      if (error) throw error;
      return count || 0;
    },
  });

  // NEW: Overdue tasks
  const overdueTasksQuery = useQuery({
    queryKey: ['dashboard', 'overdue-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_tasks')
        .select('id, title, due_at, type, lead_id')
        .eq('status', 'open')
        .lt('due_at', new Date().toISOString())
        .order('due_at', { ascending: true })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  // NEW: Uncontacted new leads (new leads with no activities)
  const uncontactedLeadsQuery = useQuery({
    queryKey: ['dashboard', 'uncontacted-leads'],
    queryFn: async () => {
      // Get new leads
      const { data: leads, error: leadsErr } = await supabase
        .from('crm_leads')
        .select('id, first_name, last_name, company, created_at')
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(20);
      if (leadsErr) throw leadsErr;
      if (!leads || leads.length === 0) return [];

      // Check which have activities
      const leadIds = leads.map(l => l.id);
      const { data: activities, error: actErr } = await supabase
        .from('activities')
        .select('lead_id')
        .in('lead_id', leadIds);
      if (actErr) throw actErr;

      const contactedIds = new Set((activities || []).map(a => a.lead_id));
      return leads.filter(l => !contactedIds.has(l.id)).slice(0, 5);
    },
  });

  // NEW: Today's calls
  const todayCallsQuery = useQuery({
    queryKey: ['dashboard', 'today-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select('id, status, scheduled_at, started_at')
        .gte('scheduled_at', todayStart)
        .lt('scheduled_at', tomorrowStart);
      if (error) throw error;
      return data || [];
    },
  });

  // NEW: Recent activities (global)
  const recentActivitiesQuery = useQuery({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('id, type, content, created_at, lead_id, customer_id, user_id')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;

      if (!data || data.length === 0) return [] as DashboardActivity[];

      const userIds = [...new Set(data.map(a => a.user_id))];
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, first_name, last_name')
          .in('id', userIds);
        if (profiles) {
          profileMap = Object.fromEntries(
            profiles.map(p => [p.id, p.full_name || `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'System'])
          );
        }
      }

      return data.map(a => ({
        ...a,
        creator_name: profileMap[a.user_id] || 'System',
      })) as DashboardActivity[];
    },
  });

  // NEW: Pending follow-up plans
  const pendingFollowupsQuery = useQuery({
    queryKey: ['dashboard', 'pending-followups'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('followup_plans')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (error) throw error;
      return count || 0;
    },
  });

  return {
    topLeads: topLeadsQuery.data || [],
    topLeadsLoading: topLeadsQuery.isLoading,
    recentAnalyses: recentAnalysesQuery.data || [],
    recentAnalysesLoading: recentAnalysesQuery.isLoading,
    pipelineStats: pipelineStatsQuery.data || [],
    pipelineStatsLoading: pipelineStatsQuery.isLoading,
    todayTasks: todayTasksQuery.data || [],
    todayTasksLoading: todayTasksQuery.isLoading,
    // New data
    newLeadsToday: newLeadsTodayQuery.data || 0,
    newLeadsWeek: newLeadsWeekQuery.data || 0,
    activeMembers: activeMembersQuery.data || 0,
    overdueTasks: overdueTasksQuery.data || [],
    overdueTasksLoading: overdueTasksQuery.isLoading,
    uncontactedLeads: uncontactedLeadsQuery.data || [],
    uncontactedLeadsLoading: uncontactedLeadsQuery.isLoading,
    todayCalls: todayCallsQuery.data || [],
    todayCallsLoading: todayCallsQuery.isLoading,
    recentActivities: recentActivitiesQuery.data || [],
    recentActivitiesLoading: recentActivitiesQuery.isLoading,
    pendingFollowups: pendingFollowupsQuery.data || 0,
  };
}

export type DashboardDataReturn = ReturnType<typeof useDashboardData>;
