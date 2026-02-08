import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { CrmTask, TaskFilters, CreateTaskInput, UpdateTaskInput } from '@/types/crm';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, endOfDay } from 'date-fns';

export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('crm_tasks')
        .select(`
          *,
          assigned_user:profiles!crm_tasks_assigned_user_id_fkey(id, first_name, last_name, full_name),
          lead:crm_leads(id, first_name, last_name, company, email)
        `)
        .order('due_at', { ascending: true });

      // Apply filters
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

      setTasks((data || []) as CrmTask[]);
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Fehler beim Laden der Aufgaben',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (input: CreateTaskInput): Promise<CrmTask | null> => {
    try {
      // Convert to database-compatible format
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

      const newTask = data as CrmTask;
      setTasks(prev => [newTask, ...prev]);

      toast({
        title: 'Aufgabe erstellt',
        description: input.title,
      });

      return newTask;
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
      // Convert to database-compatible format
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

      const updatedTask = data as CrmTask;
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));

      toast({
        title: 'Aufgabe aktualisiert',
        description: 'Änderungen wurden gespeichert.',
      });

      return updatedTask;
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

      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, status: 'done' as const } : task
      ));

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

      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, status: 'open' as const } : task
      ));

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

      setTasks(prev => prev.filter(task => task.id !== id));

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

  // Group tasks by status
  const openTasks = tasks.filter(t => t.status === 'open');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const blockedTasks = tasks.filter(t => t.status === 'blocked');

  return {
    tasks,
    openTasks,
    doneTasks,
    blockedTasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    completeTask,
    reopenTask,
    deleteTask,
  };
}
