import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { 
  Call, 
  CreateCallInput, 
  UpdateCallInput, 
  CallFilters,
  Transcript,
  AiAnalysis
} from '@/types/calls';

export function useCalls(filters?: CallFilters) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['calls', filters],
    queryFn: async () => {
      let query = supabase
        .from('calls')
        .select(`
          *,
          lead:crm_leads(id, first_name, last_name, email, company),
          conductor:profiles!calls_conducted_by_fkey(id, first_name, last_name, full_name)
        `)
        .order('scheduled_at', { ascending: false, nullsFirst: false });

      if (filters?.lead_id) {
        query = query.eq('lead_id', filters.lead_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.conducted_by) {
        query = query.eq('conducted_by', filters.conducted_by);
      }
      if (filters?.from_date) {
        query = query.gte('scheduled_at', filters.from_date);
      }
      if (filters?.to_date) {
        query = query.lte('scheduled_at', filters.to_date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as Call[]) || [];
    },
    enabled: !!profile,
  });

  const calls = data ?? [];

  const createCall = async (input: CreateCallInput): Promise<Call | null> => {
    try {
      const { data: newCall, error } = await supabase
        .from('calls')
        .insert({
          ...input,
          conducted_by: input.conducted_by || profile?.id,
        })
        .select(`
          *,
          lead:crm_leads(id, first_name, last_name, email, company),
          conductor:profiles!calls_conducted_by_fkey(id, first_name, last_name, full_name)
        `)
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['calls'] });
      toast({
        title: 'Call geplant',
        description: 'Der Call wurde erfolgreich angelegt.',
      });
      return newCall as Call;
    } catch (err) {
      console.error('Error creating call:', err);
      toast({
        title: 'Fehler',
        description: 'Call konnte nicht erstellt werden.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateCall = async (input: UpdateCallInput): Promise<Call | null> => {
    try {
      const { id, ...updateData } = input;
      const { data: updatedCall, error } = await supabase
        .from('calls')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          lead:crm_leads(id, first_name, last_name, email, company),
          conductor:profiles!calls_conducted_by_fkey(id, first_name, last_name, full_name)
        `)
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['calls'] });
      return updatedCall as Call;
    } catch (err) {
      console.error('Error updating call:', err);
      toast({
        title: 'Fehler',
        description: 'Call konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const startCall = async (callId: string): Promise<boolean> => {
    const result = await updateCall({
      id: callId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });
    return !!result;
  };

  const endCall = async (callId: string): Promise<boolean> => {
    const call = calls.find(c => c.id === callId);
    const startedAt = call?.started_at ? new Date(call.started_at) : new Date();
    const duration = Math.floor((Date.now() - startedAt.getTime()) / 1000);

    const result = await updateCall({
      id: callId,
      status: 'completed',
      ended_at: new Date().toISOString(),
      duration_seconds: duration,
    });
    return !!result;
  };

  const deleteCall = async (callId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('calls')
        .delete()
        .eq('id', callId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['calls'] });
      toast({
        title: 'Call gelöscht',
        description: 'Der Call wurde erfolgreich gelöscht.',
      });
      return true;
    } catch (err) {
      console.error('Error deleting call:', err);
      toast({
        title: 'Fehler',
        description: 'Call konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    calls,
    loading: isLoading,
    error: error as Error | null,
    refetch,
    createCall,
    updateCall,
    startCall,
    endCall,
    deleteCall,
  };
}

export function useCallDetail(callId: string | undefined) {
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['call-detail', callId],
    queryFn: async () => {
      const [callResult, transcriptResult, analysisResult] = await Promise.all([
        supabase
          .from('calls')
          .select(`
            *,
            lead:crm_leads(id, first_name, last_name, email, company, phone),
            conductor:profiles!calls_conducted_by_fkey(id, first_name, last_name, full_name)
          `)
          .eq('id', callId!)
          .single(),
        supabase
          .from('transcripts')
          .select('*')
          .eq('call_id', callId!)
          .maybeSingle(),
        supabase
          .from('ai_analyses')
          .select('*')
          .eq('call_id', callId!)
          .order('created_at', { ascending: false })
          .maybeSingle(),
      ]);

      if (callResult.error) throw callResult.error;

      const transcript = transcriptResult.data
        ? {
            ...transcriptResult.data,
            segments: transcriptResult.data.segments as unknown as import('@/types/calls').TranscriptSegment[] | undefined,
          } as Transcript
        : null;

      return {
        call: callResult.data as Call,
        transcript,
        analysis: analysisResult.data as unknown as AiAnalysis | null,
      };
    },
    enabled: !!callId,
    meta: {
      onError: () => {
        toast({
          title: 'Fehler',
          description: 'Call-Details konnten nicht geladen werden.',
          variant: 'destructive',
        });
      },
    },
  });

  return {
    call: data?.call ?? null,
    transcript: data?.transcript ?? null,
    analysis: data?.analysis ?? null,
    loading: isLoading,
    refetch,
  };
}
