import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { SocialLibraryItem } from '@/types/social';

export function useSocialLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['social-library'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_library_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as SocialLibraryItem[];
    },
  });

  const createItem = useMutation({
    mutationFn: async (item: Partial<SocialLibraryItem>) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user!.id)
        .single();
      const { data, error } = await supabase
        .from('social_library_items')
        .insert({ ...item, created_by: profile!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-library'] });
      toast({ title: 'Bibliothek-Eintrag erstellt' });
    },
    onError: (e: Error) => toast({ title: 'Fehler', description: e.message, variant: 'destructive' }),
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SocialLibraryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('social_library_items')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-library'] });
      toast({ title: 'Eintrag aktualisiert' });
    },
    onError: (e: Error) => toast({ title: 'Fehler', description: e.message, variant: 'destructive' }),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('social_library_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-library'] });
      toast({ title: 'Eintrag gelöscht' });
    },
    onError: (e: Error) => toast({ title: 'Fehler', description: e.message, variant: 'destructive' }),
  });

  return { items, isLoading, createItem, updateItem, deleteItem };
}
