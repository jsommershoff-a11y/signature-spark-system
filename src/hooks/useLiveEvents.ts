import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface LiveEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  duration_minutes: number;
  meeting_url: string | null;
  meeting_provider: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  max_participants: number | null;
  created_by: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  registration_count?: number;
  is_registered?: boolean;
}

export interface TopicSubmission {
  id: string;
  event_id: string;
  user_id: string;
  topic: string;
  description: string | null;
  votes: number;
  status: string;
  submitted_at: string;
}

export function useLiveEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['live-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;

      // Get registrations for current user
      let userRegistrations: string[] = [];
      if (user?.id) {
        const { data: regs } = await supabase
          .from('event_registrations')
          .select('event_id')
          .eq('user_id', user.id);
        userRegistrations = (regs || []).map(r => r.event_id);
      }

      // Get registration counts
      const { data: counts } = await supabase
        .from('event_registrations')
        .select('event_id');

      const countMap: Record<string, number> = {};
      (counts || []).forEach(c => {
        countMap[c.event_id] = (countMap[c.event_id] || 0) + 1;
      });

      return (data || []).map(event => ({
        ...event,
        registration_count: countMap[event.id] || 0,
        is_registered: userRegistrations.includes(event.id),
      })) as LiveEvent[];
    },
    enabled: !!user?.id,
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('event_registrations')
        .insert({ event_id: eventId, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-events'] });
      toast.success('Erfolgreich angemeldet!');
    },
    onError: () => toast.error('Fehler bei der Anmeldung'),
  });

  const unregisterMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-events'] });
      toast.success('Abmeldung erfolgreich');
    },
    onError: () => toast.error('Fehler bei der Abmeldung'),
  });

  const createEventMutation = useMutation({
    mutationFn: async (event: Partial<LiveEvent>) => {
      const { error } = await supabase
        .from('live_events')
        .insert({ ...event, created_by: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-events'] });
      toast.success('Event erstellt!');
    },
    onError: () => toast.error('Fehler beim Erstellen'),
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('live_events')
        .delete()
        .eq('id', eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-events'] });
      toast.success('Event gelöscht');
    },
    onError: () => toast.error('Fehler beim Löschen'),
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    register: registerMutation.mutateAsync,
    unregister: unregisterMutation.mutateAsync,
    createEvent: createEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
  };
}

export function useTopicSubmissions(eventId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const topicsQuery = useQuery({
    queryKey: ['event-topics', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from('event_topic_submissions')
        .select('*')
        .eq('event_id', eventId)
        .order('votes', { ascending: false });
      if (error) throw error;
      return data as TopicSubmission[];
    },
    enabled: !!eventId,
  });

  const submitTopicMutation = useMutation({
    mutationFn: async ({ topic, description }: { topic: string; description?: string }) => {
      if (!eventId) throw new Error('No event selected');
      const { error } = await supabase
        .from('event_topic_submissions')
        .insert({ event_id: eventId, user_id: user!.id, topic, description });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-topics', eventId] });
      toast.success('Thema eingereicht!');
    },
    onError: () => toast.error('Fehler beim Einreichen'),
  });

  return {
    topics: topicsQuery.data || [],
    isLoading: topicsQuery.isLoading,
    submitTopic: submitTopicMutation.mutateAsync,
  };
}
