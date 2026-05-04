import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deal, DealStage, DEFAULT_PROBABILITY } from '@/types/deals';
import { toast } from 'sonner';

const KEY = ['deals'];

export function useDeals() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Deal[]> => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('stage_updated_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Deal[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const create = useMutation({
    mutationFn: async (input: Partial<Deal> & { title: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const stage: DealStage = (input.stage as DealStage) || 'new';
      const payload = {
        title: input.title,
        stage,
        value: input.value ?? 0,
        currency: input.currency || 'EUR',
        probability: input.probability ?? DEFAULT_PROBABILITY[stage],
        expected_close_date: input.expected_close_date ?? null,
        lead_id: input.lead_id ?? null,
        customer_id: input.customer_id ?? null,
        owner_id: u.user?.id ?? null,
        notes: input.notes ?? null,
        created_by: u.user?.id ?? null,
      };
      const { data, error } = await supabase.from('deals').insert(payload).select('*').single();
      if (error) throw error;
      return data as Deal;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Deal angelegt');
    },
    onError: (e: any) => toast.error(e?.message || 'Fehler beim Anlegen'),
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: DealStage }) => {
      const { error } = await supabase
        .from('deals')
        .update({ stage, probability: DEFAULT_PROBABILITY[stage] })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e: any) => toast.error(e?.message || 'Fehler beim Verschieben'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('deals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Deal gelöscht');
    },
  });

  return { ...list, create, updateStage, remove };
}
