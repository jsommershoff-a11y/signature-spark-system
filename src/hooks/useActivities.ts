import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ActivityType = 'anruf' | 'email' | 'meeting' | 'notiz' | 'fehler';

export interface Activity {
  id: string;
  lead_id: string | null;
  customer_id: string | null;
  user_id: string;
  type: ActivityType;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  creator_name?: string;
}

interface UseActivitiesOptions {
  lead_id?: string;
  customer_id?: string;
}

export function useActivities({ lead_id, customer_id }: UseActivitiesOptions) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const queryKey = ['activities', lead_id, customer_id];

  const { data: activities = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (lead_id) query = query.eq('lead_id', lead_id);
      if (customer_id) query = query.eq('customer_id', customer_id);

      const { data, error } = await query;
      if (error) throw error;

      // Fetch creator names for all unique user_ids
      const userIds = [...new Set((data || []).map(a => a.user_id))];
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, first_name, last_name')
          .in('id', userIds);
        
        if (profiles) {
          profileMap = Object.fromEntries(
            profiles.map(p => [
              p.id,
              p.full_name || `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Unbekannt',
            ])
          );
        }
      }

      return (data || []).map(a => ({
        ...a,
        type: a.type as ActivityType,
        metadata: a.metadata as Record<string, unknown> | null,
        creator_name: profileMap[a.user_id] || 'System',
      })) as Activity[];
    },
    enabled: !!(lead_id || customer_id),
  });

  const createActivity = useMutation({
    mutationFn: async (input: {
      type: ActivityType;
      content: string;
      lead_id?: string;
      customer_id?: string;
    }) => {
      if (!profile?.id) throw new Error('Nicht eingeloggt');
      if (!input.content || input.content.length > 5000) {
        throw new Error('Inhalt muss zwischen 1 und 5000 Zeichen lang sein');
      }

      const { error } = await supabase.from('activities').insert({
        lead_id: input.lead_id || lead_id || null,
        customer_id: input.customer_id || customer_id || null,
        user_id: profile.id,
        type: input.type,
        content: input.content,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { activities, isLoading, createActivity };
}
