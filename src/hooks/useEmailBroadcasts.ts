import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { EmailBroadcast } from '@/types/email';

export function useEmailBroadcasts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ['email-broadcasts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('email_broadcasts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as EmailBroadcast[];
    },
  });

  const createBroadcast = useMutation({
    mutationFn: async (b: Partial<EmailBroadcast>) => {
      const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', (await supabase.auth.getUser()).data.user!.id).single();
      const { data, error } = await supabase.from('email_broadcasts').insert({ ...b, created_by: profile!.id } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-broadcasts'] }); toast({ title: 'Broadcast erstellt' }); },
    onError: (e: Error) => toast({ title: 'Fehler', description: e.message, variant: 'destructive' }),
  });

  const updateBroadcast = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmailBroadcast> & { id: string }) => {
      const { data, error } = await supabase.from('email_broadcasts').update(updates as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-broadcasts'] }); toast({ title: 'Broadcast aktualisiert' }); },
    onError: (e: Error) => toast({ title: 'Fehler', description: e.message, variant: 'destructive' }),
  });

  return { broadcasts, isLoading, createBroadcast, updateBroadcast };
}
