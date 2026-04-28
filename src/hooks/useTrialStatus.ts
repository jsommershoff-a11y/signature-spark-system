import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type TrialState =
  | 'loading'
  | 'none'           // kein Trial / kein Profil
  | 'trialing'       // aktiver Trial
  | 'trial_expired'  // Trial vorbei, kein active
  | 'active';        // zahlende Mitgliedschaft

export interface TrialStatus {
  state: TrialState;
  isTrial: boolean;       // true für trialing UND trial_expired (gesperrte Mitglieder)
  isTrialing: boolean;    // nur aktiver Trial
  isExpired: boolean;
  isActive: boolean;
  trialEndsAt: string | null;
  daysRemaining: number | null;
}

/**
 * Single source of truth für Trial-/Subscription-Status des aktuellen Users.
 * Liest profiles.subscription_status + trial_ends_at.
 *
 * Admins/Staff werden als 'active' behandelt (umgehen die Trial-Sperre).
 */
export function useTrialStatus(): TrialStatus {
  const { user, isRealAdmin, effectiveRole } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['trial-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Admins (real) sind nie eingesperrt
  if (isRealAdmin) {
    return {
      state: 'active',
      isTrial: false,
      isTrialing: false,
      isExpired: false,
      isActive: true,
      trialEndsAt: null,
      daysRemaining: null,
    };
  }

  if (!user || isLoading) {
    return {
      state: 'loading',
      isTrial: false,
      isTrialing: false,
      isExpired: false,
      isActive: false,
      trialEndsAt: null,
      daysRemaining: null,
    };
  }

  const status = (data as any)?.subscription_status as string | null | undefined;
  const trialEndsAt = (data as any)?.trial_ends_at as string | null | undefined;
  const now = Date.now();
  const endMs = trialEndsAt ? new Date(trialEndsAt).getTime() : null;
  const daysRemaining =
    endMs !== null ? Math.max(0, Math.ceil((endMs - now) / (1000 * 60 * 60 * 24))) : null;

  // Active subscription
  if (status === 'active') {
    return {
      state: 'active',
      isTrial: false,
      isTrialing: false,
      isExpired: false,
      isActive: true,
      trialEndsAt: trialEndsAt ?? null,
      daysRemaining,
    };
  }

  // Trial (laufend)
  if (status === 'trialing' && endMs && endMs > now) {
    return {
      state: 'trialing',
      isTrial: true,
      isTrialing: true,
      isExpired: false,
      isActive: false,
      trialEndsAt: trialEndsAt ?? null,
      daysRemaining,
    };
  }

  // Trial abgelaufen ohne active
  if (status === 'trialing' || (trialEndsAt && endMs !== null && endMs <= now)) {
    return {
      state: 'trial_expired',
      isTrial: true,
      isTrialing: false,
      isExpired: true,
      isActive: false,
      trialEndsAt: trialEndsAt ?? null,
      daysRemaining: 0,
    };
  }

  // Kein Trial-Status → wenn Mitgliederrolle vorhanden → active behandeln, sonst none
  const memberRoles = ['member_basic', 'member_starter', 'member_pro', 'vertriebspartner', 'gruppenbetreuer'];
  if (effectiveRole && memberRoles.includes(effectiveRole)) {
    return {
      state: 'active',
      isTrial: false,
      isTrialing: false,
      isExpired: false,
      isActive: true,
      trialEndsAt: trialEndsAt ?? null,
      daysRemaining,
    };
  }

  return {
    state: 'none',
    isTrial: false,
    isTrialing: false,
    isExpired: false,
    isActive: false,
    trialEndsAt: trialEndsAt ?? null,
    daysRemaining,
  };
}
