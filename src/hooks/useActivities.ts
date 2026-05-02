import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ActivityType = 'anruf' | 'email' | 'meeting' | 'notiz' | 'fehler' | 'login';

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
  /** Synthetic entries (e.g. portal logins) are merged in client-side */
  synthetic?: boolean;
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

      // Resolve target user_id + email for portal-login lookup
      let lookupUserId: string | null = null;
      let lookupEmail: string | null = null;

      if (customer_id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('user_id, email')
          .eq('id', customer_id)
          .maybeSingle();
        lookupUserId = prof?.user_id ?? null;
        lookupEmail = prof?.email ?? null;
      } else if (lead_id) {
        const { data: lead } = await supabase
          .from('crm_leads')
          .select('email')
          .eq('id', lead_id)
          .maybeSingle();
        lookupEmail = lead?.email ?? null;
      }

      // Fetch portal logins by user_id and/or email
      let loginRows: Array<{
        id: string;
        user_id: string;
        email: string | null;
        ip: string | null;
        user_agent: string | null;
        created_at: string;
      }> = [];

      if (lookupUserId || lookupEmail) {
        const filters: string[] = [];
        if (lookupUserId) filters.push(`user_id.eq.${lookupUserId}`);
        if (lookupEmail) filters.push(`email.eq.${lookupEmail.toLowerCase()}`);

        const { data: logins } = await supabase
          .from('portal_login_events')
          .select('id, user_id, email, ip, user_agent, created_at')
          .or(filters.join(','))
          .order('created_at', { ascending: false })
          .limit(50);

        loginRows = logins || [];
      }

      // Fetch creator names for activity rows
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

      const real: Activity[] = (data || []).map(a => ({
        ...a,
        type: a.type as ActivityType,
        metadata: a.metadata as Record<string, unknown> | null,
        creator_name: profileMap[a.user_id] || 'System',
      }));

      const synthetic: Activity[] = loginRows.map(l => ({
        id: `login-${l.id}`,
        lead_id: lead_id ?? null,
        customer_id: customer_id ?? null,
        user_id: l.user_id,
        type: 'login',
        content: `Portal-Login${l.email ? ` (${l.email})` : ''}`,
        metadata: {
          source: 'portal',
          event: 'login',
          ip: l.ip,
          user_agent: l.user_agent,
        },
        created_at: l.created_at,
        creator_name: l.email || 'Kunde',
        synthetic: true,
      }));

      return [...real, ...synthetic].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!(lead_id || customer_id),
  });

  const createActivity = useMutation({
    mutationFn: async (input: {
      type: ActivityType;
      content: string;
      lead_id?: string;
      customer_id?: string;
      metadata?: Record<string, unknown> | null;
    }) => {
      if (!profile?.id) throw new Error('Nicht eingeloggt');
      if (!input.content || input.content.length > 5000) {
        throw new Error('Inhalt muss zwischen 1 und 5000 Zeichen lang sein');
      }
      if (input.type === 'login') {
        throw new Error('Login-Events werden automatisch erfasst');
      }

      const { error } = await supabase.from('activities').insert({
        lead_id: input.lead_id || lead_id || null,
        customer_id: input.customer_id || customer_id || null,
        user_id: profile.id,
        type: input.type as 'anruf' | 'email' | 'meeting' | 'notiz' | 'fehler',
        content: input.content,
        metadata: (input.metadata ?? null) as any,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { activities, isLoading, createActivity };
}
