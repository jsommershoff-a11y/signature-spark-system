import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { CrmTask, TaskFilters, CreateTaskInput, UpdateTaskInput } from '@/types/crm';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, endOfDay } from 'date-fns';

export function useTasks(filters?: TaskFilters) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('crm_tasks')
        .select(`
          *,
          assigned_user:profiles!crm_tasks_assigned_user_id_fkey(id, first_name, last_name, full_name),
          lead:crm_leads(id, first_name, last_name, company, email)
        `)
        .order('due_at', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.assigned_user_id) {
        query = query.eq('assigned_user_id', filters.assigned_user_id);
      }
      if (filters?.lead_id) {
        query = query.eq('lead_id', filters.lead_id);
      }
      if (filters?.due_today) {
        const today = new Date();
        query = query
          .gte('due_at', startOfDay(today).toISOString())
          .lte('due_at', endOfDay(today).toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as CrmTask[];
    },
  });

  const tasks = data ?? [];

  const openTasks = useMemo(() => tasks.filter(t => t.status === 'open'), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(t => t.status === 'done'), [tasks]);
  const blockedTasks = useMemo(() => tasks.filter(t => t.status === 'blocked'), [tasks]);

  const createTask = async (input: CreateTaskInput): Promise<CrmTask | null> => {
    try {
      const dbInput = {
        ...input,
        meta: input.meta as Json | undefined,
      };

      const { data, error } = await supabase
        .from('crm_tasks')
        .insert(dbInput)
        .select(`
          *,
          assigned_user:profiles!crm_tasks_assigned_user_id_fkey(id, first_name, last_name, full_name),
          lead:crm_leads(id, first_name, last_name, company, email)
        `)
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tasks'] });

      toast({
        title: 'Aufgabe erstellt',
        description: input.title,
      });

      return data as CrmTask;
    } catch (err) {
      toast({
        title: 'Fehler beim Erstellen der Aufgabe',
        description: (err as Error).message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateTask = async (input: UpdateTaskInput): Promise<CrmTask | null> => {
    try {
      const { id, ...updates } = input;
      const dbUpdates = {
        ...updates,
        meta: updates.meta as Json | undefined,
      };

      const { data, error } = await supabase
        .from('crm_tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          assigned_user:profiles!crm_tasks_assigned_user_id_fkey(id, first_name, last_name, full_name),
          lead:crm_leads(id, first_name, last_name, company, email)
        `)
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tasks'] });

      toast({
        title: 'Aufgabe aktualisiert',
        description: 'Änderungen wurden gespeichert.',
      });

      return data as CrmTask;
    } catch (err) {
      toast({
        title: 'Fehler beim Aktualisieren',
        description: (err as Error).message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const completeTask = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('crm_tasks')
        .update({ status: 'done' })
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tasks'] });

      toast({
        title: 'Aufgabe erledigt',
        description: 'Die Aufgabe wurde als erledigt markiert.',
      });

      return true;
    } catch (err) {
      toast({
        title: 'Fehler beim Abschließen',
        description: (err as Error).message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const reopenTask = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('crm_tasks')
        .update({ status: 'open' })
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tasks'] });

      toast({
        title: 'Aufgabe wieder geöffnet',
        description: 'Die Aufgabe ist wieder offen.',
      });

      return true;
    } catch (err) {
      toast({
        title: 'Fehler beim Öffnen',
        description: (err as Error).message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('crm_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tasks'] });

      toast({
        title: 'Aufgabe gelöscht',
        description: 'Die Aufgabe wurde erfolgreich entfernt.',
      });

      return true;
    } catch (err) {
      toast({
        title: 'Fehler beim Löschen',
        description: (err as Error).message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    tasks,
    openTasks,
    doneTasks,
    blockedTasks,
    loading: isLoading,
    error: error as Error | null,
    refetch,
    createTask,
    updateTask,
    completeTask,
    reopenTask,
    deleteTask,
  };
}
