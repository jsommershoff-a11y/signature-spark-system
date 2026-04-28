import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type LiveCallReason =
  | 'active'
  | 'trial_available'
  | 'trial_used'
  | 'expired'
  | 'no_access';

export interface LiveCallEligibility {
  can_book: boolean;
  reason: LiveCallReason;
  subscription_status: string | null;
  trial_ends_at: string | null;
  live_call_used_at: string | null;
  used_event_id: string | null;
  used_event_title: string | null;
  used_event_date: string | null;
}

const DEFAULT: LiveCallEligibility = {
  can_book: false,
  reason: 'no_access',
  subscription_status: null,
  trial_ends_at: null,
  live_call_used_at: null,
  used_event_id: null,
  used_event_title: null,
  used_event_date: null,
};

/**
 * Single source of truth for live-call booking permissions.
 * - `active` subscription → unlimited bookings
 * - `trialing` + slot unused → exactly one booking allowed
 * - everything else → blocked, must upgrade
 */
export function useLiveCallEligibility() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['live-call-eligibility', user?.id],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: async (): Promise<LiveCallEligibility> => {
      const { data, error } = await supabase.rpc('get_live_call_eligibility', {
        _user_id: user!.id,
      });
      if (error) {
        console.error('[useLiveCallEligibility]', error);
        return DEFAULT;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return DEFAULT;
      return {
        can_book: Boolean(row.can_book),
        reason: (row.reason as LiveCallReason) ?? 'no_access',
        subscription_status: row.subscription_status ?? null,
        trial_ends_at: row.trial_ends_at ?? null,
        live_call_used_at: row.live_call_used_at ?? null,
        used_event_id: row.used_event_id ?? null,
        used_event_title: row.used_event_title ?? null,
        used_event_date: row.used_event_date ?? null,
      };
    },
  });

  return {
    eligibility: query.data ?? DEFAULT,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
