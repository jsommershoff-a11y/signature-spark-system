import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Offer, OfferContent } from '@/types/offers';

export function useMyContracts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-contracts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get member record for this user
      const { data: member } = await supabase
        .from('members')
        .select('id, lead_id')
        .eq('user_id', user.id)
        .single();

      if (!member?.lead_id) return [];

      // Get offers linked to this lead
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          crm_leads (id, first_name, last_name, email, company)
        `)
        .eq('lead_id', member.lead_id)
        .in('status', ['sent', 'viewed', 'accepted', 'paid'] as const)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        offer_json: item.offer_json as unknown as OfferContent,
        lead: item.crm_leads,
      })) as unknown as Offer[];
    },
    enabled: !!user?.id,
  });
}
