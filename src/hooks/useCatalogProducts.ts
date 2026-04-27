import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CatalogCategory = 'automation' | 'education';
export type CatalogMode = 'one_time' | 'subscription';

export interface CatalogProduct {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  category: CatalogCategory;
  mode: CatalogMode;
  price_net_cents: number;
  price_gross_cents: number;
  price_period_label: string | null;
  term_label: string | null;
  delivery_days: number;
  stripe_product_id: string;
  stripe_price_id: string;
  payment_link: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const QK = ['catalog_products'] as const;

export function useCatalogProducts(opts?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: [...QK, opts?.includeInactive ? 'all' : 'active'],
    queryFn: async (): Promise<CatalogProduct[]> => {
      let q = supabase
        .from('catalog_products')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });
      if (!opts?.includeInactive) q = q.eq('active', true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CatalogProduct[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpsertCatalogProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Partial<CatalogProduct> & {
      code: string;
      name: string;
      category: CatalogCategory;
      price_net_cents: number;
      price_gross_cents: number;
      stripe_product_id: string;
      stripe_price_id: string;
      payment_link: string;
    }) => {
      const { data, error } = await supabase
        .from('catalog_products')
        .upsert([p], { onConflict: 'code' })
        .select()
        .single();
      if (error) throw error;
      return data as CatalogProduct;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useDeleteCatalogProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('catalog_products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useToggleCatalogActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('catalog_products')
        .update({ active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
