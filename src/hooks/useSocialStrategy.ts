import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { SocialStrategySettings } from '@/types/social';

export function useSocialStrategy() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['social-strategy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_strategy_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as SocialStrategySettings | null;
    },
  });

  const upsertSettings = useMutation({
    mutationFn: async (updates: Partial<SocialStrategySettings>) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user!.id)
        .single();

      if (settings?.id) {
        const { data, error } = await supabase
          .from('social_strategy_settings')
          .update({ ...updates, updated_by: profile!.id } as any)
          .eq('id', settings.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('social_strategy_settings')
          .insert({ ...updates, updated_by: profile!.id } as any)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-strategy'] });
      toast({ title: 'Strategie gespeichert' });
    },
    onError: (e: Error) => toast({ title: 'Fehler', description: e.message, variant: 'destructive' }),
  });

  return { settings, isLoading, upsertSettings };
}
