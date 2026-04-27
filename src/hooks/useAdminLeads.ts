import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type AdminLead = Tables<'leads'>;

export function useAdminLeads() {
  return useQuery({
    queryKey: ['admin', 'leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminLead[];
    },
  });
}

export type AssignableStaff = {
  id: string;
  full_name: string | null;
  email: string | null;
  team_id: string | null;
};

export function useAssignableStaff() {
  return useQuery({
    queryKey: ['admin', 'assignable-staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role, profiles:profiles!inner(id, full_name, email, team_id)')
        .in('role', ['admin', 'vertriebspartner', 'gruppenbetreuer', 'mitarbeiter', 'teamleiter']);

      if (error) throw error;

      const seen = new Set<string>();
      const staff: AssignableStaff[] = [];
      for (const row of (data ?? []) as any[]) {
        const p = row.profiles;
        if (p && !seen.has(p.id)) {
          seen.add(p.id);
          staff.push({ id: p.id, full_name: p.full_name, email: p.email, team_id: p.team_id });
        }
      }
      staff.sort((a, b) => (a.full_name ?? '').localeCompare(b.full_name ?? '', 'de'));
      return staff;
    },
  });
}

export function useBulkUpdateLeads() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { ids: string[]; patch: Partial<Pick<AdminLead, 'assigned_to' | 'status'>> }) => {
      const { ids, patch } = params;
      if (!ids.length) return 0;
      const { error, count } = await supabase
        .from('leads')
        .update(patch, { count: 'exact' })
        .in('id', ids);
      if (error) throw error;
      return count ?? ids.length;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'leads'] });
    },
  });
}
