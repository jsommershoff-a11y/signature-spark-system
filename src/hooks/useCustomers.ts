import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Customer {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
  assigned_to: string | null;
  assigned_staff_name: string | null;
}

export function useCustomers(search: string = '') {
  const query = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_customers');
      if (error) throw error;
      return (data ?? []) as Customer[];
    },
  });

  const filtered = search.trim()
    ? query.data?.filter((c) => {
        const term = search.toLowerCase();
        const name = (c.full_name ?? `${c.first_name ?? ''} ${c.last_name ?? ''}`).toLowerCase();
        const company = (c.company ?? '').toLowerCase();
        return name.includes(term) || company.includes(term);
      })
    : query.data;

  return {
    customers: filtered ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
