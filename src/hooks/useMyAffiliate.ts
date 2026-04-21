import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AffiliateRow {
  id: string;
  user_id: string;
  profile_id: string;
  referral_code: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  commission_rate: number;
  stripe_account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  activated_at: string | null;
  created_at: string;
}

export interface CommissionRow {
  id: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  gross_amount_cents: number;
  commission_cents: number;
  commission_rate: number;
  currency: string;
  product_name: string | null;
  customer_email: string | null;
  paid_at: string | null;
  created_at: string;
  failure_reason: string | null;
}

export function useMyAffiliate() {
  const { user } = useAuth();

  const affiliateQuery = useQuery({
    queryKey: ['my-affiliate', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as AffiliateRow | null;
    },
  });

  const commissionsQuery = useQuery({
    queryKey: ['my-commissions', affiliateQuery.data?.id],
    enabled: !!affiliateQuery.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('affiliate_id', affiliateQuery.data!.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as CommissionRow[];
    },
  });

  const referralsQuery = useQuery({
    queryKey: ['my-referrals', affiliateQuery.data?.id],
    enabled: !!affiliateQuery.data?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('affiliate_id', affiliateQuery.data!.id);
      if (error) throw error;
      return count ?? 0;
    },
  });

  return {
    affiliate: affiliateQuery.data,
    commissions: commissionsQuery.data ?? [],
    referralCount: referralsQuery.data ?? 0,
    isLoading: affiliateQuery.isLoading,
    refetch: () => {
      affiliateQuery.refetch();
      commissionsQuery.refetch();
      referralsQuery.refetch();
    },
  };
}
