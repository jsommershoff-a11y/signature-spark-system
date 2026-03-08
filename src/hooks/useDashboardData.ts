import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AiAnalysis, StructogramType } from '@/types/calls';

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

export function useDashboardData() {
  // Top Leads nach Purchase Readiness
  const topLeadsQuery = useQuery({
    queryKey: ['dashboard', 'top-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_analyses')
        .select(`
          id,
          created_at,
          purchase_readiness,
          success_probability,
          primary_type,
          lead_id,
          crm_leads!inner (
            id,
            first_name,
            last_name,
            company,
            email
          )
        `)
        .not('purchase_readiness', 'is', null)
        .order('purchase_readiness', { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map((item) => {
        const lead = item.crm_leads as unknown as {
          id: string;
          first_name: string;
          last_name?: string;
          company?: string;
          email: string;
        };
        return {
          id: lead.id,
          first_name: lead.first_name,
          last_name: lead.last_name,
          company: lead.company,
          email: lead.email,
          purchase_readiness: item.purchase_readiness || 0,
          success_probability: item.success_probability || 0,
          primary_type: (item.primary_type as StructogramType) || 'unknown',
          analysis_id: item.id,
          analysis_created_at: item.created_at,
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
        .select(`
          id,
          created_at,
          purchase_readiness,
          success_probability,
          primary_type,
          lead_id,
          call_id,
          crm_leads (
            id,
            first_name,
            last_name,
            company
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map((item) => {
        const lead = item.crm_leads as unknown as {
          id: string;
          first_name: string;
          last_name?: string;
          company?: string;
        } | null;
        return {
          id: item.id,
          created_at: item.created_at,
          purchase_readiness: item.purchase_readiness || 0,
          success_probability: item.success_probability || 0,
          primary_type: (item.primary_type as StructogramType) || 'unknown',
          lead_id: item.lead_id || '',
          lead_first_name: lead?.first_name || 'Unbekannt',
          lead_last_name: lead?.last_name,
          lead_company: lead?.company,
          call_id: item.call_id,
        } as RecentAnalysis;
      });
    },
  });

  // Pipeline-Statistiken
  const pipelineStatsQuery = useQuery({
    queryKey: ['dashboard', 'pipeline-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_items')
        .select('stage');

      if (error) throw error;

      const stageCounts: Record<string, number> = {};
      (data || []).forEach((item) => {
        const stage = item.stage || 'unknown';
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      });

      return Object.entries(stageCounts).map(([stage, count]) => ({
        stage,
        count,
      })) as PipelineStats[];
    },
  });

  // Heutige Tasks
  const todayTasksQuery = useQuery({
    queryKey: ['dashboard', 'today-tasks'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('crm_tasks')
        .select('id, title, status, due_at, type')
        .gte('due_at', today.toISOString())
        .lt('due_at', tomorrow.toISOString())
        .eq('status', 'open')
        .limit(10);

      if (error) throw error;
      return data || [];
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
  };
}

export type DashboardDataReturn = ReturnType<typeof useDashboardData>;
