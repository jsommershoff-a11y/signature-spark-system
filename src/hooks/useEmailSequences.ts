import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { EmailSequence, EmailSequenceStep, LeadSequenceEnrollment } from '@/types/email';

export function useEmailSequences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sequences = [], isLoading } = useQuery({
    queryKey: ['email-sequences'],
    queryFn: async () => {
      const { data, error } = await supabase.from('email_sequences').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as EmailSequence[];
    },
  });

  const createSequence = useMutation({
    mutationFn: async (s: Partial<EmailSequence>) => {
      const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', (await supabase.auth.getUser()).data.user!.id).single();
      const { data, error } = await supabase.from('email_sequences').insert({ ...s, created_by: profile!.id } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-sequences'] }); toast({ title: 'Sequenz erstellt' }); },
    onError: (e: Error) => toast({ title: 'Fehler', description: e.message, variant: 'destructive' }),
  });

  const updateSequence = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmailSequence> & { id: string }) => {
      const { data, error } = await supabase.from('email_sequences').update(updates as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-sequences'] }); toast({ title: 'Sequenz aktualisiert' }); },
    onError: (e: Error) => toast({ title: 'Fehler', description: e.message, variant: 'destructive' }),
  });

  const deleteSequence = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_sequences').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-sequences'] }); toast({ title: 'Sequenz gelöscht' }); },
    onError: (e: Error) => toast({ title: 'Fehler', description: e.message, variant: 'destructive' }),
  });

  return { sequences, isLoading, createSequence, updateSequence, deleteSequence };
}

export function useSequenceSteps(sequenceId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: steps = [], isLoading } = useQuery({
    queryKey: ['email-sequence-steps', sequenceId],
    queryFn: async () => {
      if (!sequenceId) return [];
      const { data, error } = await supabase.from('email_sequence_steps').select('*').eq('sequence_id', sequenceId).order('step_order');
      if (error) throw error;
      return data as unknown as EmailSequenceStep[];
    },
    enabled: !!sequenceId,
  });

  const addStep = useMutation({
    mutationFn: async (step: Partial<EmailSequenceStep>) => {
      const { data, error } = await supabase.from('email_sequence_steps').insert(step as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['email-sequence-steps', sequenceId] }),
    onError: (e: Error) => toast({ title: 'Fehler', description: e.message, variant: 'destructive' }),
  });

  const updateStep = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmailSequenceStep> & { id: string }) => {
      const { data, error } = await supabase.from('email_sequence_steps').update(updates as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['email-sequence-steps', sequenceId] }),
    onError: (e: Error) => toast({ title: 'Fehler', description: e.message, variant: 'destructive' }),
  });

  const deleteStep = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_sequence_steps').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['email-sequence-steps', sequenceId] }),
    onError: (e: Error) => toast({ title: 'Fehler', description: e.message, variant: 'destructive' }),
  });

  return { steps, isLoading, addStep, updateStep, deleteStep };
}

export function useSequenceEnrollments(sequenceId: string | null) {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['email-enrollments', sequenceId],
    queryFn: async () => {
      if (!sequenceId) return [];
      const { data, error } = await supabase.from('lead_sequence_enrollments').select('*').eq('sequence_id', sequenceId).order('enrolled_at', { ascending: false });
      if (error) throw error;
      return data as unknown as LeadSequenceEnrollment[];
    },
    enabled: !!sequenceId,
  });

  return { enrollments, isLoading };
}
