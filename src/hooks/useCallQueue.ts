import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CallQueue, CallQueueItem, CallQueueItemStatus } from '@/types/automation';

export function useCallQueue() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Get today's call queue for current user
  const todaysQueueQuery = useQuery({
    queryKey: ['call_queue', user?.id, today],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return null;

      const { data, error } = await supabase
        .from('call_queues')
        .select(`
          *,
          items:call_queue_items(
            *,
            lead:crm_leads(
              id,
              first_name,
              last_name,
              company,
              email,
              phone
            )
          )
        `)
        .eq('assigned_to', profile.id)
        .eq('date', today)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      // Sort items by priority_rank
      if (data.items) {
        (data.items as unknown[]).sort((a: unknown, b: unknown) => 
          ((a as { priority_rank: number }).priority_rank || 0) - ((b as { priority_rank: number }).priority_rank || 0)
        );
      }

      return data as unknown as CallQueue;
    },
    enabled: !!user?.id,
  });

  // Get pending items count
  const pendingCount = todaysQueueQuery.data?.items?.filter(
    (item: CallQueueItem) => item.status === 'pending'
  ).length || 0;

  // Mark item as called
  const markAsCalledMutation = useMutation({
    mutationFn: async ({ itemId, outcome }: { itemId: string; outcome?: string }) => {
      const { data, error } = await supabase
        .from('call_queue_items')
        .update({
          status: 'called' as CallQueueItemStatus,
          completed_at: new Date().toISOString(),
          outcome,
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call_queue'] });
    },
  });

  // Skip item
  const skipItemMutation = useMutation({
    mutationFn: async ({ itemId, reason }: { itemId: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('call_queue_items')
        .update({
          status: 'skipped' as CallQueueItemStatus,
          completed_at: new Date().toISOString(),
          outcome: reason,
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call_queue'] });
    },
  });

  // Reschedule item
  const rescheduleItemMutation = useMutation({
    mutationFn: async ({ itemId, newDate }: { itemId: string; newDate: string }) => {
      // First, get the current item
      const { data: currentItem, error: fetchError } = await supabase
        .from('call_queue_items')
        .select('*, queue:call_queues(*)')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;

      // Find or create queue for new date
      let { data: newQueue, error: queueError } = await supabase
        .from('call_queues')
        .select('id')
        .eq('assigned_to', currentItem.queue.assigned_to)
        .eq('date', newDate)
        .single();

      if (queueError && queueError.code === 'PGRST116') {
        // Create new queue for that date
        const { data: createdQueue, error: createError } = await supabase
          .from('call_queues')
          .insert({
            assigned_to: currentItem.queue.assigned_to,
            date: newDate,
            generated_by: 'manual',
          })
          .select()
          .single();

        if (createError) throw createError;
        newQueue = createdQueue;
      } else if (queueError) {
        throw queueError;
      }

      // Update current item to rescheduled
      await supabase
        .from('call_queue_items')
        .update({
          status: 'rescheduled' as CallQueueItemStatus,
          completed_at: new Date().toISOString(),
          outcome: `Verschoben auf ${newDate}`,
        })
        .eq('id', itemId);

      // Create new item in new queue
      const { data, error } = await supabase
        .from('call_queue_items')
        .insert({
          queue_id: newQueue!.id,
          lead_id: currentItem.lead_id,
          priority_rank: 999, // Add to end
          reason: currentItem.reason,
          context_json: currentItem.context_json,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call_queue'] });
    },
  });

  return {
    queue: todaysQueueQuery.data,
    items: todaysQueueQuery.data?.items || [],
    pendingCount,
    isLoading: todaysQueueQuery.isLoading,
    markAsCalled: markAsCalledMutation.mutate,
    skipItem: skipItemMutation.mutate,
    rescheduleItem: rescheduleItemMutation.mutate,
    refetch: () => todaysQueueQuery.refetch(),
  };
}
