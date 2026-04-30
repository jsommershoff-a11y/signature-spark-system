import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CustomerRecordStatus = 'customer' | 'contact' | 'lead' | 'deleted';
export type CustomerSource = 'profile' | 'crm_lead';

export interface Customer {
  id: string;
  source: CustomerSource;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
  assigned_to: string | null;
  assigned_staff_name: string | null;
  record_status: CustomerRecordStatus;
  deleted_at: string | null;
}

export function useCustomers(
  search: string = '',
  statusFilter: CustomerRecordStatus | null = null,
  includeDeleted: boolean = false,
) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['customers', statusFilter, includeDeleted],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_customers', {
        _include_deleted: includeDeleted,
        _status_filter: statusFilter,
      });
      if (error) throw error;
      return (data ?? []) as Customer[];
    },
  });

  const filtered = search.trim()
    ? query.data?.filter((c) => {
        const term = search.toLowerCase();
        const name = (c.full_name ?? `${c.first_name ?? ''} ${c.last_name ?? ''}`).toLowerCase();
        const company = (c.company ?? '').toLowerCase();
        const email = (c.email ?? '').toLowerCase();
        return name.includes(term) || company.includes(term) || email.includes(term);
      })
    : query.data;

  const softDelete = useMutation({
    mutationFn: async (items: { id: string; source: CustomerSource }[]) => {
      if (items.length === 1) {
        const { error } = await supabase.rpc('soft_delete_customer', {
          _id: items[0].id,
          _source: items[0].source,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('bulk_soft_delete_customers', {
          _items: items as never,
        });
        if (error) throw error;
      }
    },
    onSuccess: (_d, items) => {
      toast.success(`${items.length} ${items.length === 1 ? 'Eintrag gelöscht' : 'Einträge gelöscht'}`);
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (e: Error) => toast.error(`Löschen fehlgeschlagen: ${e.message}`),
  });

  const restore = useMutation({
    mutationFn: async (item: { id: string; source: CustomerSource }) => {
      const { error } = await supabase.rpc('restore_customer', {
        _id: item.id,
        _source: item.source,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Wiederhergestellt');
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (e: Error) => toast.error(`Wiederherstellen fehlgeschlagen: ${e.message}`),
  });

  const convertToLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('convert_contact_to_lead', { _lead_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Kontakt in Lead umgewandelt');
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['pipeline'] });
    },
    onError: (e: Error) => toast.error(`Umwandeln fehlgeschlagen: ${e.message}`),
  });

  const createContact = useMutation({
    mutationFn: async (input: {
      first_name: string;
      last_name?: string;
      email: string;
      phone?: string;
      company?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('crm_leads')
        .insert({
          first_name: input.first_name.trim(),
          last_name: input.last_name?.trim() || null,
          email: input.email.trim().toLowerCase(),
          phone: input.phone?.trim() || null,
          company: input.company?.trim() || null,
          notes: input.notes?.trim() || null,
          status: 'contact' as never,
          source_type: 'outbound_manual',
          discovered_by: 'manual',
        })
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Kontakt angelegt');
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (e: Error) => toast.error(`Anlegen fehlgeschlagen: ${e.message}`),
  });

  return {
    customers: filtered ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    softDelete: softDelete.mutateAsync,
    restore: restore.mutateAsync,
    convertToLead: convertToLead.mutateAsync,
    createContact: createContact.mutateAsync,
    isMutating: softDelete.isPending || restore.isPending || convertToLead.isPending || createContact.isPending,
  };
}
