import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketSource = 'email' | 'mail' | 'manual' | 'phone';

export interface SupportTicket {
  id: string;
  subject: string;
  body: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  source: TicketSource;
  assigned_to: string | null;
  lead_id: string | null;
  email_message_id: string | null;
  sender_email: string | null;
  sender_name: string | null;
  ai_summary: string | null;
  internal_notes: string | null;
  created_by: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useTickets(statusFilter?: TicketStatus | 'all', priorityFilter?: TicketPriority | 'all') {
  return useQuery({
    queryKey: ['support-tickets', statusFilter ?? 'all', priorityFilter ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (statusFilter && statusFilter !== 'all') q = q.eq('status', statusFilter);
      if (priorityFilter && priorityFilter !== 'all') q = q.eq('priority', priorityFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as SupportTicket[];
    },
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<SupportTicket> }) => {
      const update: Partial<SupportTicket> = { ...patch };
      if (patch.status === 'closed' && !patch.closed_at) {
        update.closed_at = new Date().toISOString();
      }
      const { error } = await supabase.from('support_tickets').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('Ticket aktualisiert');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<SupportTicket> & { subject: string }) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert(input as never)
        .select()
        .single();
      if (error) throw error;
      return data as SupportTicket;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('Ticket erstellt');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
